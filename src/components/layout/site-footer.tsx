"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siWhatsapp } from "simple-icons";
import { footerNavigation } from "@/config/navigation";
import { loadPublicFooter, type PlatformFooter } from "@/lib/platformadmin-api";

const footerLinkClasses = "text-ivory/80 transition-colors duration-300 hover:text-[#7eb6ff]";

const fallback: PlatformFooter = {
  blurb: "Transforming Schools, Colleges, and Academies Through Pakistan's Smartest Education Management System.",
  email: "hello@smarteducation.example",
  phone: "+92 300 555 0142",
  hours: "Monday to Saturday, 9am to 6pm PKT",
  instagram: "https://www.instagram.com/smarteducation",
  facebook: "https://www.facebook.com/smarteducation",
  tiktok: "https://www.tiktok.com/@smarteducation",
  whatsapp: "+92 300 555 0142",
};

function linkHref(kind: "web" | "whatsapp", value: string) {
  const text = value.trim();
  if (!text) return "";
  if (kind === "whatsapp") {
    if (/^https?:\/\//i.test(text)) return text;
    const digits = text.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "";
  }
  return /^https?:\/\//i.test(text) ? text : "";
}

export function SiteFooter() {
  const [footer, setFooter] = useState<PlatformFooter>(fallback);
  const quickLinks = footerNavigation.find((group) => group.title === "Quick links");
  const institution = footerNavigation.find((group) => group.title === "Institution");
  const elsewhere = [
    { label: "TikTok", href: linkHref("web", footer.tiktok) },
    { label: "WhatsApp", href: linkHref("whatsapp", footer.whatsapp) },
    { label: "Instagram", href: linkHref("web", footer.instagram) },
    { label: "Facebook", href: linkHref("web", footer.facebook) },
  ].filter((item) => item.href);

  useEffect(() => {
    let active = true;
    loadPublicFooter()
      .then((next) => {
        if (active) setFooter(next);
      })
      .catch(() => {
        // The printed footer stays on the last known details if the server cannot be reached.
      });
    return () => {
      active = false;
    };
  }, []);

  const whatsappHref = linkHref("whatsapp", footer.whatsapp);

  return (
    <>
    <footer className="relative z-40 mt-4 w-full min-w-0 overflow-hidden rounded-t-[2rem] bg-ink text-ivory sm:mt-6 sm:rounded-t-[3rem]">
      <div className="page-container py-14 sm:py-16">
        <div className="grid w-full items-start gap-12 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <div className="inline-flex max-w-full rounded-2xl bg-[#eef4fc] p-3 sm:p-4">
              <Image
                src="/brand/sems-lockup-blue.png"
                alt="Smart Education Management System. Learn. Manage. Grow."
                width={1024}
                height={245}
                className="h-16 w-auto max-w-full sm:h-20"
              />
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/70">{footer.blurb}</p>
          </div>

          <div className="grid min-w-0 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <nav aria-label="Quick links">
              <p className="eyebrow text-ivory/45">Quick links</p>
              <ul className="mt-5 space-y-3 text-sm">
                {quickLinks?.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={footerLinkClasses}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {institution ? (
                <ul className="mt-3 space-y-3 text-sm">
                  {institution.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={footerLinkClasses}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </nav>

            <div>
              <p className="eyebrow text-ivory/45">Say hello</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a href={`mailto:${footer.email}`} className={`${footerLinkClasses} break-all`}>
                    {footer.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${footer.phone.replace(/\s/g, "")}`} className={footerLinkClasses}>
                    {footer.phone}
                  </a>
                </li>
                <li className="break-words text-ivory/50">{footer.hours}</li>
              </ul>
            </div>

            <nav aria-label="Elsewhere" className="sm:col-span-2 lg:col-span-1">
              <p className="eyebrow text-ivory/45">Elsewhere</p>
              <ul className="mt-5 space-y-3 text-sm">
                {elsewhere.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className={footerLinkClasses}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
    {whatsappHref ? (
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-12px_rgba(18,140,80,0.9)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-current">
          <path d={siWhatsapp.path} />
        </svg>
      </a>
    ) : null}
    </>
  );
}
