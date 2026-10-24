import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function connectionCandidates(): string[] {
  return [
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
  ]
    .map((s) => String(s ?? "").trim())
    .filter((s) => s.length > 0);
}
function isUnsupportedForNodePg(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.startsWith("prisma+postgres:") || u.startsWith("prisma://")) return true;
  return u.includes("prisma-data.net") || u.includes("prisma-data.in") || u.includes("accelerate.prisma");
}
function getDbConnectionString(): string {
  const list = connectionCandidates();
  const direct = list.find((u) => !isUnsupportedForNodePg(u));
  if (direct) return direct;
  return list[0] ?? "";
}

function parseJsonBody(req: { body?: unknown }): Record<string, unknown> {
  const raw = req.body;
  if (raw != null && typeof raw === "object" && !Buffer.isBuffer(raw) && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  let text: string;
  if (Buffer.isBuffer(raw)) text = raw.toString("utf8");
  else if (typeof raw === "string") text = raw;
  else return {};
  try {
    const o = JSON.parse(text) as unknown;
    return o != null && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

let pgPool: any = null;
let neonSql: any = null;
let neonBoundUrl: string | null = null;
let schemaReady = false;

function shouldUseNeonHttp(url: string): boolean {
  if (!url || isUnsupportedForNodePg(url)) return false;
  if (String(process.env.UCHRAL_USE_NEON_HTTP || "").trim() === "1") return true;
  const u = url.toLowerCase();
  return u.includes("neon.tech") || u.includes("api.neon.tech") || u.includes(".neon.build");
}

async function dbQuery(text: string, params: unknown[] = []): Promise<{ rows: any[] }> {
  const connection = getDbConnectionString();
  if (!connection) throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  if (isUnsupportedForNodePg(connection)) {
    throw new Error("Database URL must be direct Postgres (postgres://).");
  }
  if (shouldUseNeonHttp(connection)) {
    if (!neonSql || neonBoundUrl !== connection) {
      const { neon } = await import("@neondatabase/serverless");
      neonSql = neon(connection, { fullResults: true });
      neonBoundUrl = connection;
    }
    const result: any = await neonSql(text, params);
    return { rows: result.rows ?? [] };
  }
  if (!pgPool) {
    const { Pool } = await import("pg");
    const low = connection.toLowerCase();
    const ssl =
      low.includes("sslmode=require") || low.includes("supabase.com") || low.includes("db.prisma.io")
        ? { rejectUnauthorized: false }
        : undefined;
    pgPool = new Pool({
      connectionString: connection,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      ssl,
    });
  }
  return pgPool.query(text, params);
}

const SEED_COMMUNITIES: { slug: string; title: string; description: string; kind: string }[] = [
  { slug: "general", title: "General", description: "Anything Mongolian — questions, stories, daily life.", kind: "topic" },
  { slug: "news", title: "News", description: "Headlines and community news Mongolians want to discuss.", kind: "news" },
  { slug: "questions", title: "Questions", description: "Ask and answer. Guests can read; members can reply.", kind: "topic" },
  { slug: "dating", title: "Dating talk", description: "Optional dating conversation — not a swipe app.", kind: "dating" },
  { slug: "chicago", title: "Chicago", description: "Mongolians in Chicago.", kind: "city" },
  { slug: "los-angeles", title: "Los Angeles", description: "Mongolians in Los Angeles.", kind: "city" },
  { slug: "denver", title: "Denver", description: "Mongolians in Denver.", kind: "city" },
  { slug: "san-francisco", title: "San Francisco", description: "Mongolians in the Bay Area.", kind: "city" },
  { slug: "calgary", title: "Calgary", description: "Mongolians in Calgary.", kind: "city" },
  { slug: "ulaanbaatar", title: "Ulaanbaatar", description: "UB and Mongolia.", kind: "city" },
];

async function ensureSchema() {
  if (schemaReady) return;
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS forum_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      birthdate DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_sessions (
      token TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES forum_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_communities (
      id BIGSERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT 'topic',
      created_by BIGINT REFERENCES forum_users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_posts (
      id BIGSERIAL PRIMARY KEY,
      community_id BIGINT NOT NULL REFERENCES forum_communities(id) ON DELETE CASCADE,
      author_id BIGINT NOT NULL REFERENCES forum_users(id),
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_comments (
      id BIGSERIAL PRIMARY KEY,
      post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      author_id BIGINT NOT NULL REFERENCES forum_users(id),
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_votes (
      user_id BIGINT NOT NULL REFERENCES forum_users(id) ON DELETE CASCADE,
      post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      value INTEGER NOT NULL CHECK (value IN (-1, 1)),
      PRIMARY KEY (user_id, post_id)
    );
    CREATE TABLE IF NOT EXISTS dating_listings (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE REFERENCES forum_users(id) ON DELETE CASCADE,
      city TEXT NOT NULL,
      age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
      intro TEXT NOT NULL,
      contact TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  for (const c of SEED_COMMUNITIES) {
    await dbQuery(
      `INSERT INTO forum_communities (slug, title, description, kind)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.title, c.description, c.kind]
    );
  }
  schemaReady = true;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 32);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

function headerToken(req: VercelRequest): string {
  const raw = String(req.headers.authorization ?? req.headers.Authorization ?? "").trim();
  if (/^Bearer\s+/i.test(raw)) return raw.replace(/^Bearer\s+/i, "").trim();
  return raw;
}

function str(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}
function q(req: VercelRequest, key: string): string {
  const v = req.query[key];
  return String(Array.isArray(v) ? v[0] : v ?? "").trim();
}
function ageFromBirthdate(iso: string): number | null {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age -= 1;
  return age;
}
function publicUser(row: { id: number | string; email: string; display_name: string }) {
  return { id: String(row.id), email: row.email, displayName: row.display_name };
}

async function userFromToken(req: VercelRequest) {
  const token = headerToken(req);
  if (!token) return null;
  const { rows } = await dbQuery(
    `SELECT u.id, u.email, u.display_name
     FROM forum_sessions s JOIN forum_users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

async function requireUser(req: VercelRequest, res: VercelResponse) {
  const user = await userFromToken(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return null;
  }
  return user;
}

const POST_LIST_SQL = `
  SELECT p.id, p.title, p.body, p.created_at,
    c.slug AS community_slug, c.title AS community_title,
    u.display_name AS author_name,
    COALESCE((SELECT SUM(v.value) FROM forum_votes v WHERE v.post_id = p.id), 0)::int AS score,
    (SELECT COUNT(*) FROM forum_comments cm WHERE cm.post_id = p.id)::int AS comment_count
  FROM forum_posts p
  JOIN forum_communities c ON c.id = p.community_id
  JOIN forum_users u ON u.id = p.author_id
`;

function mapPost(row: any) {
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    communitySlug: row.community_slug,
    communityTitle: row.community_title,
    authorName: row.author_name,
    score: Number(row.score) || 0,
    commentCount: Number(row.comment_count) || 0,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!getDbConnectionString()) {
      return res.status(500).json({ error: "Database is not configured." });
    }
    await ensureSchema();
    const action = q(req, "action") || str(parseJsonBody(req).action, 40);

    if (req.method === "GET") {
      if (action === "me") {
        const user = await userFromToken(req);
        return res.status(200).json({ user: user ? publicUser(user) : null });
      }
      if (action === "communities" || action === "explore") {
        const { rows } = await dbQuery(
          `SELECT c.slug, c.title, c.description, c.kind,
                  (SELECT COUNT(*) FROM forum_posts p WHERE p.community_id = c.id)::int AS post_count
           FROM forum_communities c
           ORDER BY c.kind, c.title`
        );
        return res.status(200).json({
          communities: rows.map((r: any) => ({
            slug: r.slug,
            title: r.title,
            description: r.description,
            kind: r.kind,
            postCount: Number(r.post_count) || 0,
          })),
        });
      }
      if (action === "feed" || action === "popular" || action === "news") {
        const slug = action === "news" ? "news" : q(req, "community");
        const sort = action === "popular" ? "hot" : q(req, "sort") || "new";
        const order = sort === "hot" ? "score DESC, p.created_at DESC" : "p.created_at DESC";
        const params: unknown[] = [];
        let where = "";
        if (slug) {
          params.push(slug);
          where = `WHERE c.slug = $1`;
        }
        const { rows } = await dbQuery(`${POST_LIST_SQL} ${where} ORDER BY ${order} LIMIT 80`, params);
        return res.status(200).json({ posts: rows.map(mapPost) });
      }
      if (action === "community") {
        const slug = q(req, "slug");
        const { rows: comm } = await dbQuery(
          `SELECT slug, title, description, kind FROM forum_communities WHERE slug = $1`,
          [slug]
        );
        if (!comm[0]) return res.status(404).json({ error: "Community not found." });
        const { rows } = await dbQuery(`${POST_LIST_SQL} WHERE c.slug = $1 ORDER BY p.created_at DESC LIMIT 80`, [slug]);
        return res.status(200).json({ community: comm[0], posts: rows.map(mapPost) });
      }
      if (action === "post") {
        const id = q(req, "id");
        const { rows } = await dbQuery(`${POST_LIST_SQL} WHERE p.id = $1`, [id]);
        if (!rows[0]) return res.status(404).json({ error: "Post not found." });
        const { rows: comments } = await dbQuery(
          `SELECT cm.id, cm.body, cm.created_at, u.display_name AS author_name
           FROM forum_comments cm JOIN forum_users u ON u.id = cm.author_id
           WHERE cm.post_id = $1 ORDER BY cm.created_at ASC`,
          [id]
        );
        return res.status(200).json({
          post: mapPost(rows[0]),
          comments: comments.map((c: any) => ({
            id: String(c.id),
            body: c.body,
            createdAt: c.created_at,
            authorName: c.author_name,
          })),
        });
      }
      if (action === "dating") {
        const signedIn = !!(await userFromToken(req));
        const { rows } = await dbQuery(
          `SELECT d.id, d.city, d.age, d.intro, d.contact, d.created_at, u.display_name
           FROM dating_listings d JOIN forum_users u ON u.id = d.user_id
           ORDER BY d.created_at DESC LIMIT 80`
        );
        return res.status(200).json({
          listings: rows.map((r: any) => ({
            id: String(r.id),
            displayName: r.display_name,
            city: r.city,
            age: r.age,
            intro: r.intro,
            contact: signedIn ? r.contact : "",
            contactHidden: !signedIn,
            createdAt: r.created_at,
          })),
        });
      }
      return res.status(400).json({ error: "Unknown action." });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const body = parseJsonBody(req);
    const postAction = str(body.action, 40);

    if (postAction === "register") {
      const email = str(body.email, 120).toLowerCase();
      const password = String(body.password ?? "");
      const displayName = str(body.displayName, 40);
      const birthdate = str(body.birthdate, 10);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email." });
      if (password.length < 10) return res.status(400).json({ error: "Password must be at least 10 characters." });
      if (!/^[\p{L}\p{N} ]+$/u.test(displayName) || displayName.length < 2) {
        return res.status(400).json({ error: "Display name can only contain letters and numbers." });
      }
      const age = ageFromBirthdate(birthdate);
      if (age == null || age < 18) return res.status(400).json({ error: "You must be 18 or older." });
      try {
        const { rows } = await dbQuery(
          `INSERT INTO forum_users (email, password_hash, display_name, birthdate)
           VALUES ($1, $2, $3, $4) RETURNING id, email, display_name`,
          [email, hashPassword(password), displayName, birthdate]
        );
        const token = randomBytes(32).toString("hex");
        await dbQuery(`INSERT INTO forum_sessions (token, user_id) VALUES ($1, $2)`, [token, rows[0].id]);
        return res.status(200).json({ token, user: publicUser(rows[0]) });
      } catch (err: any) {
        if (String(err?.message || err).includes("forum_users_email_key") || String(err?.code) === "23505") {
          return res.status(409).json({ error: "That email is already registered." });
        }
        throw err;
      }
    }

    if (postAction === "login") {
      const email = str(body.email, 120).toLowerCase();
      const password = String(body.password ?? "");
      const { rows } = await dbQuery(
        `SELECT id, email, display_name, password_hash FROM forum_users WHERE email = $1`,
        [email]
      );
      const user = rows[0];
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: "Email or password is incorrect." });
      }
      const token = randomBytes(32).toString("hex");
      await dbQuery(`INSERT INTO forum_sessions (token, user_id) VALUES ($1, $2)`, [token, user.id]);
      return res.status(200).json({ token, user: publicUser(user) });
    }

    if (postAction === "logout") {
      const token = headerToken(req);
      if (token) await dbQuery(`DELETE FROM forum_sessions WHERE token = $1`, [token]);
      return res.status(200).json({ ok: true });
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (postAction === "createCommunity") {
      const title = str(body.title, 60);
      const description = str(body.description, 280);
      let slug = str(body.slug, 40).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
      if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) return res.status(400).json({ error: "Choose a short community name (letters and numbers)." });
      if (title.length < 2) return res.status(400).json({ error: "Community needs a title." });
      try {
        await dbQuery(
          `INSERT INTO forum_communities (slug, title, description, kind, created_by)
           VALUES ($1, $2, $3, 'city', $4)`,
          [slug, title, description, user.id]
        );
        return res.status(200).json({ community: { slug, title, description, kind: "city" } });
      } catch (err: any) {
        if (String(err?.code) === "23505") return res.status(409).json({ error: "That community already exists." });
        throw err;
      }
    }

    if (postAction === "createPost") {
      const communitySlug = str(body.communitySlug, 40);
      const title = str(body.title, 200);
      const postBody = str(body.body, 8000);
      if (title.length < 3) return res.status(400).json({ error: "Write a longer title." });
      const { rows: comm } = await dbQuery(`SELECT id FROM forum_communities WHERE slug = $1`, [communitySlug]);
      if (!comm[0]) return res.status(404).json({ error: "Community not found." });
      const { rows } = await dbQuery(
        `INSERT INTO forum_posts (community_id, author_id, title, body) VALUES ($1, $2, $3, $4) RETURNING id`,
        [comm[0].id, user.id, title, postBody]
      );
      return res.status(200).json({ id: String(rows[0].id) });
    }

    if (postAction === "createComment") {
      const postId = str(body.postId, 20);
      const commentBody = str(body.body, 2000);
      if (commentBody.length < 1) return res.status(400).json({ error: "Write a comment." });
      const { rows: post } = await dbQuery(`SELECT id FROM forum_posts WHERE id = $1`, [postId]);
      if (!post[0]) return res.status(404).json({ error: "Post not found." });
      await dbQuery(`INSERT INTO forum_comments (post_id, author_id, body) VALUES ($1, $2, $3)`, [
        postId,
        user.id,
        commentBody,
      ]);
      return res.status(200).json({ ok: true });
    }

    if (postAction === "vote") {
      const postId = str(body.postId, 20);
      const value = Number(body.value) === -1 ? -1 : 1;
      const { rows: post } = await dbQuery(`SELECT id FROM forum_posts WHERE id = $1`, [postId]);
      if (!post[0]) return res.status(404).json({ error: "Post not found." });
      await dbQuery(
        `INSERT INTO forum_votes (user_id, post_id, value) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, post_id) DO UPDATE SET value = EXCLUDED.value`,
        [user.id, postId, value]
      );
      return res.status(200).json({ ok: true });
    }

    if (postAction === "createDating") {
      const city = str(body.city, 80);
      const intro = str(body.intro, 600);
      const contact = str(body.contact, 160);
      const age = Number(body.age);
      if (!city || intro.length < 8) return res.status(400).json({ error: "Add your city and a short intro." });
      if (!Number.isInteger(age) || age < 18 || age > 120) return res.status(400).json({ error: "Age must be 18+." });
      await dbQuery(
        `INSERT INTO dating_listings (user_id, city, age, intro, contact)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET city = EXCLUDED.city, age = EXCLUDED.age, intro = EXCLUDED.intro, contact = EXCLUDED.contact, created_at = NOW()`,
        [user.id, city, age, intro, contact]
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (error) {
    console.error("forum api failed", error);
    if (!res.headersSent) return res.status(500).json({ error: "Server error." });
  }
}
