import { siFacebook, siInstagram, siTiktok, siWhatsapp, type SimpleIcon } from "simple-icons";
import type { SocialLink, SocialPlatform } from "@/config/social-links";
import { siteConfig } from "@/config/site";
import { classNames } from "@/lib/format";
import { Magnetic } from "./magnetic";

const platformIcons: Record<SocialPlatform, SimpleIcon> = {
  instagram: siInstagram,
  facebook: siFacebook,
  tiktok: siTiktok,
  whatsapp: siWhatsapp,
};

type Tone = "light" | "dark";

const toneClasses: Record<Tone, string> = {
  light: "border-ivory/30 text-ivory hover:border-brand hover:bg-brand hover:text-white",
  dark: "border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
};

/** Round outlined brand-icon button with a magnetic hover (Ahmed Javed footer style). Brand marks come from Simple Icons. */
export function SocialIconLink({ link, tone = "light", className }: { link: SocialLink; tone?: Tone; className?: string }) {
  const icon = platformIcons[link.platform];
  return (
    <Magnetic strength={0.4} maxOffset={8}>
      <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${siteConfig.name} on ${link.label}`}
      title={link.label}
      className={classNames(
        "grid size-12 place-items-center rounded-full border-[1.5px] transition-[background-color,color,border-color,translate] duration-300 hover:-translate-y-0.5",
        toneClasses[tone],
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.1rem] fill-current">
        <path d={icon.path} />
      </svg>
      </a>
    </Magnetic>
  );
}
