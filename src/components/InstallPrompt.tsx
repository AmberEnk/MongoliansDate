import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const OLD_DISMISS_KEY = "uchral.pwaInstallDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneDisplay(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIosDevice(): boolean {
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => (typeof window === "undefined" ? true : isStandaloneDisplay()));
  const ios = typeof window !== "undefined" && isIosDevice();

  useEffect(() => {
    try {
      localStorage.removeItem(OLD_DISMISS_KEY);
    } catch {
      /* ignore */
    }

    const syncInstalled = () => setInstalled(isStandaloneDisplay());
    syncInstalled();

    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", syncInstalled);
    window.addEventListener("appinstalled", syncInstalled);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    return () => {
      media.removeEventListener("change", syncInstalled);
      window.removeEventListener("appinstalled", syncInstalled);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setInstalled(isStandaloneDisplay());
  }

  if (installed) return null;

  return (
    <div className="pwa-banner" role="status">
      <p className="pwa-banner__copy">{ios ? t("pwa.iosBody") : t("pwa.alwaysBody")}</p>
      {deferred ? (
        <button type="button" className="btn pwa-banner__install" onClick={() => void install()}>
          {t("pwa.install")}
        </button>
      ) : null}
    </div>
  );
}
