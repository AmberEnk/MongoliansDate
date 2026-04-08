import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as store from "../localStore";
import type { DiscoveryProfile } from "../localStore";

export default function DiscoverPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const me = store.getCurrentUser();
  const [list, setList] = useState<DiscoveryProfile[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!me) {
      setErr(t("discover.loadFail"));
      return;
    }
    try {
      setList(store.getDiscoveryList(me.userId));
      setErr(null);
    } catch {
      setErr(t("discover.loadFail"));
    }
  }, [me, t]);

  useEffect(() => {
    load();
  }, [load]);

  function likeUser(id: string) {
    if (!me) return;
    setBusy(id);
    setErr(null);
    try {
      const r = store.likeUser(me.userId, id);
      if (r.mutualMatch && r.matchId) {
        nav(`/chat/${r.matchId}`);
        return;
      }
      load();
    } catch {
      setErr(t("discover.likeFail"));
    }
    setBusy(null);
  }

  return (
    <div className="layout">
      <h1>{t("discover.title")}</h1>
      <p className="muted">
        {t("discover.subtitle")}{" "}
        <Link to="/onboarding">{t("discover.editProfile")}</Link>
      </p>
      {err && <p className="err">{err}</p>}
      {list.map((p) => (
        <div key={p.user_id} className="card">
          <div className="row">
            {p.primary_photo_url && (
              <img
                src={p.primary_photo_url}
                alt=""
                width={72}
                height={72}
                style={{ borderRadius: 8, objectFit: "cover" }}
              />
            )}
            <div>
              <strong>{p.display_name}</strong>{" "}
              {p.la_founding_member && <span className="muted">· {t("discover.laFounding")}</span>}
              <div className="muted">
                {typeof p.distance_km === "number" ? t("discover.kmAway", { km: p.distance_km }) : ""}
                {p.cityVisible === false && ` · ${t("discover.pinHidden")}`}
              </div>
              <div style={{ fontSize: "0.9rem" }}>{p.intent}</div>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                {t("discover.paperwork")}: {t(`sponsorship.${p.sponsorship_stance}`)}
              </div>
            </div>
          </div>
          {p.bio && <p>{p.bio}</p>}
          <button
            type="button"
            className="btn secondary"
            disabled={busy === p.user_id}
            onClick={() => likeUser(p.user_id)}
          >
            {t("discover.like")}
          </button>
        </div>
      ))}
      {list.length === 0 && !err && <p className="muted">{t("discover.empty")}</p>}
    </div>
  );
}
