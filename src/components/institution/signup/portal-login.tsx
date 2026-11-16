"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { routes } from "@/constants/routes";
import { ApiError, listCities, listInstitutionsByPlace, type PublicInstitution } from "@/lib/sems-api";
import type { Institution } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, adminFieldClass } from "../shared/fields";
import { AuthSplit } from "./auth-split";

const institutionTypes: Institution["type"][] = ["School", "Academy", "College"];

export function PortalLogin({ kind }: { kind: "student" | "teacher" }) {
  const router = useRouter();
  const { signInStudent, signInTeacher } = useAdmin();
  const student = kind === "student";
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState<Institution["type"] | "">("");
  const [institutions, setInstitutions] = useState<PublicInstitution[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let ignore = false;
    listCities()
      .then((rows) => {
        if (!ignore) setCities(rows);
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(reason instanceof ApiError ? reason.message : "Could not load cities.");
      })
      .finally(() => {
        if (!ignore) setLoadingCities(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!city || !type) {
      setInstitutions([]);
      setInstitutionId("");
      return;
    }
    let ignore = false;
    setLoadingInstitutions(true);
    setInstitutions([]);
    setInstitutionId("");
    listInstitutionsByPlace(city, type)
      .then((rows) => {
        if (!ignore) setInstitutions(rows);
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(reason instanceof ApiError ? reason.message : "Could not load institutions.");
      })
      .finally(() => {
        if (!ignore) setLoadingInstitutions(false);
      });
    return () => {
      ignore = true;
    };
  }, [city, type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!city || !type || !institutionId) {
      setError("Choose the city, institution type, and institution name.");
      return;
    }
    if (pending) return;
    setPending(true);
    setError(null);
    const result = student ? await signInStudent(identity, password, institutionId) : await signInTeacher(identity, password, institutionId);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(result.href);
  }

  return (
    <AuthSplit
      imageSrc={student ? "/image1.jpeg" : "/image2.jpeg"}
      imageAlt={student ? "Three students holding books in front of a classroom board" : "A teacher and students with books in a classroom"}
      imageSide="left"
      imageKind="login"
    >
      <h1 className="text-xl font-semibold">{student ? "Student portal" : "Teacher login"}</h1>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">
        {student
          ? "Username is the full name from admission. Password is the guardian phone number. Choose the city and campus where this student was added."
          : "Teachers and staff use the email and phone number saved on their form. The phone number is the password. If the owner has enabled location, allow it and sign in from Location 1 or Location 2."}
      </p>
      <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
        <AdminField id="portal-identity" label={student ? "Username" : "Email"}>
          <input
            id="portal-identity"
            type={student ? "text" : "email"}
            required
            autoComplete="username"
            className={adminFieldClass}
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
          />
        </AdminField>
        <AdminField id="portal-password" label="Password">
          <input
            id="portal-password"
            type="password"
            required
            autoComplete="current-password"
            className={adminFieldClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AdminField>
        <AdminField id="portal-city" label="City">
          <select
            id="portal-city"
            required
            className={adminFieldClass}
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setType("");
              setInstitutionId("");
              setError(null);
            }}
          >
            <option value="">{loadingCities ? "Loading cities..." : "Select city"}</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField id="portal-type" label="Institution type">
          <select
            id="portal-type"
            required
            disabled={!city}
            className={adminFieldClass}
            value={type}
            onChange={(event) => {
              setType(event.target.value as Institution["type"]);
              setInstitutionId("");
              setError(null);
            }}
          >
            <option value="">Select institution type</option>
            {institutionTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField id="portal-institution" label="Institution name" error={error ?? undefined}>
          <select
            id="portal-institution"
            required
            disabled={!city || !type || loadingInstitutions}
            className={adminFieldClass}
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
          >
            <option value="">
              {loadingInstitutions ? "Loading institutions..." : city && type && institutions.length === 0 ? "No institution found" : "Select institution name"}
            </option>
            {institutions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminButton type="submit" disabled={pending}>{pending ? "Logging in..." : "Log in"}</AdminButton>
      </form>
      <p className="mt-6 border-t border-[var(--admin-line)] pt-5 text-sm text-[var(--admin-muted)]">
        <Link href={routes.home} className="font-semibold text-[var(--admin-accent)]">
          Back to home
        </Link>
      </p>
    </AuthSplit>
  );
}
