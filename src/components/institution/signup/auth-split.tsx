"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useSiteTheme } from "@/components/layout/site-theme";
import { routes } from "@/constants/routes";
import { adminThemeStyle } from "../campus-theme";

interface AuthSplitProps {
  imageSrc: string;
  imageAlt: string;
  imageSide: "left" | "right";
  children: ReactNode;
}

/** Full-height auth layout: one half is a photo, the other is the form. */
export function AuthSplit({ imageSrc, imageAlt, imageSide, children }: AuthSplitProps) {
  const { theme } = useSiteTheme();

  const image = (
    <div className="relative h-56 shrink-0 sm:h-72 md:h-auto md:w-1/2">
      <Image src={imageSrc} alt={imageAlt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
    </div>
  );

  const form = (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:w-1/2">
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href={routes.home} aria-label="Smart Education Management System home" className="block w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4">
            <Image
              src="/brand/smart-education-logo.png"
              alt=""
              width={1024}
              height={262}
              priority
              className="h-auto w-full object-contain"
            />
          </Link>
          <section className="mt-8 w-full px-3 sm:px-4">{children}</section>
        </div>
      </div>
    </div>
  );

  return (
    <div id="admin-frame" data-theme={theme} style={adminThemeStyle(theme)} className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] md:flex-row">
      {imageSide === "left" ? image : form}
      {imageSide === "left" ? form : image}
    </div>
  );
}
