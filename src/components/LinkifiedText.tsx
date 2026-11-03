import { Fragment, type ReactNode } from "react";

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>]+/gi;
const TRAIL_PUNCT = /[.,;:!?)\]}'"…]+$/;

function hrefFor(raw: string): string | null {
  const trimmed = raw.replace(TRAIL_PUNCT, "");
  if (!trimmed) return null;
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export default function LinkifiedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const raw = match[0];
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const punct = raw.match(TRAIL_PUNCT)?.[0] ?? "";
    const core = punct ? raw.slice(0, -punct.length) : raw;
    const href = hrefFor(core);
    if (href) {
      nodes.push(
        <a key={`${index}-${core}`} href={href} target="_blank" rel="noopener noreferrer">
          {core}
        </a>
      );
      if (punct) nodes.push(punct);
    } else {
      nodes.push(raw);
    }
    last = index + raw.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>{n}</Fragment>
      ))}
    </>
  );
}
