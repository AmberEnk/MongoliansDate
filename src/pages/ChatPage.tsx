import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as store from "../localStore";

type Msg = { id: string; sender_id: string; body: string; created_at: string };

export default function ChatPage() {
  const { t } = useTranslation();
  const { matchId } = useParams();
  const me = store.getCurrentUser();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !me) return;
    if (!store.userInMatch(matchId, me.userId)) {
      setErr(t("chat.loadFail"));
      return;
    }
    setMessages(store.getMessages(matchId));
    setErr(null);
  }, [matchId, me, t]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!matchId || !me || !body.trim()) return;
    if (!store.userInMatch(matchId, me.userId)) {
      setErr(t("chat.sendFail"));
      return;
    }
    store.appendMessage(matchId, me.userId, body.trim());
    setMessages(store.getMessages(matchId));
    setBody("");
    setErr(null);
  }

  return (
    <div className="layout">
      <p className="chat-back">
        <Link to="/discover">{t("chat.backDiscover")}</Link>
      </p>
      <h1>{t("chat.title")}</h1>
      {err && <p className="err">{err}</p>}
      <div className="card chat-thread">
        {messages.map((m) => (
          <p key={m.id}>
            <span className="muted">{store.displayNameForUserId(m.sender_id)}</span> {m.body}
          </p>
        ))}
      </div>
      <form onSubmit={send} className="row chat-form">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("chat.placeholder")}
          autoComplete="off"
        />
        <button type="submit" className="btn">
          {t("chat.send")}
        </button>
      </form>
    </div>
  );
}
