"use client";

import { useEffect } from "react";
import { applyMessageSession, captureSessionFromUrl } from "@/lib/session";

/** Saves the app login token before in-app navigation drops the query string. */
export function SessionCapture() {
  useEffect(() => {
    captureSessionFromUrl();
    const onReady = () => captureSessionFromUrl();
    const onMessage = (event: MessageEvent | Event) => {
      const data = "data" in event ? event.data : undefined;
      applyMessageSession(data);
      captureSessionFromUrl();
    };
    window.addEventListener("pbzone-session-ready", onReady);
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    const poll = window.setInterval(captureSessionFromUrl, 400);
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000);
    return () => {
      window.removeEventListener("pbzone-session-ready", onReady);
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, []);
  return null;
}
