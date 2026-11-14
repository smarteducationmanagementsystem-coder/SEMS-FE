import { siteConfig } from "./site";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "whatsapp";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

// Placeholder handles: swap in the real profiles before launch.
export const socialLinks: SocialLink[] = [
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/smarteducation" },
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/smarteducation" },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@smarteducation" },
  { platform: "whatsapp", label: "WhatsApp", href: `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}` },
];
