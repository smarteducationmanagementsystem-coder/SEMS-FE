import Image from "next/image";

/** Same project logo, sized for the admin top-left. */
export function CampusBrand() {
  return (
    <Image
      src="/brand/smart-education-logo.png"
      alt="Smart Education Management System"
      width={1024}
      height={262}
      className="h-12 w-auto max-w-full rounded-md bg-white object-contain object-left"
    />
  );
}
