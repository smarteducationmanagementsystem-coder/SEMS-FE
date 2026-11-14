"use client";

import { useSyncExternalStore } from "react";
import { ApiError } from "@/lib/sems-api";
import { loginPlatformAdmin } from "@/lib/platformadmin-api";

const storageKey = "sems-platform-admin-token";
const changeEvent = "sems-platform-admin-change";

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  return () => window.removeEventListener(changeEvent, listener);
}

function readToken() {
  try {
    return window.sessionStorage.getItem(storageKey) || "";
  } catch {
    return "";
  }
}

function publish(token: string) {
  try {
    if (token) window.sessionStorage.setItem(storageKey, token);
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    // Private browsing can block storage. The gate still follows this tab's event.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function usePlatformAdminToken() {
  return useSyncExternalStore(subscribe, readToken, () => "");
}

export function usePlatformAdminSession() {
  return Boolean(usePlatformAdminToken());
}

/** Reads the token saved in this browser. Safe to call only after the page has mounted. */
export function hasStoredPlatformAdminSession() {
  return Boolean(readToken());
}

export async function signInPlatformAdmin(email: string, password: string) {
  try {
    publish(await loginPlatformAdmin(email, password));
    return null;
  } catch (error) {
    return error instanceof ApiError ? error.message : "Could not sign in.";
  }
}

export function signOutPlatformAdmin() {
  publish("");
}
