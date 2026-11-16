"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { AdminButton } from "@/components/institution/shared/fields";
import { ApiError } from "@/lib/sems-api";
import { loadPublicLanding, removePlatformLandingImage, uploadPlatformLandingImage, type LandingSlot, type PlatformLanding } from "@/lib/platformadmin-api";

const slots: { slot: LandingSlot; field: keyof PlatformLanding; label: string; hint: string }[] = [
  { slot: "signupimage", field: "signupImage", label: "Signup image", hint: "The photo beside the institution signup form." },
  { slot: "loginimage", field: "loginImage", label: "Login image", hint: "The photo beside the institution, student, teacher, and platform admin login forms." },
  { slot: "logoimage", field: "logoImage", label: "Logo image", hint: "The logo above the login and signup forms." },
  { slot: "aboutimage", field: "aboutImage", label: "About image", hint: "The round photo on the public About page." },
];

export function LandingImages({ token }: { token: string | null }) {
  const [landing, setLanding] = useState<PlatformLanding | null>(null);
  const [busySlot, setBusySlot] = useState<LandingSlot | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    loadPublicLanding()
      .then((next) => {
        if (active) setLanding(next);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load the landing images.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function choose(slot: LandingSlot, label: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;
    setBusySlot(slot);
    setError("");
    setNotice("");
    try {
      setLanding(await uploadPlatformLandingImage(token, slot, file));
      setNotice(`${label} updated. The public site now shows it.`);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not upload the image.");
    } finally {
      setBusySlot(null);
    }
  }

  async function remove(slot: LandingSlot, label: string) {
    if (!token) return;
    setBusySlot(slot);
    setError("");
    setNotice("");
    try {
      setLanding(await removePlatformLandingImage(token, slot));
      setNotice(`${label} removed. The site shows its built-in image again.`);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not remove the image.");
    } finally {
      setBusySlot(null);
    }
  }

  return (
    <div className="grid min-w-0 gap-4">
      <p className="max-w-2xl text-sm text-[var(--admin-muted)]">
        These images appear on the public login, signup, and About pages. Until you upload one, the site keeps its built-in image. Use a picture smaller than 5 MB.
      </p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {slots.map(({ slot, field, label, hint }) => {
          const url = landing?.[field] ?? "";
          const busy = busySlot === slot;
          return (
            <section key={slot} className="grid min-w-0 content-start gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold break-words">{label}</h2>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">{hint}</p>
              </div>
              <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[var(--admin-bg)] ring-1 ring-[var(--admin-line)]">
                {url ? (
                  <Image src={url} alt={label} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-contain" />
                ) : (
                  <p className="grid h-full place-items-center px-3 text-center text-xs text-[var(--admin-muted)]">Not uploaded. The site shows its built-in image.</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className={`inline-flex cursor-pointer items-center rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white focus-within:ring-2 focus-within:ring-[var(--admin-accent)] focus-within:ring-offset-2 ${busy ? "pointer-events-none opacity-60" : ""}`}>
                  {busy ? "Working…" : url ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" className="sr-only" disabled={busy || !token} onChange={(event) => void choose(slot, label, event)} />
                </label>
                {url ? (
                  <AdminButton type="button" disabled={busy} className="!bg-transparent !text-[var(--admin-text)] ring-1 ring-[var(--admin-line)]" onClick={() => void remove(slot, label)}>
                    Remove
                  </AdminButton>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
    </div>
  );
}
