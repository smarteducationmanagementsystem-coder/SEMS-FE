"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminField, adminFieldClass } from "@/components/institution/shared/fields";
import { ApiError } from "@/lib/sems-api";
import { loadPlatformAccount, loadPublicContactPage, loadPublicFooter, savePlatformAccount, savePlatformContactPage, savePlatformFooter, type PlatformContactPage, type PlatformFooter } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";
import { LandingImages } from "./landing-images";

const emptyFooter: PlatformFooter = {
  blurb: "",
  email: "",
  phone: "",
  hours: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  whatsapp: "",
};

const emptyContact: Omit<PlatformContactPage, "placeholder"> = {
  email: "",
  whatsapp: "",
  phone: "",
  hours: "",
  city: "",
  instagram: "",
  facebook: "",
  tiktok: "",
};

export function PlatformSettings() {
  const token = usePlatformAdminToken();
  const [tab, setTab] = useState<"account" | "footer" | "contact" | "landing">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [footer, setFooter] = useState<PlatformFooter>(emptyFooter);
  const [footerError, setFooterError] = useState("");
  const [footerNotice, setFooterNotice] = useState("");
  const [footerBusy, setFooterBusy] = useState(false);
  const [contact, setContact] = useState(emptyContact);
  const [contactError, setContactError] = useState("");
  const [contactNotice, setContactNotice] = useState("");
  const [contactBusy, setContactBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadPlatformAccount(token)
      .then((account) => {
        if (active) setEmail(account.email);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load the account.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    loadPublicFooter()
      .then((next) => {
        if (active) setFooter(next);
      })
      .catch((reason: unknown) => {
        if (active) setFooterError(reason instanceof ApiError ? reason.message : "Could not load the footer.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadPublicContactPage()
      .then((next) => {
        if (!active) return;
        setContact({
          email: next.email,
          whatsapp: next.whatsapp,
          phone: next.phone,
          hours: next.hours,
          city: next.city,
          instagram: next.instagram,
          facebook: next.facebook,
          tiktok: next.tiktok,
        });
      })
      .catch((reason: unknown) => {
        if (active) setContactError(reason instanceof ApiError ? reason.message : "Could not load the contact page.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await savePlatformAccount(token, { email, password, currentPassword });
      setEmail(saved.email);
      setPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setNotice("Account updated. Use this email and password the next time you sign in.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not update the account.");
    } finally {
      setBusy(false);
    }
  }

  async function saveFooter(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setFooterBusy(true);
    setFooterError("");
    setFooterNotice("");
    try {
      const saved = await savePlatformFooter(token, footer);
      setFooter(saved);
      setFooterNotice("Footer updated. The public site now shows these details.");
    } catch (reason) {
      setFooterError(reason instanceof ApiError ? reason.message : "Could not update the footer.");
    } finally {
      setFooterBusy(false);
    }
  }

  async function saveContact(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setContactBusy(true);
    setContactError("");
    setContactNotice("");
    try {
      const saved = await savePlatformContactPage(token, contact);
      setContact({
        email: saved.email,
        whatsapp: saved.whatsapp,
        phone: saved.phone,
        hours: saved.hours,
        city: saved.city,
        instagram: saved.instagram,
        facebook: saved.facebook,
        tiktok: saved.tiktok,
      });
      setContactNotice("Contact page updated. Visitors now see these details.");
    } catch (reason) {
      setContactError(reason instanceof ApiError ? reason.message : "Could not update the contact page.");
    } finally {
      setContactBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words">Setting</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">Update the platform admin sign-in, the public footer, the contact page, or the landing images.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Settings">
        {(
          [
            ["account", "Account"],
            ["footer", "Footer"],
            ["contact", "Contact"],
            ["landing", "Landing"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={tab === id ? "rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-lg px-4 py-2 text-sm font-semibold ring-1 ring-[var(--admin-line)]"}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "landing" ? (
        <LandingImages token={token} />
      ) : tab === "contact" ? (
        <form className="grid max-w-xl gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]" onSubmit={saveContact}>
          <p className="text-sm text-[var(--admin-muted)]">These details appear in the card on the public Contact page.</p>
          <AdminField id="contact-email" label="Email">
            <input id="contact-email" type="email" required className={adminFieldClass} value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
          </AdminField>
          <AdminField id="contact-whatsapp" label="WhatsApp">
            <input id="contact-whatsapp" required className={adminFieldClass} value={contact.whatsapp} placeholder="+92 300 555 0142" onChange={(event) => setContact({ ...contact, whatsapp: event.target.value })} />
          </AdminField>
          <AdminField id="contact-phone" label="Phone">
            <input id="contact-phone" required className={adminFieldClass} value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
          </AdminField>
          <AdminField id="contact-hours" label="Hours">
            <input id="contact-hours" required className={adminFieldClass} value={contact.hours} onChange={(event) => setContact({ ...contact, hours: event.target.value })} />
          </AdminField>
          <AdminField id="contact-city" label="Based in">
            <input id="contact-city" required className={adminFieldClass} value={contact.city} onChange={(event) => setContact({ ...contact, city: event.target.value })} />
          </AdminField>
          <p className="text-sm font-semibold">Follow us</p>
          <AdminField id="contact-instagram" label="Instagram">
            <input id="contact-instagram" type="url" className={adminFieldClass} value={contact.instagram} placeholder="https://www.instagram.com/..." onChange={(event) => setContact({ ...contact, instagram: event.target.value })} />
          </AdminField>
          <AdminField id="contact-facebook" label="Facebook">
            <input id="contact-facebook" type="url" className={adminFieldClass} value={contact.facebook} placeholder="https://www.facebook.com/..." onChange={(event) => setContact({ ...contact, facebook: event.target.value })} />
          </AdminField>
          <AdminField id="contact-tiktok" label="TikTok">
            <input id="contact-tiktok" type="url" className={adminFieldClass} value={contact.tiktok} placeholder="https://www.tiktok.com/..." onChange={(event) => setContact({ ...contact, tiktok: event.target.value })} />
          </AdminField>
          {contactNotice ? <p className="text-sm text-[#1f7a45]">{contactNotice}</p> : null}
          {contactError ? <p className="text-sm text-[#a3361f]">{contactError}</p> : null}
          <div>
            <AdminButton type="submit" disabled={contactBusy}>
              {contactBusy ? "Saving…" : "Save contact"}
            </AdminButton>
          </div>
        </form>
      ) : tab === "footer" ? (
        <form className="grid max-w-xl gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]" onSubmit={saveFooter}>
          <AdminField id="footer-blurb" label="Description">
            <textarea id="footer-blurb" required rows={4} className={adminFieldClass} value={footer.blurb} onChange={(event) => setFooter({ ...footer, blurb: event.target.value })} />
          </AdminField>
          <AdminField id="footer-email" label="Email">
            <input id="footer-email" type="email" required className={adminFieldClass} value={footer.email} onChange={(event) => setFooter({ ...footer, email: event.target.value })} />
          </AdminField>
          <AdminField id="footer-phone" label="Phone">
            <input id="footer-phone" required className={adminFieldClass} value={footer.phone} onChange={(event) => setFooter({ ...footer, phone: event.target.value })} />
          </AdminField>
          <AdminField id="footer-hours" label="Hours">
            <input id="footer-hours" className={adminFieldClass} value={footer.hours} onChange={(event) => setFooter({ ...footer, hours: event.target.value })} />
          </AdminField>
          <p className="text-sm font-semibold">Elsewhere</p>
          <AdminField id="footer-tiktok" label="TikTok">
            <input id="footer-tiktok" type="url" className={adminFieldClass} value={footer.tiktok} placeholder="https://www.tiktok.com/..." onChange={(event) => setFooter({ ...footer, tiktok: event.target.value })} />
          </AdminField>
          <AdminField id="footer-whatsapp" label="WhatsApp button">
            <input id="footer-whatsapp" className={adminFieldClass} value={footer.whatsapp} placeholder="+92 300 555 0142" onChange={(event) => setFooter({ ...footer, whatsapp: event.target.value })} />
          </AdminField>
          <p className="-mt-1 text-xs text-[var(--admin-muted)]">This number opens the green button on the public site. Leave it empty to hide the button.</p>
          <AdminField id="footer-instagram" label="Instagram">
            <input id="footer-instagram" type="url" className={adminFieldClass} value={footer.instagram} placeholder="https://www.instagram.com/..." onChange={(event) => setFooter({ ...footer, instagram: event.target.value })} />
          </AdminField>
          <AdminField id="footer-facebook" label="Facebook">
            <input id="footer-facebook" type="url" className={adminFieldClass} value={footer.facebook} placeholder="https://www.facebook.com/..." onChange={(event) => setFooter({ ...footer, facebook: event.target.value })} />
          </AdminField>
          {footerNotice ? <p className="text-sm text-[#1f7a45]">{footerNotice}</p> : null}
          {footerError ? <p className="text-sm text-[#a3361f]">{footerError}</p> : null}
          <div>
            <AdminButton type="submit" disabled={footerBusy}>
              {footerBusy ? "Saving…" : "Save footer"}
            </AdminButton>
          </div>
        </form>
      ) : (
      <form className="grid max-w-xl gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]" onSubmit={submit}>
        <AdminField id="settings-email" label="Email">
          <input id="settings-email" type="email" required className={adminFieldClass} value={email} onChange={(event) => setEmail(event.target.value)} />
        </AdminField>
        <AdminField id="settings-password" label="New password">
          <input id="settings-password" type="password" autoComplete="new-password" minLength={8} className={adminFieldClass} value={password} placeholder="Leave blank to keep the current password" onChange={(event) => setPassword(event.target.value)} />
        </AdminField>
        <AdminField id="settings-confirm" label="Confirm new password">
          <input id="settings-confirm" type="password" autoComplete="new-password" className={adminFieldClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </AdminField>
        <AdminField id="settings-current" label="Current password">
          <input id="settings-current" type="password" required autoComplete="current-password" className={adminFieldClass} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </AdminField>
        {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
        {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
        <div>
          <AdminButton type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save account"}
          </AdminButton>
        </div>
      </form>
      )}
    </div>
  );
}
