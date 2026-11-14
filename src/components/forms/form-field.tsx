import type { ReactNode } from "react";
import { classNames } from "@/lib/format";

export const inputClassNames =
  "h-12 w-full rounded-2xl border bg-paper/70 px-4 text-[0.9375rem] outline-none transition-colors placeholder:text-muted/70 focus:border-ink focus-visible:outline-none aria-[invalid=true]:border-danger";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (fieldProps: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => ReactNode;
}

/**
 * Label + control + hint/error wrapper. The render prop wires up ids and
 * aria attributes so every field announces its error to screen readers.
 */
export function FormField({ id, label, error, hint, optional, className, children }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={classNames("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : null}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        className: classNames(inputClassNames, error ? "border-danger" : "border-stone"),
      })}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
