"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { plans as fallbackPlans } from "@/config/platform";
import { ApiError } from "@/lib/sems-api";
import { loadPublicPricing, type PricingPayment, type PricingPlan } from "@/lib/platformadmin-api";

const fallback: PricingPlan[] = fallbackPlans.map((plan) => ({
  name: plan.name,
  audience: plan.audience,
  price: plan.price,
  period: plan.period,
  points: [...plan.points],
  featured: plan.featured,
  buttonLabel: "Get started",
}));

export function PricingBoard() {
  const [plans, setPlans] = useState<PricingPlan[]>(fallback);
  const [payment, setPayment] = useState<PricingPayment>({ accountName: "", accountNumber: "", detail: "" });
  const [open, setOpen] = useState<PricingPlan | null>(null);

  useEffect(() => {
    let active = true;
    loadPublicPricing()
      .then((next) => {
        if (!active) return;
        setPlans(next.plans);
        setPayment(next.payment);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        if (!(reason instanceof ApiError)) return;
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hasPayment = Boolean(payment.accountName || payment.accountNumber || payment.detail);

  return (
    <>
      <ul className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <li key={plan.name} className={plan.featured ? "rounded-[1.75rem] bg-ink p-6 text-ivory" : "rounded-[1.75rem] bg-paper p-6 ring-1 ring-stone"}>
            {plan.audience ? <p className={plan.featured ? "eyebrow text-lime" : "eyebrow text-muted"}>{plan.audience}</p> : null}
            <h2 className="mt-4 font-display text-4xl break-words">{plan.name}</h2>
            <p className="mt-4 font-display text-4xl break-words">{plan.price}</p>
            {plan.period ? <p className={plan.featured ? "text-sm text-ivory/60" : "text-sm text-muted"}>{plan.period}</p> : null}
            <ul className="mt-6 space-y-2 text-sm">
              {plan.points.map((point) => (
                <li key={point} className="break-words">
                  {point}
                </li>
              ))}
            </ul>
            <Button variant={plan.featured ? "accent" : "outline"} wrapperClassName="mt-8" withArrow onClick={() => setOpen(plan)}>
              {plan.buttonLabel}
            </Button>
          </li>
        ))}
      </ul>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
          <button type="button" className="absolute inset-0 bg-ink/55" aria-label="Close payment details" onClick={() => setOpen(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby="pricing-payment-title" className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] bg-paper p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="pricing-payment-title" className="font-display text-3xl break-words">
                Pay for {open.name}
              </h2>
              <button type="button" className="shrink-0 text-sm text-muted" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
            {hasPayment ? (
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl bg-ivory px-4 py-3">
                  <dt className="eyebrow text-muted">Account name</dt>
                  <dd className="mt-1 break-words font-medium">{payment.accountName || "—"}</dd>
                </div>
                <div className="rounded-2xl bg-ivory px-4 py-3">
                  <dt className="eyebrow text-muted">Account number</dt>
                  <dd className="mt-1 break-all font-medium">{payment.accountNumber || "—"}</dd>
                </div>
                <div className="rounded-2xl bg-ivory px-4 py-3">
                  <dt className="eyebrow text-muted">Detail</dt>
                  <dd className="mt-1 break-words whitespace-pre-wrap">{payment.detail || "—"}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-5 text-sm text-muted">Payment details have not been published yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
