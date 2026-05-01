import { LA_METRO_DEFAULT } from "./constants";

const KEYS = {
  users: "md_local_users",
  sessionEmail: "md_local_session_email",
  profile: (userId: string) => `md_local_profile_${userId}`,
  likes: "md_local_likes",
  matches: "md_local_matches",
  messages: (matchId: string) => `md_local_messages_${matchId}`,
} as const;

const LETTER_NUMBER_SPACE_ONLY = /^[\p{L}\p{N} ]+$/u;

export type UserRecord = {
  email: string;
  password: string;
  userId: string;
  displayName: string;
  birthdate: string;
  laFounding: boolean;
};

export type ProfileRecord = {
  bio: string;
  intent: string;
  sponsorship_stance: string;
  sponsorship_detail?: string;
  heritage_tags: string[];
  languages: string[];
  onboardingComplete: boolean;
  primary_photo_data_url?: string;
};

export type DiscoveryProfile = {
  user_id: string;
  display_name: string;
  distance_km: number;
  intent: string;
  sponsorship_stance: string;
  bio?: string;
  primary_photo_url?: string;
  la_founding_member?: boolean;
  cityVisible?: boolean;
};

type Like = { from: string; to: string };
type Match = { id: string; a: string; b: string };

type ChatMessage = { id: string; sender_id: string; body: string; created_at: string };

function uid(): string {
  return `u-${crypto.randomUUID()}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Demo profiles — no network; images from picsum (deterministic per seed). */
const MOCK_SEEDS = [1, 2, 3, 4, 5] as const;

function mockProfile(seed: number): DiscoveryProfile {
  const stances = ["open_to_discuss", "prefer_not_say", "can_sponsor", "varies", "not_applicable"] as const;
  const names = ["Ariunaa", "Batbayar", "Oyunaa", "Enkhbold", "Tsetseg"] as const;
  const bios = [
    "Coffee, hikes, and weekend Mongolian pop.",
    "LA native · family in UB · long-term when it fits.",
    "Grad student · love khöömi and art openings.",
    "Engineer · looking for something real.",
    "Nurse · founding member energy · say hi!",
  ] as const;
  const i = seed - 1;
  return {
    user_id: `mock-${seed}`,
    display_name: names[i] ?? `Friend ${seed}`,
    distance_km: 4 + seed * 7,
    intent: "Long-term · marriage-minded when it fits",
    sponsorship_stance: stances[i % stances.length],
    bio: bios[i],
    primary_photo_url: `https://picsum.photos/seed/mdlocal${seed}/144/144`,
    la_founding_member: seed <= 2,
    cityVisible: seed % 2 === 0,
  };
}

function readUsers(): Record<string, UserRecord> {
  return safeParse(localStorage.getItem(KEYS.users), {} as Record<string, UserRecord>);
}

function writeUsers(u: Record<string, UserRecord>) {
  localStorage.setItem(KEYS.users, JSON.stringify(u));
}

export function getSessionEmail(): string | null {
  return localStorage.getItem(KEYS.sessionEmail);
}

export function setSessionEmail(email: string | null) {
  if (email) localStorage.setItem(KEYS.sessionEmail, email);
  else localStorage.removeItem(KEYS.sessionEmail);
}

export function getCurrentUser(): UserRecord | null {
  const email = getSessionEmail();
  if (!email) return null;
  const users = readUsers();
  return users[email.toLowerCase()] ?? null;
}

export function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  birthdate: string;
  optInLaFoundingMember: boolean;
}): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const users = readUsers();
  if (users[email]) return { ok: false, error: "Email already registered" };
  if (!LETTER_NUMBER_SPACE_ONLY.test(displayName)) {
    return { ok: false, error: "Display name must use letters and numbers only" };
  }
  const rec: UserRecord = {
    email,
    password: input.password,
    userId: uid(),
    displayName,
    birthdate: input.birthdate,
    laFounding: input.optInLaFoundingMember,
  };
  users[email] = rec;
  writeUsers(users);
  return { ok: true };
}

export function loginUser(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const users = readUsers();
  const rec = users[email.trim().toLowerCase()];
  if (!rec || rec.password !== password) return { ok: false, error: "Invalid email or password" };
  setSessionEmail(rec.email);
  return { ok: true };
}

export function logoutUser() {
  setSessionEmail(null);
}

function getProfile(userId: string): ProfileRecord | null {
  return safeParse(localStorage.getItem(KEYS.profile(userId)), null);
}

function setProfile(userId: string, p: ProfileRecord) {
  localStorage.setItem(KEYS.profile(userId), JSON.stringify(p));
}

export function loadMyProfile(userId: string): ProfileRecord | null {
  return getProfile(userId);
}

export function saveMyProfile(
  userId: string,
  patch: Partial<ProfileRecord> & { markOnboardingComplete?: boolean }
) {
  const prev = getProfile(userId) ?? {
    bio: "",
    intent: "",
    sponsorship_stance: "prefer_not_say",
    heritage_tags: [],
    languages: [],
    onboardingComplete: false,
  };
  const next: ProfileRecord = {
    ...prev,
    bio: patch.bio ?? prev.bio,
    intent: patch.intent ?? prev.intent,
    sponsorship_stance: patch.sponsorship_stance ?? prev.sponsorship_stance,
    sponsorship_detail: patch.sponsorship_detail ?? prev.sponsorship_detail,
    heritage_tags: patch.heritage_tags ?? prev.heritage_tags,
    languages: patch.languages ?? prev.languages,
    primary_photo_data_url: patch.primary_photo_data_url ?? prev.primary_photo_data_url,
    onboardingComplete: patch.markOnboardingComplete ? true : prev.onboardingComplete,
  };
  setProfile(userId, next);
}

export function setPrimaryPhotoDataUrl(userId: string, dataUrl: string) {
  const prev = getProfile(userId) ?? {
    bio: "",
    intent: "Long-term · marriage-minded when it fits",
    sponsorship_stance: "prefer_not_say",
    heritage_tags: [],
    languages: [],
    onboardingComplete: false,
  };
  setProfile(userId, { ...prev, primary_photo_data_url: dataUrl });
}

function readLikes(): Like[] {
  return safeParse(localStorage.getItem(KEYS.likes), [] as Like[]);
}

function writeLikes(likes: Like[]) {
  localStorage.setItem(KEYS.likes, JSON.stringify(likes));
}

function readMatches(): Match[] {
  return safeParse(localStorage.getItem(KEYS.matches), [] as Match[]);
}

function writeMatches(m: Match[]) {
  localStorage.setItem(KEYS.matches, JSON.stringify(m));
}

function findOrCreateMatchId(a: string, b: string): string {
  const matches = readMatches();
  const found = matches.find(
    (m) => (m.a === a && m.b === b) || (m.a === b && m.b === a)
  );
  if (found) return found.id;
  const id = `match-${crypto.randomUUID()}`;
  matches.push({ id, a, b });
  writeMatches(matches);
  return id;
}

export function getDiscoveryList(forUserId: string): DiscoveryProfile[] {
  const users = readUsers();
  const out: DiscoveryProfile[] = [];

  for (const seed of MOCK_SEEDS) {
    const m = mockProfile(seed);
    if (m.user_id !== forUserId) out.push(m);
  }

  for (const u of Object.values(users)) {
    if (u.userId === forUserId) continue;
    const p = getProfile(u.userId);
    if (!p?.onboardingComplete && !p?.bio) continue;
    const dist = 8 + (u.userId.charCodeAt(0) % 40);
    out.push({
      user_id: u.userId,
      display_name: u.displayName,
      distance_km: dist,
      intent: p.intent || "—",
      sponsorship_stance: p.sponsorship_stance || "prefer_not_say",
      bio: p.bio,
      primary_photo_url: p.primary_photo_data_url,
      la_founding_member: u.laFounding,
      cityVisible: true,
    });
  }

  void LA_METRO_DEFAULT;
  return out;
}

export function likeUser(
  fromUserId: string,
  toUserId: string
): { mutualMatch: boolean; matchId?: string } {
  const likes = readLikes();
  if (!likes.some((l) => l.from === fromUserId && l.to === toUserId)) {
    likes.push({ from: fromUserId, to: toUserId });
  }
  // Demo: mock profiles "like back" so chat can be tried without a second browser profile.
  if (
    toUserId.startsWith("mock-") &&
    !likes.some((l) => l.from === toUserId && l.to === fromUserId)
  ) {
    likes.push({ from: toUserId, to: fromUserId });
  }
  writeLikes(likes);

  const mutual = likes.some((l) => l.from === toUserId && l.to === fromUserId);
  if (!mutual) return { mutualMatch: false };

  const id = findOrCreateMatchId(fromUserId, toUserId);
  return { mutualMatch: true, matchId: id };
}

export function getMessages(matchId: string): ChatMessage[] {
  return safeParse(localStorage.getItem(KEYS.messages(matchId)), [] as ChatMessage[]);
}

export function appendMessage(matchId: string, senderId: string, body: string) {
  const list = getMessages(matchId);
  const msg: ChatMessage = {
    id: `msg-${crypto.randomUUID()}`,
    sender_id: senderId,
    body,
    created_at: new Date().toISOString(),
  };
  list.push(msg);
  localStorage.setItem(KEYS.messages(matchId), JSON.stringify(list));
  return msg;
}

export function userInMatch(matchId: string, userId: string): boolean {
  const m = readMatches().find((x) => x.id === matchId);
  if (!m) return false;
  return m.a === userId || m.b === userId;
}

/** Resolve display label for chat sender (mock or registered). */
export function displayNameForUserId(userId: string): string {
  if (userId.startsWith("mock-")) {
    const n = Number(userId.replace("mock-", ""));
    const m = mockProfile(Number.isFinite(n) ? n : 1);
    return m.display_name;
  }
  const users = readUsers();
  for (const u of Object.values(users)) {
    if (u.userId === userId) return u.displayName;
  }
  return userId.slice(0, 8);
}
