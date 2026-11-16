"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthSplit } from "@/components/institution/signup/auth-split";
import { AdminButton, AdminField, adminFieldClass } from "@/components/institution/shared/fields";
import { routes } from "@/constants/routes";
import { signInPlatformAdmin, usePlatformAdminSession } from "./session";

export function PlatformLogin() {
  const router = useRouter();
  const signedIn = usePlatformAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (signedIn) router.replace(routes.platformDashboard);
  }, [signedIn, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const message = await signInPlatformAdmin(email, password);
    setError(message);
    setPending(false);
    if (!message) router.push(routes.platformDashboard);
  }

  if (signedIn) return null;

  return (
    <AuthSplit imageSrc="/image1.jpeg" imageAlt="Students in a classroom" imageSide="left" imageKind="login">
      <h1 className="text-xl font-semibold">Platform admin</h1>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">Sign in to manage every registered institution.</p>
      <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
        <AdminField id="platform-email" label="Email">
          <input id="platform-email" type="email" required autoComplete="username" className={adminFieldClass} value={email} onChange={(event) => setEmail(event.target.value)} />
        </AdminField>
        <AdminField id="platform-password" label="Password" error={error ?? undefined}>
          <input id="platform-password" type="password" required autoComplete="current-password" className={adminFieldClass} value={password} onChange={(event) => setPassword(event.target.value)} />
        </AdminField>
        <AdminButton type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Log in"}
        </AdminButton>
      </form>
    </AuthSplit>
  );
}
