import { classNames } from "@/lib/format";

type BrandSize = "header" | "sidebar" | "hero" | "footer";
type BrandTone = "green" | "ink" | "ivory";

const sizes: Record<BrandSize, { one: string; two: string; rule: string; sub: string }> = {
  header: {
    one: "text-[0.95rem]",
    two: "mt-0.5 text-[0.78rem]",
    rule: "mt-1 w-5",
    sub: "mt-1 text-[0.42rem] tracking-[0.16em]",
  },
  sidebar: {
    one: "text-[1.65rem]",
    two: "mt-1 text-[1.35rem]",
    rule: "mt-2 w-10",
    sub: "mt-2 text-[0.62rem] tracking-[0.22em]",
  },
  hero: {
    one: "text-5xl sm:text-6xl",
    two: "mt-1 text-4xl sm:text-5xl",
    rule: "mt-4 h-0.5 w-16",
    sub: "mt-3 text-xs tracking-[0.28em] sm:text-sm",
  },
  footer: {
    one: "text-[11vw] leading-[0.85]",
    two: "mt-1 text-[7vw] leading-[0.85]",
    rule: "mx-auto mt-3 w-16",
    sub: "mt-3 text-[1.1vw] tracking-[0.35em]",
  },
};

/** Project lockup: Smart / Education, then Management System. */
export function ProjectBrand({
  size = "sidebar",
  tone = "green",
  align = "start",
  className,
}: {
  size?: BrandSize;
  tone?: BrandTone;
  align?: "start" | "center";
  className?: string;
}) {
  const scale = sizes[size];
  const color = tone === "ivory" ? "text-ivory" : tone === "ink" ? "text-ink" : "text-[#1b7a3d]";

  return (
    <div className={classNames("leading-none", color, align === "center" && "text-center", className)}>
      <p className={classNames("font-display font-semibold tracking-tight", scale.one)}>Smart</p>
      <p className={classNames("font-display font-semibold tracking-tight", scale.two)}>Education</p>
      <span className={classNames("block h-px bg-current", scale.rule)} />
      <p className={classNames("font-semibold uppercase", scale.sub)}>Management System</p>
    </div>
  );
}
