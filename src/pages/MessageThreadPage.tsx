import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { DmMessage, DmThread } from "../forum/types";

export default function MessageThreadPage() {
  const { id = "" } = useParams();
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const nav = useNavigate();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [thread, setThread] = useState<DmThread | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await forum.fetchDm(id);
      setThread(data.thread);
      setMessages(data.messages);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("chat.loadFail"));
    }
  }, [id, t]);

  useEffect(() => {
    if (loggedIn) void load();
  }, [loggedIn, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const r = await forum.sendDm(id, body.trim());
      setMessages((prev) => [...prev, r.message]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chat.sendFail"));
    } finally {
      setSending(false);
    }
  }

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="forum-page">
      <p className="chat-back">
        <Link to="/messages">{t("chat.backInbox")}</Link>
      </p>
      <header className="forum-page__head">
        <div>
          <h1>{thread ? thread.otherName : t("chat.title")}</h1>
          <p className="subtle-hint">{t("chat.threadHint")}</p>
        </div>
        <Link to="/dating" className="btn secondary">
          {t("forum.dating")}
        </Link>
      </header>
      {error ? <p className="err">{error}</p> : null}
      <div className="card chat-thread dm-thread">
        {!messages.length ? <p className="muted">{t("chat.noMessagesYet")}</p> : null}
        {messages.map((m) => (
          <p key={m.id} className={m.mine ? "dm-bubble dm-bubble--mine" : "dm-bubble"}>
            <span className="muted">{m.mine ? t("chat.you") : m.senderName}</span>
            <span className="dm-bubble__body">{m.body}</span>
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="row chat-form" onSubmit={(e) => void onSend(e)}>
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("chat.placeholder")}
          autoComplete="off"
          disabled={sending}
        />
        <button type="submit" className="btn" disabled={sending || !body.trim()}>
          {t("chat.send")}
        </button>
      </form>
      <p className="subtle-hint">
        <button type="button" className="linkish" onClick={() => nav("/help")}>
          {t("help.report")}
        </button>
      </p>
    </div>
  );
}
