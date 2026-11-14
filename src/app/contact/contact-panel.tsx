"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { loadPublicContactPage, type PlatformContactPage } from "@/lib/platformadmin-api";

const fallback: PlatformContactPage = {
  email: siteConfig.contact.email,
  whatsapp: siteConfig.contact.whatsapp,
  phone: siteConfig.contact.phone,
  hours: siteConfig.contact.supportHours,
  city: siteConfig.contact.city,
  instagram: "https://www.instagram.com/smarteducation",
  facebook: "https://www.facebook.com/smarteducation",
  tiktok: "https://www.tiktok.com/@smarteducation",
  placeholder: siteConfig.contact.isPlaceholder,
};

function webHref(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) ? text : "";
}

function whatsappHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function ContactPanel() {
  const [details, setDetails] = useState<PlatformContactPage>(fallback);

  useEffect(() => {
    let active = true;
    loadPublicContactPage()
      .then((next) => {
        if (active) setDetails(next);
      })
      .catch(() => {
        // The printed details stay in place if the server cannot be reached.
      });
    return () => {
      active = false;
    };
  }, []);

  const channels = [
    { label: "Email", value: details.email, href: details.email ? `mailto:${details.email}` : "" },
    { label: "WhatsApp", value: details.whatsapp, href: whatsappHref(details.whatsapp) },
    { label: "Phone", value: details.phone, href: details.phone ? `tel:${details.phone.replace(/\s/g, "")}` : "" },
  ].filter((channel) => channel.value && channel.href);
  const follow = [
    { label: "Instagram", href: webHref(details.instagram) },
    { label: "Facebook", href: webHref(details.facebook) },
    { label: "TikTok", href: webHref(details.tiktok) },
    { label: "WhatsApp", href: whatsappHref(details.whatsapp) },
  ].filter((item) => item.href);

  return (
    <aside className="space-y-4">
      <dl className="divide-y divide-stone rounded-[1.75rem] bg-paper/80 px-6">
        {channels.map((channel) => (
          <div key={channel.label} className="flex flex-wrap items-center justify-between gap-2 py-4">
            <dt className="eyebrow text-muted">{channel.label}</dt>
            <dd className="min-w-0 text-right">
              <a href={channel.href} className="break-words underline-offset-4 hover:underline">
                {channel.value}
              </a>
            </dd>
          </div>
        ))}
        {details.hours ? (
          <div className="flex flex-wrap items-center justify-between gap-2 py-4">
            <dt className="eyebrow text-muted">Hours</dt>
            <dd className="min-w-0 text-right text-sm break-words">{details.hours}</dd>
          </div>
        ) : null}
        {details.city ? (
          <div className="flex flex-wrap items-center justify-between gap-2 py-4">
            <dt className="eyebrow text-muted">Based in</dt>
            <dd className="min-w-0 text-right text-sm break-words">{details.city}</dd>
          </div>
        ) : null}
      </dl>
      {follow.length > 0 ? (
        <div>
          <p className="eyebrow text-muted">Follow us</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {follow.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-stone px-4 text-sm hover:border-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-sm text-muted">
        Looking for a quick answer? Visit our{" "}
        <Link href={routes.faq} className="text-ink underline underline-offset-4">
          FAQ
        </Link>
        .
      </p>
    </aside>
  );
}
