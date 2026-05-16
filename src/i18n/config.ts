import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mn from "./locales/mn.json";
import mnMong from "./locales/mn-Mong.json";
import { privacyPolicyBody, termsOfServiceBody } from "../legal/us-ca-en";

const enTranslation = {
  ...en,
  legal: {
    ...en.legal,
    privacy: { ...en.legal.privacy, body: privacyPolicyBody },
    terms: { ...en.legal.terms, body: termsOfServiceBody },
  },
};

const mnLegalNotice =
  '<p class="legal-notice">Бүрэн хуулийн бичвэр англи хэлээр бичигдсэн бөгөөд зөрүү гарвал англи хувилбар давуу эрхтэй. Дэлгэрэнгүйг харахын тулд сайтын хэлийг <strong>English</strong> болгоно уу, эсвэл <a href="mailto:contact@uchral.net">contact@uchral.net</a> хаягаар холбогдоно уу.</p>';

const mnMongLegalNotice =
  '<p class="legal-notice">ᠪᠦᠷᠢᠨ ᠬᠠᠤᠯᠢ ᠶᠢᠨ ᠪᠢᠴᠢᠭ ᠠᠩᠭᠯᠢ ᠬᠡᠯᠡᠨ ᠪᠢᠴᠢᠭᠰᠡᠨ ᠃ ᠵᠠᠭᠰᠠᠯ ᠭᠠᠷᠪᠠ ᠪᠣᠯ ᠠᠩᠭᠯᠢ ᠬᠡᠪᠯᠡᠯ ᠳᠡᠭᠡᠷ᠎ᠡ ᠃ <strong>English</strong> ᠬᠡᠯᠡ ᠰᠣᠩᠭᠣᠨ᠎ᠤ ᠤᠶᠠᠷ ᠡᠰᠡᠬᠦ ᠪᠤᠶᠤ <a href="mailto:contact@uchral.net">contact@uchral.net</a> ᠳ᠋ᠤ ᠬᠣᠯᠪᠣᠭᠠᠷᠠᠢ᠃</p>';

const mnTranslation = {
  ...mn,
  legal: {
    ...mn.legal,
    privacy: { ...mn.legal.privacy, body: mnLegalNotice + privacyPolicyBody },
    terms: { ...mn.legal.terms, body: mnLegalNotice + termsOfServiceBody },
  },
};

const mnMongTranslation = {
  ...mnMong,
  legal: {
    ...mnMong.legal,
    privacy: { ...mnMong.legal.privacy, body: mnMongLegalNotice + privacyPolicyBody },
    terms: { ...mnMong.legal.terms, body: mnMongLegalNotice + termsOfServiceBody },
  },
};

/** Admin routes set their own `document.title`; don't clobber on i18n init/language change. */
function shouldKeepRouteManagedTitle(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin/");
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      mn: { translation: mnTranslation },
      "mn-Mong": { translation: mnMongTranslation },
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
    if (!shouldKeepRouteManagedTitle()) {
      document.title = i18n.t("meta.title");
    }
  });

function applyDocumentLang(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dataset.locale = lng;
}

i18n.on("languageChanged", (lng) => {
  applyDocumentLang(lng);
  if (!shouldKeepRouteManagedTitle()) {
    document.title = i18n.t("meta.title");
  }
});

export default i18n;
