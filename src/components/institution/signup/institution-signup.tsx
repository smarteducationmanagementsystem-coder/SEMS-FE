"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/constants/routes";
import type { Institution } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, adminFieldClass } from "../shared/fields";
import { AuthSplit } from "./auth-split";

export function InstitutionSignup() {
  const router = useRouter();
  const { signUp } = useAdmin();
  const [ownerName, setOwnerName] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Lahore");
  const [type, setType] = useState<Institution["type"]>("School");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setSignUpError(null);
    const message = await signUp({ ownerName, name, city, type, email: signupEmail, password: signupPassword });
    setPending(false);
    setSignUpError(message);
    if (!message) router.push(routes.admin);
  }

  return (
    <AuthSplit imageSrc="/image2.jpeg" imageAlt="A teacher and students with books in a classroom" imageSide="right">
          <h1 className="text-xl font-semibold">Institution signup</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">The owner name is this campus Super Admin. The institution name is the account students, teachers, staff, attendance, fees, exams, results, and reports open inside.</p>
          <form className="mt-5 grid gap-3" onSubmit={handleSignUp}>
            <AdminField id="signup-owner" label="Owner name">
              <input id="signup-owner" required className={adminFieldClass} value={ownerName} onChange={(event) => setOwnerName(event.target.value)} />
            </AdminField>
            <AdminField id="signup-name" label="Institution name">
              <input id="signup-name" required className={adminFieldClass} value={name} onChange={(event) => setName(event.target.value)} />
            </AdminField>
            <AdminField id="signup-city" label="City">
              <input id="signup-city" className={adminFieldClass} value={city} onChange={(event) => setCity(event.target.value)} />
            </AdminField>
            <AdminField id="signup-type" label="Type">
              <select id="signup-type" className={adminFieldClass} value={type} onChange={(event) => setType(event.target.value as Institution["type"])}>
                <option>School</option>
                <option>College</option>
                <option>Academy</option>
              </select>
            </AdminField>
            <AdminField id="signup-email" label="Email">
              <input id="signup-email" type="email" required className={adminFieldClass} value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} />
            </AdminField>
            <AdminField id="signup-password" label="Password" error={signUpError ?? undefined}>
              <input id="signup-password" type="password" required minLength={4} className={adminFieldClass} value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} />
            </AdminField>
            <AdminButton type="submit" disabled={pending}>{pending ? "Creating..." : "Create institution"}</AdminButton>
          </form>
          <p className="mt-6 border-t border-[var(--admin-line)] pt-5 text-sm text-[var(--admin-muted)]">
            Already have an institution?{" "}
            <Link href={routes.login} className="font-semibold text-[var(--admin-accent)]">
              Log in
            </Link>
          </p>
    </AuthSplit>
  );
}
