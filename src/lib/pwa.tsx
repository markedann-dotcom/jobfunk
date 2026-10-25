"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop";

type PwaCtx = {
  /** true when the browser can show a native install prompt */
  canInstall: boolean;
  /** standalone (already installed) */
  installed: boolean;
  /** iOS Safari — no native prompt, show manual hint */
  isIos: boolean;
  /** detected platform, for the right manual install instructions */
  platform: Platform;
  /** triggers the native prompt; resolves to outcome */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

const Ctx = createContext<PwaCtx | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setInstalled(!!standalone);

    const ua = window.navigator.userAgent;
    const iosDevice =
      /iphone|ipad|ipod/i.test(ua) ||
      // iPadOS 13+ reports as Mac but is touch
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const safari = /^((?!chrome|crios|fxios|android).)*safari/i.test(ua);
    setIsIos(iosDevice && safari);
    if (iosDevice) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Register the service worker — required for installability (beforeinstallprompt).
    // Skipped in dev to avoid the SW caching stale HMR chunks.
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome;
  };

  return (
    <Ctx.Provider
      value={{ canInstall: !!deferred, installed, isIos, platform, promptInstall }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePwa() {
  const ctx = useContext(Ctx);
  if (!ctx)
    return {
      canInstall: false,
      installed: false,
      isIos: false,
      platform: "desktop" as Platform,
      promptInstall: async () => "unavailable" as const,
    };
  return ctx;
}
