import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const v = i18n.language.startsWith("mn-Mong") ? "mn-Mong" : i18n.language.startsWith("mn") ? "mn" : "en";

  return (
    <label className="lang-switch">
      <span className="sr-only">{t("common.language")}</span>
      <select
        className="lang-switch__select"
        value={v}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value);
        }}
      >
        <option value="en">{t("lang.en")}</option>
        <option value="mn">{t("lang.mn")}</option>
        <option value="mn-Mong">{t("lang.mnMong")}</option>
      </select>
    </label>
  );
}
