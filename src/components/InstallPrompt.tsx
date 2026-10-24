import { useEffect, useId, useState } from "react";
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

function isAndroidDevice(): boolean {
  return /android/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const titleId = useId();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => (typeof window === "undefined" ? true : isStandaloneDisplay()));
  const [open, setOpen] = useState(false);
  const ios = typeof window !== "undefined" && isIosDevice();
  const android = typeof window !== "undefined" && isAndroidDevice();
  const guideKey = ios ? "pwa.ios" : android ? "pwa.android" : "pwa.other";

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setInstalled(isStandaloneDisplay());
  }

  if (installed) return null;

  const steps = [t(`${guideKey}Step1`), t(`${guideKey}Step2`), t(`${guideKey}Step3`)];

  return (
    <>
      <div className="pwa-banner" role="status">
        <p className="pwa-banner__copy">{t("pwa.bar")}</p>
        <button type="button" className="btn pwa-banner__install" onClick={() => setOpen(true)}>
          {t("pwa.how")}
        </button>
      </div>

      {open ? (
        <div className="pwa-modal" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="pwa-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId}>{t("pwa.modalTitle")}</h2>
            <p className="pwa-modal__lede">{t("pwa.modalLede")}</p>
            <ol className="pwa-modal__steps">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="pwa-modal__actions">
              {deferred ? (
                <button type="button" className="btn" onClick={() => void install()}>
                  {t("pwa.install")}
                </button>
              ) : null}
              <button type="button" className="btn secondary" onClick={() => setOpen(false)}>
                {t("pwa.gotIt")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
