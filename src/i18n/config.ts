import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mn from "./locales/mn.json";
import mnMong from "./locales/mn-Mong.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mn: { translation: mn },
      "mn-Mong": { translation: mnMong },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "mn", "mn-Mong"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "mongolians-date-local-lang",
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  .then(() => {
    applyDocumentLang(i18n.language || "en");
    document.title = i18n.t("meta.title");
  });

function applyDocumentLang(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dataset.locale = lng;
}

i18n.on("languageChanged", (lng) => {
  applyDocumentLang(lng);
  document.title = i18n.t("meta.title");
});

export default i18n;
