"use client";

import { useEffect, useState } from "react";
import { loadPublicLanding, type PlatformLanding } from "@/lib/platformadmin-api";

const empty: PlatformLanding = { signupImage: "", loginImage: "", logoImage: "", aboutImage: "" };

// One request per page load, shared by every component that shows a landing image.
let pending: Promise<PlatformLanding> | null = null;

function fetchLanding() {
  pending ??= loadPublicLanding().catch(() => {
    pending = null;
    return empty;
  });
  return pending;
}

/** Returns the platform landing images, or null until the server has answered. */
export function usePlatformLanding() {
  const [landing, setLanding] = useState<PlatformLanding | null>(null);
  useEffect(() => {
    let active = true;
    fetchLanding().then((next) => {
      if (active) setLanding(next);
    });
    return () => {
      active = false;
    };
  }, []);
  return landing;
}
