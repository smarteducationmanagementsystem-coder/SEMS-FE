"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/constants/routes";
import { demoCampusPassword } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, adminFieldClass } from "../shared/fields";
import { AuthSplit } from "./auth-split";

export function InstitutionLogin() {
  const router = useRouter();
  const { signIn } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const message = await signIn(email, password);
    setPending(false);
    setError(message);
    if (!message) router.push(routes.admin);
  }

  return (
    <AuthSplit imageSrc="/image1.jpeg" imageAlt="Three students holding books in front of a classroom board" imageSide="left">
          <h1 className="text-xl font-semibold">Login</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">Sign in with the email for your institution. You will land on that campus dashboard.</p>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <AdminField id="login-email" label="Email">
              <input id="login-email" type="email" required autoComplete="username" className={adminFieldClass} value={email} onChange={(event) => setEmail(event.target.value)} />
            </AdminField>
            <AdminField id="login-password" label="Password" error={error ?? undefined}>
              <input id="login-password" type="password" required autoComplete="current-password" className={adminFieldClass} value={password} onChange={(event) => setPassword(event.target.value)} />
            </AdminField>
            <AdminButton type="submit" disabled={pending}>{pending ? "Logging in..." : "Log in"}</AdminButton>
            <p className="text-xs text-[var(--admin-muted)]">Existing campuses, such as office@northline.edu, use the password {demoCampusPassword}.</p>
          </form>
          <p className="mt-6 border-t border-[var(--admin-line)] pt-5 text-sm text-[var(--admin-muted)]">
            New campus?{" "}
            <Link href={routes.signup} className="font-semibold text-[var(--admin-accent)]">
              Institution signup
            </Link>
          </p>
    </AuthSplit>
  );
}
