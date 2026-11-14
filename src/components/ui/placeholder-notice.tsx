import { Info } from "lucide-react";
import { classNames } from "@/lib/format";

/** Flags content that the business has not confirmed yet, so it is never mistaken for final policy. */
export function PlaceholderNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="note"
      className={classNames(
        "flex items-start gap-3 rounded-2xl border border-dashed border-ink/30 bg-paper/60 px-4 py-3 text-sm text-muted",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink" />
      <span>{children}</span>
    </p>
  );
}
