"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Footer button: "install on your phone like an app". Android/desktop Chrome show the
// browser's own install dialog; iPhone has no such dialog, so we show the 2-step hint.
export default function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!promptEvent && !ios)) return null;

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    } else {
      setHelp((v) => !v);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-2 rounded-sm border border-paper/30 px-3.5 py-2 text-xs font-medium text-paper/85 transition-colors hover:border-gold hover:text-gold"
      >
        <Smartphone size={14} /> ফোনে অ্যাপের মতো ইনস্টল করুন
      </button>
      {help && (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-paper/60">
          iPhone-এ Safari খুলে নিচের <strong>Share</strong> বাটন চাপুন, তারপর <strong>Add to Home Screen</strong> বাছুন।
        </p>
      )}
    </div>
  );
}
