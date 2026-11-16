"use client";

import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";
import { usePlatformLanding } from "@/lib/platform-landing";
import type { PlatformLanding } from "@/lib/platformadmin-api";

type LandingImageProps = Omit<ImageProps, "src"> & {
  /** Which image the platform admin controls. */
  field: keyof PlatformLanding;
  /** Built-in image used until the platform admin uploads one. */
  fallbackSrc: string;
  /** Shown while the server is still answering, so the old image never flashes. */
  pending?: ReactNode;
};

/** An image whose file is chosen in Platform admin > Setting > Landing. */
export function LandingImage({ field, fallbackSrc, pending = null, alt, ...rest }: LandingImageProps) {
  const landing = usePlatformLanding();
  if (!landing) return <>{pending}</>;
  const uploaded = landing[field];
  return <Image {...rest} alt={alt} src={uploaded || fallbackSrc} unoptimized={Boolean(uploaded) || rest.unoptimized} />;
}
