import type { Metadata } from "next";
import { CampusHome } from "@/components/home/campus-home";
import { seoConfig } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: { absolute: seoConfig.defaultTitle },
  alternates: { canonical: routes.home },
};

export default function HomePage() {
  return <CampusHome />;
}
