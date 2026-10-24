import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandLogo from "../components/BrandLogo";
import { CONTACT_EMAIL } from "../constants";
import * as forum from "../forum/api";

export default function HelpPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const postId = params.get("post")?.trim() || "";
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await forum.report({ reason, postId: postId || undefined });
      setDone(true);
    } catch (er) {
      setErr(er instanceof Error ? er.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <BrandLogo className="auth-logo" size={96} />
      <h1>{t("help.title")}</h1>
      <p className="subtle-hint">{t("help.intro")}</p>
      {done ? (
        <p className="card guest-note">{t("help.sent")}</p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="card composer">
          {postId ? <p className="muted">{t("help.aboutPost", { id: postId })}</p> : null}
          <label>
            {t("help.reason")}
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required minLength={8} rows={5} />
          </label>
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn">
            {t("help.submit")}
          </button>
        </form>
      )}
      <p className="muted">
        {t("help.orEmail")}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <p className="muted">
        <Link to="/">{t("forum.home")}</Link>
      </p>
    </div>
  );
}
