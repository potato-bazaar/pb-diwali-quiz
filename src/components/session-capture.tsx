"use client";

import { useEffect } from "react";
import { captureSessionFromUrl } from "@/lib/session";

/** Saves the app's login token from the landing URL before any in-app navigation drops it. */
export function SessionCapture() {
  useEffect(() => {
    captureSessionFromUrl();
  }, []);
  return null;
}
