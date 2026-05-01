import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SPONSORSHIP_STANCES } from "../constants";
import { useAuth } from "../auth/AuthContext";
import * as store from "../localStore";

export default function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const { refresh } = useAuth();
  const session = store.getCurrentUser();
  const [bio, setBio] = useState("");
  const [intent, setIntent] = useState("Long-term · marriage-minded when it fits");
  const [stance, setStance] = useState<string>("prefer_not_say");
  const [detail, setDetail] = useState("");
  const [heritage, setHeritage] = useState("Khalkha, LA diaspora");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const p = store.loadMyProfile(session.userId);
    if (p?.bio) setBio(p.bio);
    if (p?.intent) setIntent(p.intent);
    if (p?.sponsorship_stance) setStance(p.sponsorship_stance);
    if (p?.sponsorship_detail) setDetail(p.sponsorship_detail);
    if (p?.heritage_tags?.length) setHeritage(p.heritage_tags.join(", "));
  }, [session]);

  if (!session) return null;
  const userId = session.userId;

  function profileLanguages(): string[] {
    if (i18n.language.startsWith("mn-Mong")) return ["Mongolian (traditional script)", "English"];
    if (i18n.language.startsWith("mn")) return ["Mongolian (Cyrillic)", "English"];
    return ["English"];
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const tags = heritage
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      store.saveMyProfile(userId, {
        bio,
        intent,
        sponsorship_stance: stance,
        sponsorship_detail: detail,
        heritage_tags: tags,
        languages: profileLanguages(),
        markOnboardingComplete: true,
      });
      setMsg(t("onboarding.savedMsg"));
      void refresh();
    } catch {
      setMsg(t("onboarding.saveFail"));
    }
  }

  async function uploadPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setMsg(t("onboarding.photoFail"));
        return;
      }
      try {
        store.setPrimaryPhotoDataUrl(userId, dataUrl);
        setMsg(t("onboarding.photoOk"));
        void refresh();
      } catch {
        setMsg(t("onboarding.photoFail"));
      }
    };
    reader.onerror = () => setMsg(t("onboarding.photoFail"));
    reader.readAsDataURL(f);
  }

  return (
    <div className="layout">
      <h1>{t("onboarding.title")}</h1>
      <form onSubmit={save} className="card">
        <label>
          {t("onboarding.bio")}
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} required />
        </label>
        <label>
          {t("onboarding.intent")}
          <input value={intent} onChange={(e) => setIntent(e.target.value)} required />
        </label>
        <label>
          {t("onboarding.heritage")}
          <input value={heritage} onChange={(e) => setHeritage(e.target.value)} />
        </label>
        <label>
          {t("onboarding.sponsorship")}
          <select value={stance} onChange={(e) => setStance(e.target.value)}>
            {SPONSORSHIP_STANCES.map((s) => (
              <option key={s} value={s}>
                {t(`sponsorship.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("onboarding.sponsorshipNotes")}
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} />
        </label>
        <p className="legal-note">{t("onboarding.legalNote")}</p>
        {msg && <p>{msg}</p>}
        <button type="submit" className="btn">
          {t("onboarding.save")}
        </button>
      </form>
      <div className="card">
        <p>{t("onboarding.photos")}</p>
        <input type="file" accept="image/*" onChange={uploadPhoto} />
      </div>
      <Link to="/discover">{t("onboarding.openDiscover")}</Link>
    </div>
  );
}
