import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "md_waitlist_entries";

type Entry = {
  email: string;
  gender: string;
  country: string;
  city: string;
  age: number;
  at: string;
};

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
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
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
    const genderValue = gender.trim();
    const countryValue = country.trim();
    const cityValue = city.trim();
    const ageValue = Number(age);
    if (!genderValue || !Number.isFinite(ageValue) || ageValue < 18) {
      setErr(t("landing.waitlistDetailsError"));
      return;
    }
    const entries = readEntries();
    if (entries.some((x) => x.email === em)) {
      setErr(t("landing.waitlistDuplicate"));
      return;
    }
    entries.push({
      email: em,
      gender: genderValue,
      country: countryValue,
      city: cityValue,
      age: ageValue,
      at: new Date().toISOString(),
    });
    writeEntries(entries);
    setMsg(t("landing.waitlistSuccess"));
    setEmail("");
    setGender("");
    setCountry("");
    setCity("");
    setAge("");
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
          {t("landing.waitlistGender")}
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">{t("landing.waitlistSelectGender")}</option>
            <option value="female">{t("landing.waitlistGenderFemale")}</option>
            <option value="male">{t("landing.waitlistGenderMale")}</option>
            <option value="lgbtq_plus">{t("landing.waitlistGenderLgbtqPlus")}</option>
          </select>
        </label>
        <label>
          {t("landing.waitlistCountry")}
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            autoComplete="country-name"
            placeholder={t("landing.waitlistCountryPlaceholder")}
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
        <label>
          {t("landing.waitlistAge")}
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={18}
            max={120}
            placeholder={t("landing.waitlistAgePlaceholder")}
            required
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
