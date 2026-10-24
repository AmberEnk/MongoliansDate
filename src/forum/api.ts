import type { Community, DatingListing, ForumComment, ForumPost, ForumUser } from "./types";

const TOKEN_KEY = "uchral.forumToken";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(r: Response, fallback: string): Promise<string> {
  try {
    const j = (await r.json()) as { error?: string };
    if (j?.error) return j.error;
  } catch {
    /* ignore */
  }
  return fallback;
}

async function getJson<T>(action: string, extra: Record<string, string> = {}): Promise<T> {
  const q = new URLSearchParams({ action, ...extra });
  const r = await fetch(`/api/forum?${q}`, { headers: authHeaders() });
  if (!r.ok) throw new Error(await readError(r, "Could not load."));
  return r.json() as Promise<T>;
}

async function postJson<T>(body: Record<string, unknown>): Promise<T> {
  const r = await fetch("/api/forum", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readError(r, "Request failed."));
  return r.json() as Promise<T>;
}

export async function fetchMe(): Promise<ForumUser | null> {
  const data = await getJson<{ user: ForumUser | null }>("me");
  return data.user;
}

export async function register(input: {
  email: string;
  password: string;
  displayName: string;
  birthdate: string;
}): Promise<{ token: string; user: ForumUser }> {
  return postJson({ action: "register", ...input });
}

export async function login(email: string, password: string): Promise<{ token: string; user: ForumUser }> {
  return postJson({ action: "login", email, password });
}

export async function logout(): Promise<void> {
  try {
    await postJson({ action: "logout" });
  } finally {
    setToken(null);
  }
}

export async function fetchFeed(kind: "feed" | "popular" | "news"): Promise<ForumPost[]> {
  const data = await getJson<{ posts: ForumPost[] }>(kind);
  return data.posts;
}

export async function fetchCommunities(): Promise<Community[]> {
  const data = await getJson<{ communities: Community[] }>("explore");
  return data.communities;
}

export async function fetchCommunity(slug: string): Promise<{ community: Community; posts: ForumPost[] }> {
  return getJson("community", { slug });
}

export async function fetchPost(id: string): Promise<{ post: ForumPost; comments: ForumComment[] }> {
  return getJson("post", { id });
}

export async function fetchDating(): Promise<DatingListing[]> {
  const data = await getJson<{ listings: DatingListing[] }>("dating");
  return data.listings;
}

export async function createCommunity(input: { title: string; slug?: string; description: string }) {
  return postJson<{ community: Community }>({ action: "createCommunity", ...input });
}

export async function createPost(input: { communitySlug: string; title: string; body: string }) {
  return postJson<{ id: string }>({ action: "createPost", ...input });
}

export async function createComment(postId: string, body: string) {
  return postJson({ action: "createComment", postId, body });
}

export async function vote(postId: string, value: 1 | -1) {
  return postJson({ action: "vote", postId, value });
}

export async function saveDating(input: { city: string; age: number; intro: string; contact: string }) {
  return postJson({ action: "createDating", ...input });
}
