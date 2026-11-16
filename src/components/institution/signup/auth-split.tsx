"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { LandingImage } from "@/components/landing-image";
import { siteThemeVars } from "@/components/layout/site-theme-vars";
import { routes } from "@/constants/routes";
import { adminThemeStyle } from "../campus-theme";

/** Sign-in and signup screens are always light, on the same cream as the home page. */
const homeBackground = siteThemeVars.light["--color-ivory"];

interface AuthSplitProps {
  /** Built-in photo, used until the platform admin uploads one. */
  imageSrc: string;
  imageAlt: string;
  imageSide: "left" | "right";
  /** Which uploaded photo to show: the login image or the signup image. */
  imageKind: "login" | "signup";
  children: ReactNode;
}

/** Full-height auth layout: one half is a photo, the other is the form. */
export function AuthSplit({ imageSrc, imageAlt, imageSide, imageKind, children }: AuthSplitProps) {
  const image = (
    <div className="relative h-56 shrink-0 sm:h-72 md:h-auto md:w-1/2">
      <LandingImage
        field={imageKind === "signup" ? "signupImage" : "loginImage"}
        fallbackSrc={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );

  const form = (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:w-1/2">
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href={routes.home} aria-label="Smart Education Management System home" className="block w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4">
            <LandingImage
              field="logoImage"
              fallbackSrc="/brand/smart-education-logo.png"
              alt=""
              width={1024}
              height={262}
              priority
              className="h-auto w-full object-contain"
              pending={<span className="block aspect-[1024/262] w-full" />}
            />
          </Link>
          <section className="mt-8 w-full px-3 sm:px-4">{children}</section>
        </div>
      </div>
    </div>
  );

  return (
    <div id="admin-frame" data-theme="light" style={{ ...adminThemeStyle("light"), "--admin-bg": homeBackground, backgroundColor: homeBackground } as CSSProperties} className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] md:flex-row">
      {imageSide === "left" ? image : form}
      {imageSide === "left" ? form : image}
    </div>
  );
}
