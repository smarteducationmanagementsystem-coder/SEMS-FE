import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

/** Header mark. The artwork matches the project logo, kept compact for the top-left bar. */
export function Wordmark() {
  return (
    <Link href={routes.home} aria-label={`${siteConfig.name} home`} className="inline-flex min-w-0 shrink">
      <Image
        src="/brand/smart-education-logo.png"
        alt=""
        width={1024}
        height={262}
        priority
        className="h-11 w-auto max-w-[min(100%,calc(100vw-8.5rem))] object-contain object-left sm:h-16 sm:max-w-[300px] lg:h-[4.75rem] lg:max-w-[340px]"
      />
    </Link>
  );
}
