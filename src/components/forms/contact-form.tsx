"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { classNames } from "@/lib/format";
import { ApiError } from "@/lib/sems-api";
import { submitContactMessage } from "@/lib/platformadmin-api";
import { contactSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { FormField } from "./form-field";

type ContactFormValues = z.input<typeof contactSchema>;

const emptyContactForm: ContactFormValues = { name: "", email: "", institution: "", message: "" };

/** Contact form. Messages are saved for the platform admin Contact us page. */
export function ContactForm() {
  const [formValues, setFormValues] = useState<ContactFormValues>(emptyContactForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ContactFormValues>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(fieldName: keyof ContactFormValues, value: string) {
    setFormValues((current) => ({ ...current, [fieldName]: value }));
    setFieldErrors((current) => ({ ...current, [fieldName]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = contactSchema.safeParse(formValues);
    if (!result.success) {
      setFieldErrors(toFieldErrors<ContactFormValues>(result.error));
      setIsSubmitted(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submitContactMessage(result.data);
      setIsSubmitted(true);
      setFormValues(emptyContactForm);
    } catch (reason) {
      setIsSubmitted(false);
      setError(reason instanceof ApiError ? reason.message : "Could not send the message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label={`Request a ${siteConfig.name} demo`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="contact-name" label="Name" error={fieldErrors.name}>
          {(fieldProps) => <input {...fieldProps} autoComplete="name" value={formValues.name} onChange={(event) => updateField("name", event.target.value)} />}
        </FormField>
        <FormField id="contact-email" label="Email" error={fieldErrors.email}>
          {(fieldProps) => (
            <input {...fieldProps} type="email" autoComplete="email" value={formValues.email} onChange={(event) => updateField("email", event.target.value)} />
          )}
        </FormField>
      </div>
      <FormField id="contact-institution" label="Institution" optional error={fieldErrors.institution}>
        {(fieldProps) => <input {...fieldProps} value={formValues.institution} onChange={(event) => updateField("institution", event.target.value)} />}
      </FormField>
      <FormField id="contact-message" label="Message" error={fieldErrors.message}>
        {(fieldProps) => (
          <textarea
            {...fieldProps}
            rows={5}
            value={formValues.message}
            onChange={(event) => updateField("message", event.target.value)}
            className={classNames(fieldProps.className, "h-auto py-3")}
          />
        )}
      </FormField>
      <Button type="submit" size="lg" withArrow disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </Button>
      <p role="status" className="min-h-5 text-sm text-muted">
        {error ? <span className="text-[#a3361f]">{error}</span> : null}
        {isSubmitted ? "Thanks. Your message has been sent." : null}
      </p>
    </form>
  );
}
