"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { classNames } from "@/lib/format";
import { setPageScrollLocked } from "@/lib/smooth-scroll";

type SheetPlacement = "right" | "left" | "top" | "full";

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  title: string;
  /** Hide the visual heading when the content provides its own. */
  hideTitle?: boolean;
  /** Optional content shown at the start of the top bar, before the close button. */
  headerContent?: ReactNode;
  placement?: SheetPlacement;
  children: ReactNode;
  className?: string;
}

/** Must match the panel's duration-[650ms] so the dialog closes after the slide-out finishes. */
const SHEET_TRANSITION_MS = 650;

/**
 * Closed/open styles per placement. Open styles are applied through the
 * `data-state="open"` attribute on the dialog (group "sheet").
 * The dialog uses `overflow: clip`, not `hidden`: showModal() focuses the close
 * button while the panel is still off-screen, and a `hidden` container would be
 * scrolled to reveal it, cancelling the slide so the drawer appeared instantly.
 */
const panelPlacementClasses: Record<SheetPlacement, string> = {
  right:
    "top-0 right-0 h-full w-full max-w-md [transform:translate3d(100%,0,0)] group-data-[state=open]/sheet:[transform:translate3d(0,0,0)]",
  left: "top-0 left-0 h-full w-full max-w-md [transform:translate3d(-100%,0,0)] group-data-[state=open]/sheet:[transform:translate3d(0,0,0)]",
  top: "inset-x-0 top-0 max-h-[92dvh] rounded-b-[2rem] [transform:translate3d(0,-100%,0)] group-data-[state=open]/sheet:[transform:translate3d(0,0,0)]",
  full: "inset-0 [clip-path:inset(0_0_100%_0)] group-data-[state=open]/sheet:[clip-path:inset(0_0_0_0)]",
};

/**
 * Drawer/overlay built on the native <dialog> element (focus trapping, Escape,
 * inert background). Opening and closing are both animated: the dialog is
 * shown first and `data-state` flips on the next frame so the slide-in can
 * transition; on close the state flips back and the dialog is only closed once
 * the slide-out has finished. Page scrolling (including Lenis) is paused while open.
 */
export function ModalSheet({ isOpen, onClose, title, hideTitle, headerContent, placement = "right", children, className }: ModalSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    let animationFrameId = 0;
    let closeTimeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setPageScrollLocked(true);
      }
      // Two frames: the first paints the closed state, the second starts the transition.
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = requestAnimationFrame(() => {
          dialog.dataset.state = "open";
        });
      });
    } else if (dialog.open) {
      dialog.dataset.state = "closed";
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      closeTimeoutId = setTimeout(
        () => {
          dialog.close();
          setPageScrollLocked(false);
        },
        reducedMotion ? 0 : SHEET_TRANSITION_MS,
      );
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (closeTimeoutId) clearTimeout(closeTimeoutId);
    };
  }, [isOpen]);

  // Never leave the page locked if the sheet unmounts while open.
  useEffect(() => () => setPageScrollLocked(false), []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      data-state="closed"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="group/sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 opacity-0 backdrop-blur-[3px] transition-opacity duration-500 ease-out group-data-[state=open]/sheet:opacity-100"
      />
      <div
        className={classNames(
          "absolute flex flex-col overflow-hidden bg-ivory shadow-[0_30px_80px_-30px_rgba(23,23,23,0.45)]",
          "transition-[transform,clip-path] duration-[650ms] ease-[var(--ease-editorial)] will-change-transform",
          panelPlacementClasses[placement],
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone/80 px-4 py-4 sm:px-6">
          {headerContent}
          <h2 className={classNames("font-display text-2xl", hideTitle && "sr-only")}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid size-11 place-items-center rounded-full border border-stone transition-[background-color,color,rotate] duration-300 hover:rotate-90 hover:bg-ink hover:text-ivory"
            aria-label={`Close ${title.toLowerCase()}`}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </dialog>
  );
}
