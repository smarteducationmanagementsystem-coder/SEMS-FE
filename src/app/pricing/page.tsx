import type { Metadata } from "next";
import CeilingFan from "@/components/animation/CeilingFan";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";
import { PricingBoard } from "./pricing-board";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description: "Basic, Professional, and Enterprise plans for Smart Education Management System.",
  path: routes.pricing,
});

export default function PricingPage() {
  return (
    <div className="page-container pt-6 pb-20 sm:pt-10">
      <div className="mb-2 w-full min-w-0">
        <CeilingFan fit />
      </div>
      <h1 className="display-heading max-w-4xl text-5xl break-words sm:text-6xl">Basic, Professional, Enterprise.</h1>
      <p className="mt-5 max-w-xl text-muted">Prices are in Pakistani rupees. Enterprise is quoted for groups that run more than one institution.</p>
      <PricingBoard />
    </div>
  );
}
