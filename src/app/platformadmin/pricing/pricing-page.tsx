"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminField, adminFieldClass } from "@/components/institution/shared/fields";
import { ApiError } from "@/lib/sems-api";
import { loadPublicPricing, savePlatformPricing, type PlatformPricing, type PricingPlan } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const emptyPlan = (): PricingPlan => ({ name: "", audience: "", price: "", period: "", points: [], featured: false, buttonLabel: "Get started" });

function blankPricing(): PlatformPricing {
  return { plans: [emptyPlan(), emptyPlan(), emptyPlan()], payment: { accountName: "", accountNumber: "", detail: "" } };
}

export function PlatformPricingPage() {
  const token = usePlatformAdminToken();
  const [draft, setDraft] = useState<PlatformPricing>(blankPricing);
  const [pointsText, setPointsText] = useState(["", "", ""]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    loadPublicPricing()
      .then((next) => {
        if (!active) return;
        // Nothing saved yet: keep the three empty cards so they can be filled in.
        const loaded = next.plans.length === 3 ? next : { ...next, plans: blankPricing().plans };
        setDraft(loaded);
        setPointsText(loaded.plans.map((plan) => plan.points.join("\n")));
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load pricing.");
      });
    return () => {
      active = false;
    };
  }, []);

  function updatePlan(index: number, patch: Partial<PricingPlan>) {
    setDraft((current) => ({
      ...current,
      plans: current.plans.map((plan, planIndex) => (planIndex === index ? { ...plan, ...patch } : plan)),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    setError("");
    setNotice("");
    const body: PlatformPricing = {
      ...draft,
      plans: draft.plans.map((plan, index) => ({
        ...plan,
        points: pointsText[index]
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      })),
    };
    try {
      const saved = await savePlatformPricing(token, body);
      setDraft(saved);
      setPointsText(saved.plans.map((plan) => plan.points.join("\n")));
      setNotice("Pricing saved. The public page now shows these cards and payment details.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not save pricing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Billing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words text-[var(--admin-text)]">Pricing</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--admin-muted)]">These three cards appear on the public pricing page. Get started opens the account name, account number, and detail saved below.</p>
      </div>
      <form className="grid min-w-0 gap-4" onSubmit={submit}>
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {draft.plans.map((plan, index) => (
            <section key={index} className="grid min-w-0 content-start gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
              <h2 className="text-sm font-semibold text-[var(--admin-text)]">Card {index + 1}</h2>
              <AdminField id={`plan-audience-${index}`} label="Audience">
                <input id={`plan-audience-${index}`} className={adminFieldClass} value={plan.audience} onChange={(event) => updatePlan(index, { audience: event.target.value })} />
              </AdminField>
              <AdminField id={`plan-name-${index}`} label="Name">
                <input id={`plan-name-${index}`} required className={adminFieldClass} value={plan.name} onChange={(event) => updatePlan(index, { name: event.target.value })} />
              </AdminField>
              <AdminField id={`plan-price-${index}`} label="Price">
                <input id={`plan-price-${index}`} required className={adminFieldClass} value={plan.price} onChange={(event) => updatePlan(index, { price: event.target.value })} />
              </AdminField>
              <AdminField id={`plan-period-${index}`} label="Period">
                <input id={`plan-period-${index}`} className={adminFieldClass} value={plan.period} onChange={(event) => updatePlan(index, { period: event.target.value })} />
              </AdminField>
              <AdminField id={`plan-points-${index}`} label="Points, one per line">
                <textarea id={`plan-points-${index}`} rows={5} className={`${adminFieldClass} resize-y`} value={pointsText[index] ?? ""} onChange={(event) => setPointsText((current) => current.map((text, textIndex) => (textIndex === index ? event.target.value : text)))} />
              </AdminField>
              <AdminField id={`plan-button-${index}`} label="Button label">
                <input id={`plan-button-${index}`} required className={adminFieldClass} value={plan.buttonLabel} onChange={(event) => updatePlan(index, { buttonLabel: event.target.value })} />
              </AdminField>
              <label className="flex min-w-0 items-center gap-2 text-sm text-[var(--admin-text)]">
                <input type="checkbox" className="size-4 shrink-0 accent-[var(--admin-accent)]" checked={plan.featured} onChange={(event) => updatePlan(index, { featured: event.target.checked })} />
                <span className="min-w-0">Highlight this card</span>
              </label>
            </section>
          ))}
        </div>
        <section className="min-w-0 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
          <h2 className="text-sm font-semibold text-[var(--admin-text)]">Payment account</h2>
          <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            <AdminField id="payment-name" label="Account name">
              <input id="payment-name" className={adminFieldClass} value={draft.payment.accountName} onChange={(event) => setDraft({ ...draft, payment: { ...draft.payment, accountName: event.target.value } })} />
            </AdminField>
            <AdminField id="payment-number" label="Account number">
              <input id="payment-number" className={adminFieldClass} value={draft.payment.accountNumber} onChange={(event) => setDraft({ ...draft, payment: { ...draft.payment, accountNumber: event.target.value } })} />
            </AdminField>
            <div className="min-w-0 sm:col-span-2">
              <AdminField id="payment-detail" label="Detail">
                <textarea id="payment-detail" rows={4} className={`${adminFieldClass} resize-y`} value={draft.payment.detail} onChange={(event) => setDraft({ ...draft, payment: { ...draft.payment, detail: event.target.value } })} />
              </AdminField>
            </div>
          </div>
        </section>
        {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
        {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
        <div>
          <AdminButton type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save pricing"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
