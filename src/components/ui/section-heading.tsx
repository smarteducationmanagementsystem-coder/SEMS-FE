import type { ReactNode } from "react";
import { classNames } from "@/lib/format";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  /** Replaces the default display size when a section needs a smaller heading. */
  titleClassName?: string;
  description?: string;
  /** Optional action (usually a link) aligned to the end on wider screens. */
  action?: ReactNode;
  headingLevel?: "h1" | "h2";
  /** id for the heading so the parent section can reference it with aria-labelledby. */
  headingId?: string;
  align?: "start" | "center";
  tone?: "dark" | "light";
  className?: string;
}

/** Eyebrow + large serif heading pattern used to open every homepage section. */
export function SectionHeading({
  eyebrow,
  title,
  titleClassName,
  description,
  action,
  headingLevel: Heading = "h2",
  headingId,
  align = "start",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const isCentered = align === "center";
  return (
    <div
      className={classNames(
        "reveal flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between",
        isCentered && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={classNames("min-w-0 max-w-2xl", isCentered && "mx-auto")}>
        {eyebrow ? (
          <p className={classNames("eyebrow mb-4 flex items-center gap-3", isCentered && "justify-center", tone === "light" ? "text-ivory/70" : "text-muted")}>
            <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
            {eyebrow}
          </p>
        ) : null}
        <Heading id={headingId} className={classNames("display-heading break-words", titleClassName ?? "text-[2.6rem] text-balance sm:text-6xl lg:text-7xl")}>{title}</Heading>
        {description ? (
          <p className={classNames("mt-5 max-w-xl text-base leading-relaxed text-pretty", tone === "light" ? "text-ivory/75" : "text-muted", isCentered && "mx-auto")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
