/**
 * Form rules for the public campus site. The same rules apply when these
 * forms later post to an API.
 */
import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Enter your email address.").email("Enter a valid email, like name@example.com.");

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: emailSchema,
  institution: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)."),
});

export type FieldErrors<Values> = Partial<Record<keyof Values, string>>;

/** Turns a Zod error into one message per field for inline display. */
export function toFieldErrors<Values>(error: z.ZodError): FieldErrors<Values> {
  const fieldErrors: FieldErrors<Values> = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0] as keyof Values | undefined;
    if (fieldName && !fieldErrors[fieldName]) fieldErrors[fieldName] = issue.message;
  }
  return fieldErrors;
}
