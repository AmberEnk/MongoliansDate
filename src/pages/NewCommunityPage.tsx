import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";

/** Keep in sync with api/forum.ts slugify — preview only; server still allocates the final slug. */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  ө: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ү: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function suggestSlug(input: string): string {
  const lower = input.trim().toLowerCase();
  let out = "";
  for (const ch of lower) {
    if (Object.prototype.hasOwnProperty.call(CYRILLIC_TO_LATIN, ch)) out += CYRILLIC_TO_LATIN[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/[\s_./]+/.test(ch) || ch === "-") out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export default function NewCommunityPage() {
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(suggestSlug(title));
  }, [title, slugTouched]);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  const previewSlug = suggestSlug(slug) || suggestSlug(title) || "…";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await forum.createCommunity({ title, slug, description });
      nav(`/c/${r.community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <p className="chat-back">
        <Link to="/explore">{t("forum.backExplore")}</Link>
      </p>
      <h1>{t("forum.startCommunity")}</h1>
      <p className="subtle-hint">{t("forum.startCommunityIntro")}</p>
      <form className="card composer" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t("forum.communityTitle")}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={t("forum.communityTitlePlaceholder")}
          />
        </label>
        <label>
          {t("forum.communitySlug")}
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={t("forum.communitySlugPlaceholder")}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <p className="muted community-slug-preview">
          {t("forum.communitySlugPreview", { slug: previewSlug })}
        </p>
        <p className="subtle-hint">{t("forum.communitySlugHint")}</p>
        <label>
          {t("forum.communityAbout")}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn" type="submit">
          {t("forum.createCommunity")}
        </button>
      </form>
    </div>
  );
}
