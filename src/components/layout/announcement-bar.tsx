import { announcementMessages } from "@/config/content";

/**
 * Slim scrolling announcement strip. Messages are duplicated once so the
 * marquee loops seamlessly; the duplicate is hidden from assistive tech.
 */
export function AnnouncementBar() {
  const marqueeItems = [...announcementMessages, ...announcementMessages];
  return (
    <div className="relative z-40 w-full min-w-0 overflow-hidden bg-ink text-ivory">
      <p className="sr-only">{announcementMessages.join(". ")}</p>
      <div aria-hidden="true" className="flex w-max animate-marquee motion-reduce:animate-none">
        {marqueeItems.map((message, index) => (
          <span key={`${message}-${index}`} className="flex items-center gap-6 px-6 py-2 text-[0.6875rem] font-medium tracking-[0.12em] uppercase whitespace-nowrap">
            {message}
            <span className="size-1 rounded-full bg-lime" />
          </span>
        ))}
      </div>
    </div>
  );
}
