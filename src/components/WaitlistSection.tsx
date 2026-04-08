import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "md_waitlist_entries";

type Entry = { email: string; city: string; at: string };

function readEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw) as unknown;
    return Array.isArray(j) ? (j as Entry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function WaitlistSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const em = email.trim().toLowerCase();
    if (!em) {
      setErr(t("landing.waitlistEmailError"));
      return;
    }
    const entries = readEntries();
    if (entries.some((x) => x.email === em)) {
      setErr(t("landing.waitlistDuplicate"));
      return;
    }
    entries.push({ email: em, city: city.trim(), at: new Date().toISOString() });
    writeEntries(entries);
    setMsg(t("landing.waitlistSuccess"));
    setEmail("");
    setCity("");
  }

  return (
    <div className="landing-waitlist-card card">
      <h3 className="landing-waitlist-card__title">{t("landing.waitlistFormTitle")}</h3>
      <p className="muted landing-waitlist-card__sub">{t("landing.waitlistFormSubtitle")}</p>
      <form onSubmit={onSubmit} className="landing-waitlist-form">
        <label>
          {t("landing.waitlistEmail")}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          {t("landing.waitlistCity")}
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            placeholder={t("landing.waitlistCityPlaceholder")}
          />
        </label>
        {err && <p className="err">{err}</p>}
        {msg && <p className="landing-waitlist-success">{msg}</p>}
        <button type="submit" className="btn">
          {t("landing.waitlistSubmit")}
        </button>
      </form>
    </div>
  );
}
