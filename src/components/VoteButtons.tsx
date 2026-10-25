import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";

function ThumbUp() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 21h4V9H2v12zm19.8-10.1c.1-.3.2-.6.2-.9 0-1.1-.9-2-2-2h-6.3l1-4.7c.1-.5-.1-1-.5-1.4L13.2 1 7.6 6.6C7.2 7 7 7.5 7 8v10c0 1.1.9 2 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.9z"
      />
    </svg>
  );
}

function ThumbDown() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 3h-4v12h4V3zM2.2 13.1C2.1 13.4 2 13.7 2 14c0 1.1.9 2 2 2h6.3l-1 4.7c-.1.5.1 1 .5 1.4L10.8 23l5.6-5.6c.4-.4.6-.9.6-1.4V6c0-1.1-.9-2-2-2H6c-.8 0-1.5.5-1.8 1.2l-2 7.9z"
      />
    </svg>
  );
}

type Props = {
  postId?: string;
  commentId?: string;
  score: number;
  myVote?: number;
  compact?: boolean;
  onVoted?: () => void;
};

export default function VoteButtons({ postId, commentId, score, myVote = 0, compact = false, onVoted }: Props) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const nav = useNavigate();

  async function onVote(value: 1 | -1) {
    if (!loggedIn) {
      nav("/login");
      return;
    }
    try {
      if (commentId) await forum.voteComment(commentId, value);
      else if (postId) await forum.vote(postId, value);
      else return;
      onVoted?.();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={compact ? "vote-col vote-col--compact" : "vote-col"}>
      <button
        type="button"
        className={`vote-btn vote-btn--like${myVote === 1 ? " is-active" : ""}`}
        aria-label={t("forum.like")}
        aria-pressed={myVote === 1}
        onClick={() => void onVote(1)}
      >
        <ThumbUp />
      </button>
      <span className="vote-score">{score}</span>
      <button
        type="button"
        className={`vote-btn vote-btn--dislike${myVote === -1 ? " is-active" : ""}`}
        aria-label={t("forum.dislike")}
        aria-pressed={myVote === -1}
        onClick={() => void onVote(-1)}
      >
        <ThumbDown />
      </button>
    </div>
  );
}
