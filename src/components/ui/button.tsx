import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { classNames } from "@/lib/format";
import { Magnetic } from "./magnetic";

/**
 * - primary:       ink button on light backgrounds
 * - accent:        brand-blue button (most important action, especially on dark)
 * - outline:       outlined button on light backgrounds
 * - outline-light: outlined button on dark backgrounds
 * - light:         ivory button on dark/photo backgrounds
 * - ghost:         text-style button
 */
type ButtonVariant = "primary" | "accent" | "outline" | "outline-light" | "light" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface VariantStyle {
  /** Resting background, border and text, plus the text colour once the fill has risen. */
  base: string;
  /** Colour of the layer that rises from the bottom on hover. */
  fill: string;
  /** Arrow disc colours at rest and on hover. */
  disc: string;
}

const variantStyles: Record<ButtonVariant, VariantStyle> = {
  primary: {
    base: "bg-ink text-ivory hover:text-white",
    fill: "bg-brand",
    disc: "bg-ivory text-ink group-hover/button:bg-white group-hover/button:text-brand",
  },
  accent: {
    base: "border-[1.5px] border-transparent bg-brand text-white hover:border-brand hover:text-white",
    fill: "bg-brand-deep",
    disc: "bg-white text-brand group-hover/button:bg-brand group-hover/button:text-white",
  },
  outline: {
    base: "border border-ink/80 text-ink hover:text-ivory",
    fill: "bg-ink",
    disc: "bg-ink text-ivory group-hover/button:bg-ivory group-hover/button:text-ink",
  },
  "outline-light": {
    base: "border border-ivory/35 text-ivory hover:border-ivory hover:text-ink",
    fill: "bg-ivory",
    disc: "bg-ivory text-ink group-hover/button:bg-ink group-hover/button:text-ivory",
  },
  light: {
    base: "bg-ivory text-ink hover:text-ivory",
    fill: "bg-ink",
    disc: "bg-ink text-ivory group-hover/button:bg-ivory group-hover/button:text-ink",
  },
  ghost: {
    base: "text-ink",
    fill: "bg-ink/[0.07]",
    disc: "bg-ink text-ivory",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-sm sm:text-base",
};

const arrowPaddingClasses: Record<ButtonSize, string> = {
  sm: "pr-1",
  md: "pr-1.5",
  lg: "pr-2",
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows the circular arrow disc used for primary calls to action. */
  withArrow?: boolean;
  fullWidth?: boolean;
  /** Follow the cursor slightly on hover (on by default). */
  magnetic?: boolean;
  /** Classes for the outer magnetic wrapper, e.g. flex-1 when the button must grow inside a flex row. */
  wrapperClassName?: string;
  className?: string;
}

export function buttonClassNames({ variant = "primary", size = "md", withArrow, fullWidth, className }: ButtonStyleOptions) {
  return classNames(
    "group/button relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-medium tracking-tight whitespace-nowrap",
    "transition-[color,border-color,scale] duration-500 ease-[var(--ease-editorial)] active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
    variantStyles[variant].base,
    sizeClasses[size],
    withArrow && arrowPaddingClasses[size],
    fullWidth && "w-full",
    className,
  );
}

/**
 * Inner layers shared by <Button> and <ButtonLink>:
 * 1. a fill that rises from the bottom with a curved top that flattens out,
 * 2. a label that rolls up while an identical copy rolls in from below,
 * 3. an optional arrow disc that rotates and swaps colours.
 */
function ButtonContent({ children, withArrow, variant = "primary" }: { children: ReactNode; withArrow?: boolean; variant?: ButtonVariant }) {
  const styles = variantStyles[variant];
  return (
    <>
      <span
        aria-hidden="true"
        className={classNames(
          "absolute inset-0 -z-10 translate-y-full rounded-t-[50%] transition-[translate,border-radius] duration-500 ease-[var(--ease-editorial)]",
          "group-hover/button:translate-y-0 group-hover/button:rounded-none group-focus-visible/button:translate-y-0 group-focus-visible/button:rounded-none",
          styles.fill,
        )}
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-editorial)] group-hover/button:-translate-y-full">{children}</span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-editorial)] group-hover/button:translate-y-0"
        >
          {children}
        </span>
      </span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={classNames(
            "grid size-8 shrink-0 place-items-center rounded-full transition-[background-color,color,rotate] duration-500 ease-[var(--ease-editorial)] group-hover/button:rotate-45",
            styles.disc,
          )}
        >
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </span>
      ) : null}
    </>
  );
}

function MagneticWrapper({ magnetic = true, fullWidth, wrapperClassName, children }: Pick<ButtonStyleOptions, "magnetic" | "fullWidth" | "wrapperClassName"> & { children: ReactNode }) {
  const layoutClasses = classNames(fullWidth && "flex w-full", wrapperClassName);
  if (!magnetic) return layoutClasses ? <span className={classNames("inline-flex", layoutClasses)}>{children}</span> : <>{children}</>;
  return <Magnetic className={layoutClasses}>{children}</Magnetic>;
}

type ButtonProps = ButtonStyleOptions & ComponentProps<"button">;

export function Button({ variant, size, withArrow, fullWidth, magnetic, wrapperClassName, className, children, type = "button", ...buttonProps }: ButtonProps) {
  return (
    <MagneticWrapper magnetic={magnetic} fullWidth={fullWidth} wrapperClassName={wrapperClassName}>
      <button type={type} className={buttonClassNames({ variant, size, withArrow, fullWidth, className })} {...buttonProps}>
        <ButtonContent withArrow={withArrow} variant={variant}>
          {children}
        </ButtonContent>
      </button>
    </MagneticWrapper>
  );
}

type ButtonLinkProps = ButtonStyleOptions & ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, withArrow, fullWidth, magnetic, wrapperClassName, className, children, ...linkProps }: ButtonLinkProps) {
  return (
    <MagneticWrapper magnetic={magnetic} fullWidth={fullWidth} wrapperClassName={wrapperClassName}>
      <Link className={buttonClassNames({ variant, size, withArrow, fullWidth, className })} {...linkProps}>
        <ButtonContent withArrow={withArrow} variant={variant}>
          {children}
        </ButtonContent>
      </Link>
    </MagneticWrapper>
  );
}
