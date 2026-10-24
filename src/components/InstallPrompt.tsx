import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DISMISS_KEY = "uchral.pwaInstallDismissed";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

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

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandaloneDisplay() || wasDismissedRecently()) return;

    const ios = isIosDevice();
    if (ios) {
      setIosHint(true);
      setHidden(false);
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore quota / private mode */
    }
    setHidden(true);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome !== "accepted") {
      dismiss();
      return;
    }
    setHidden(true);
    setDeferred(null);
  }

  if (hidden) return null;

  return (
    <div className="pwa-banner" role="region" aria-label={t("pwa.installTitle")}>
      <div className="pwa-banner__copy">
        <p className="pwa-banner__title">{iosHint ? t("pwa.iosTitle") : t("pwa.installTitle")}</p>
        <p className="pwa-banner__body">{iosHint ? t("pwa.iosBody") : t("pwa.installBody")}</p>
      </div>
      <div className="pwa-banner__actions">
        {deferred ? (
          <button type="button" className="btn" onClick={() => void install()}>
            {t("pwa.install")}
          </button>
        ) : null}
        <button type="button" className="btn secondary" onClick={dismiss}>
          {t("pwa.dismiss")}
        </button>
      </div>
    </div>
  );
}
