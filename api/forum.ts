import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
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
let schemaPromise: Promise<void> | null = null;

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
  { slug: "jobs", title: "Jobs", description: "Work, visas, and career talk — not legal advice.", kind: "topic" },
  { slug: "food", title: "Food", description: "Buuz, suutei tsai, groceries, restaurants.", kind: "topic" },
  { slug: "students", title: "Students", description: "School, housing, and first years abroad.", kind: "topic" },
  { slug: "housing", title: "Housing", description: "Rent, roommates, and moving.", kind: "topic" },
  { slug: "chicago", title: "Chicago", description: "Mongolians in Chicago.", kind: "city" },
  { slug: "los-angeles", title: "Los Angeles", description: "Mongolians in Los Angeles.", kind: "city" },
  { slug: "denver", title: "Denver", description: "Mongolians in Denver.", kind: "city" },
  { slug: "san-francisco", title: "San Francisco", description: "Mongolians in the Bay Area.", kind: "city" },
  { slug: "calgary", title: "Calgary", description: "Mongolians in Calgary.", kind: "city" },
  { slug: "ulaanbaatar", title: "Ulaanbaatar", description: "UB and Mongolia.", kind: "city" },
  { slug: "toronto", title: "Toronto", description: "Mongolians in Toronto.", kind: "city" },
  { slug: "new-york", title: "New York", description: "Mongolians in New York.", kind: "city" },
  { slug: "seattle", title: "Seattle", description: "Mongolians in Seattle.", kind: "city" },
  { slug: "washington-dc", title: "Washington DC", description: "Mongolians in the DC area.", kind: "city" },
  { slug: "houston", title: "Houston", description: "Mongolians in Houston.", kind: "city" },
  { slug: "boston", title: "Boston", description: "Mongolians in Boston.", kind: "city" },
  { slug: "salt-lake-city", title: "Salt Lake City", description: "Mongolians in Salt Lake City.", kind: "city" },
  { slug: "seoul", title: "Seoul", description: "Mongolians in Korea.", kind: "city" },
  { slug: "prague", title: "Prague", description: "Mongolians in Czechia.", kind: "city" },
  { slug: "london", title: "London", description: "Mongolians in the UK.", kind: "city" },
  { slug: "sydney", title: "Sydney", description: "Mongolians in Australia.", kind: "city" },
];

const SEED_PEOPLE: { key: string; name: string }[] = [
  { key: "naraa", name: "Naraa" },
  { key: "batu", name: "Batu" },
  { key: "oyunaa", name: "Oyunaa" },
  { key: "temuulen", name: "Temuulen" },
  { key: "khulan", name: "Khulan" },
  { key: "enkhee", name: "Enkhee" },
  { key: "saruul", name: "Saruul" },
  { key: "munkh", name: "Munkh" },
];

type SeedComment = { author: string; hoursAgo: number; body: string };
type SeedPost = {
  key: string;
  slug: string;
  author: string;
  hoursAgo: number;
  title: string;
  body: string;
  up: string[];
  comments: SeedComment[];
};

const SEED_POSTS: SeedPost[] = [
  {
    key: "abroad-vs-home",
    slug: "questions",
    author: "naraa",
    hoursAgo: 6,
    title: "Гадаадад амьдарч байгаа хүмүүс ээ — эх оронтойгоо харьцуулахад ямар вэ?",
    body: "Цалин, түрээс, гэр бүл, агаар. Зарим нь буцахаа бодож, зарим нь үлдэх гэж байна. Танайх яг ямар байна? Гоёчилж бичих хэрэггүй, энгийнээр ярина уу.",
    up: ["batu", "oyunaa", "temuulen", "khulan", "enkhee"],
    comments: [
      {
        author: "batu",
        hoursAgo: 5,
        body: "Цалин илүү, агаар илүү. Гэхдээ гэр бүл хол, түрээс үнэтэй. Дунд нь л явж байна.",
      },
      {
        author: "oyunaa",
        hoursAgo: 4,
        body: "Анхны жил хэцүү. Дараа нь найз нөхөд, ажил олдвол их өөр болдог. Гэртээ очоод хэд хоног байгаад ирэхэд л харьцуулалт тодорхой болдог.",
      },
    ],
  },
  {
    key: "usa-life",
    slug: "jobs",
    author: "temuulen",
    hoursAgo: 14,
    title: "Америкт ажиллаж байгаа хүмүүс, амьдрал яг ямар юм бэ?",
    body: "Программист төгссөн. Зарим нь боломж их гэж, зарим нь ганцаардал, эрүүл мэндийн даатгал, виз гэж ярьдаг. Танай компани, түрээс, амралтын өдөр ямар байгааг сонсмоор байна. Энэ бол хуулийн зөвлөгөө биш — зөвхөн туршлага.",
    up: ["naraa", "munkh", "enkhee", "saruul"],
    comments: [
      {
        author: "munkh",
        hoursAgo: 12,
        body: "Ажил олдвол цалин сайн. Гэхдээ өвдвөл даатгалгүй бол маш хэцүү. Амралт Монгол шиг урт биш.",
      },
    ],
  },
  {
    key: "keep-culture",
    slug: "general",
    author: "khulan",
    hoursAgo: 20,
    title: "Гадаадад Монгол соёлоо яаж хадгалах вэ?",
    body: "Наадам, Цагаан сар, монгол телевиз, хүүхдэд хэл заах. Танай хотод юу ажилладаг вэ? Facebook групп, сүм, спортын клуб — юу нь үнэхээр хэрэгтэй вэ?",
    up: ["naraa", "oyunaa", "saruul"],
    comments: [
      {
        author: "saruul",
        hoursAgo: 18,
        body: "Хүүхэдтэй бол монгол цэцэрлэг эсвэл ням гарагийн хичээл хай. Хотод Наадам байвал оч. Байхгүй бол гэртээ бууз хийж, дуу оруулаад л эхэлдэг.",
      },
    ],
  },
  {
    key: "buuz-map",
    slug: "food",
    author: "oyunaa",
    hoursAgo: 9,
    title: "Хотуудад бууз, мах, сүүтэй цай хаанаас авдаг вэ?",
    body: "Чикаго, Калгари, Лос-Анжелес, Сөүл, Прага — монгол дэлгүүр, ресторан, эсвэл хамт захиалдаг группийн нэр хуваалцана уу. Шинэ хүмүүст энэ хамгийн түрүүнд хэрэгтэй.",
    up: ["batu", "naraa", "khulan", "enkhee", "temuulen", "munkh"],
    comments: [
      { author: "batu", hoursAgo: 8, body: "Чикагод Азийн дэлгүүрээс хурганы мах, гэртээ бууз хийдэг. Ресторан цөөн." },
      { author: "enkhee", hoursAgo: 7, body: "Калгари, Торонтод монгол дэлгүүр олддог. LA-д Koreatown орчимд асуугаарай." },
    ],
  },
  {
    key: "ub-air",
    slug: "ulaanbaatar",
    author: "enkhee",
    hoursAgo: 30,
    title: "УБ-ын агаар энэ өвөл ямар байна?",
    body: "Гадаадаас буцахаар төлөвлөж байгаа хүмүүс асууж байна. Гэр хороолол, төв, хүүхэдтэй гэр бүл — танайх яг юу харж байна?",
    up: ["naraa", "batu", "oyunaa"],
    comments: [{ author: "naraa", hoursAgo: 28, body: "Өвлийн орой хүнд. Маск, агаар шүүгч ярьдаг. Зун огт өөр." }],
  },
  {
    key: "send-money",
    slug: "questions",
    author: "batu",
    hoursAgo: 11,
    title: "Монгол руу мөнгө яаж хямд дамжуулах вэ?",
    body: "Wise, банк, найзаараа дамжуулах — та юу хэрэглэж байгаа вэ? Шийтгэл, хурд, лимит. Хувийн дансны дугаар битгий тавь.",
    up: ["temuulen", "munkh", "saruul", "khulan"],
    comments: [
      {
        author: "temuulen",
        hoursAgo: 10,
        body: "Би банкны апп + Wise хоёуланг харьцуулдаг. Тухайн үеийн ханш өөр. Шинэ хүнд нэг том гүйлгээгээр туршаарай.",
      },
    ],
  },
  {
    key: "flights-ub",
    slug: "questions",
    author: "saruul",
    hoursAgo: 40,
    title: "УБ руу хямд нислэг хэзээ, хаанаас авах вэ?",
    body: "Цагаан сар, Наадам, зуны амралт. Сеул, Стамбул, Бээжин дамжлага. Та хэдэн сарын өмнө захиалдаг вэ?",
    up: ["oyunaa", "naraa", "enkhee"],
    comments: [],
  },
  {
    key: "student-first-year",
    slug: "students",
    author: "munkh",
    hoursAgo: 16,
    title: "Оюутны эхний жил: банк, утас, өрөө",
    body: "Шинээр ирсэн хүмүүст. Банк нээх, SIM, кампусын гаднах өрөө, хамт амьдрах. Танай улсад юу нь хамгийн түрүүнд хэрэгтэй вэ?",
    up: ["khulan", "temuulen", "naraa"],
    comments: [
      {
        author: "khulan",
        hoursAgo: 15,
        body: "Эхлээд сургуулийн орон сууц, дараа нь банк. Ганцаараа түрээс хийхээр бүү яар. Facebook дээрх зар болгонд бүү итгэ.",
      },
    ],
  },
  {
    key: "rent-abroad",
    slug: "housing",
    author: "oyunaa",
    hoursAgo: 22,
    title: "Түрээс хэр үнэтэй вэ, хамт амьдрах уу?",
    body: "Нэг өрөө vs хамт амьдрах. Барьцаа, кредит, батлан даагч. Чикаго, Торонто, Сөүл, Прага — ойролцоо тоо хэлбэл шинэ хүнд тусална.",
    up: ["batu", "munkh", "saruul"],
    comments: [],
  },
  {
    key: "chicago-weekend",
    slug: "chicago",
    author: "batu",
    hoursAgo: 3,
    title: "Чикаго: энэ амралтын өдөр бууз, сагс, эсвэл яриа",
    body: "Хотын монголчуудтай уулзмаар байна. Хоол, номын сан, эсвэл энгийн кофе. Шинэ хүмүүс ч байж болно. Хаана цугладаг вэ?",
    up: ["naraa", "oyunaa"],
    comments: [{ author: "naraa", hoursAgo: 2, body: "Би ч бас хайж байна. Хүнсний дэлгүүр эсвэл Наадмын бэлтгэл дээр олддог." }],
  },
  {
    key: "calgary-new",
    slug: "calgary",
    author: "enkhee",
    hoursAgo: 18,
    title: "Калгари шинээр ирлээ — дэлгүүр, эмч, жолооны үнэмлэх",
    body: "Өвөл ойртож байна. Дулаан куртка, монгол хүнс, гэр бүлийн эмч. Танайх эхний сард юу хийсэн бэ?",
    up: ["saruul", "batu", "naraa", "khulan"],
    comments: [
      { author: "saruul", hoursAgo: 17, body: "Winter tires бүү мартаарай. Дэлгүүр Northeast талд олддог гэж сонссон." },
    ],
  },
  {
    key: "la-food",
    slug: "los-angeles",
    author: "khulan",
    hoursAgo: 26,
    title: "LA-д монгол хоол, Koreatown, цуглаан",
    body: "Лос-Анжелес том. Хаанаас бууз, хуушуур, эсвэл монголчуудтай таардаг вэ? Машингүй бол яаж хүрэх вэ?",
    up: ["oyunaa", "temuulen"],
    comments: [],
  },
  {
    key: "denver-weekend",
    slug: "denver",
    author: "temuulen",
    hoursAgo: 33,
    title: "Денвер: уул, цана, Наадам",
    body: "Ууланд гарах, өвлийн спорт, зуны Наадам. Шинэ хүмүүсийг авч явдаг груп байдаг уу?",
    up: ["munkh", "batu"],
    comments: [],
  },
  {
    key: "bay-intern",
    slug: "san-francisco",
    author: "munkh",
    hoursAgo: 28,
    title: "Bay Area intern / tech — монголчууд холбоо барина уу",
    body: "Сургууль эсвэл ажилд орж ирсэн. Орон сууц үнэтэй. Туршлага, resume, өрөө хуваах талаар ярилцмаар байна.",
    up: ["temuulen", "naraa", "khulan"],
    comments: [],
  },
  {
    key: "toronto-vs-calgary",
    slug: "toronto",
    author: "saruul",
    hoursAgo: 8,
    title: "Торонто vs Калгари vs Ванкувер — хаана амьдрах вэ?",
    body: "Ажил, цас, монгол нийгэмлэг, түрээс. Гэр бүлтэй, ганцаараа хоёуланд нь сонсохыг хүсэж байна.",
    up: ["enkhee", "oyunaa", "batu", "naraa"],
    comments: [
      { author: "enkhee", hoursAgo: 7, body: "Калгари түрээс арай хямд, өвөл хүнд. Торонтод ажил, нийтийн тээвэр илүү." },
    ],
  },
  {
    key: "nyc-meet",
    slug: "new-york",
    author: "naraa",
    hoursAgo: 36,
    title: "Нью-Йорк дахь монголчууд, хаана уулздаг вэ?",
    body: "Queens, Brooklyn, Manhattan. Цагаан сар, концерт, эсвэл энгийн цуглаан. Шинэ хүн хаашаа явах вэ?",
    up: ["khulan", "oyunaa"],
    comments: [],
  },
  {
    key: "seattle-rain",
    slug: "seattle",
    author: "batu",
    hoursAgo: 44,
    title: "Сиэтл: бороо, ажил, нийгэмлэг",
    body: "Tech, кофе, бороо. Монголчууд хэр олон, Наадам хаана болдог вэ?",
    up: ["munkh", "temuulen"],
    comments: [],
  },
  {
    key: "dc-embassy",
    slug: "washington-dc",
    author: "oyunaa",
    hoursAgo: 50,
    title: "DC орчим: паспорт, нийгэмлэг, цуглаан",
    body: "Элчин, бичиг баримт, амралтын өдрийн цуглаан. Туршлагаа хуваалцана уу — хуулийн зөвлөгөө биш.",
    up: ["naraa", "saruul"],
    comments: [],
  },
  {
    key: "seoul-work",
    slug: "seoul",
    author: "enkhee",
    hoursAgo: 12,
    title: "Сөүлд ажиллаж, сурч байгаа хүмүүс",
    body: "Хэл, дотуур байр, цалин, амралт. Солонгост удаан байгаа хүмүүс шинээр ирсэнд юу зөвлөх вэ?",
    up: ["batu", "khulan", "munkh", "naraa", "oyunaa"],
    comments: [
      { author: "khulan", hoursAgo: 11, body: "Хэл сурах нь бүхнийг өөрчилдөг. Эхний жил ядраана, дараа нь найз нөхөд олддог." },
    ],
  },
  {
    key: "prague-students",
    slug: "prague",
    author: "khulan",
    hoursAgo: 24,
    title: "Прага / Чех дэх оюутнууд",
    body: "Сургууль, виз, ажил. Монголчууд их. Шинэ семестрт ирж байгаа хүмүүст өрөө, утас, даатгал дээр юу чухал вэ?",
    up: ["saruul", "enkhee", "temuulen"],
    comments: [],
  },
  {
    key: "kids-language",
    slug: "general",
    author: "saruul",
    hoursAgo: 15,
    title: "Гадаадад өсөж байгаа хүүхдэд монгол хэл яаж заах вэ?",
    body: "Гэртээ зөвхөн монгол ярих, YouTube, ном, эцэг эхийн дүрэм. Хоёр хэлтэй хүүхэдтэй аав ээжүүд юу нь ажилладаг вэ?",
    up: ["naraa", "oyunaa", "khulan", "enkhee"],
    comments: [
      { author: "oyunaa", hoursAgo: 13, body: "Гэртээ нэг хэл, гадаа нэг хэл гэж хатуу барих нь надад тусалсан. Төгс биш, гэхдээ зогсдоггүй." },
    ],
  },
  {
    key: "news-ub-traffic",
    slug: "news",
    author: "temuulen",
    hoursAgo: 10,
    title: "УБ-ын түгжрэл, шинэ зам — танай өдөр ямар байна?",
    body: "Мэдээ уншаад дуусдаггүй. Та хотод яг юу мэдэрч байна? Нийтийн тээвэр, машин, алхах. Эх сурвалжаа нэрлээд, цуурхал битгий тараагаарай.",
    up: ["batu", "naraa", "munkh"],
    comments: [],
  },
  {
    key: "london-life",
    slug: "london",
    author: "naraa",
    hoursAgo: 55,
    title: "Лондон / UK: сургууль, ажил, цаг агаар",
    body: "Бороо, түрээс, NHS. Монголчуудтай хаана таардаг вэ?",
    up: ["khulan"],
    comments: [],
  },
  {
    key: "sydney-life",
    slug: "sydney",
    author: "munkh",
    hoursAgo: 60,
    title: "Сидней: виз, ажил, далайн эрэг",
    body: "Австралид байгаа монголчууд. Эхний жил юу нь хамгийн хэцүү байсан бэ?",
    up: ["saruul", "temuulen"],
    comments: [],
  },
  {
    key: "houston-tx",
    slug: "houston",
    author: "batu",
    hoursAgo: 38,
    title: "Хьюстон: машин, халуун, монголчууд",
    body: "Техас том. Жолоо барих, зуны халуун, ажил. Танайх хаана цугладаг вэ?",
    up: ["enkhee", "naraa"],
    comments: [],
  },
  {
    key: "boston-school",
    slug: "boston",
    author: "khulan",
    hoursAgo: 42,
    title: "Бостон дахь оюутнууд, өвөл, Т",
    body: "Сургууль, цас, нийтийн тээвэр. Шинээр ирж байгаа хүмүүст өрөө, куртка, SIM дээр зөвлөгөө хэрэгтэй.",
    up: ["munkh", "oyunaa"],
    comments: [],
  },
  {
    key: "slc-community",
    slug: "salt-lake-city",
    author: "oyunaa",
    hoursAgo: 48,
    title: "Солт-Лейк: нийгэмлэг, уул, Наадам",
    body: "Энд монголчууд олон гэж сонссон. Сүм, спорт, Цагаан сар хаана болдог вэ?",
    up: ["saruul", "batu", "naraa"],
    comments: [],
  },
];

function seedEmail(key: string): string {
  return `seed-${key}@uchral.internal`;
}

async function ensureSchema() {
  if (schemaReady) return;
  if (!schemaPromise) schemaPromise = buildSchema().finally(() => {
    if (!schemaReady) schemaPromise = null;
  });
  await schemaPromise;
}

async function buildSchema() {
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
    CREATE TABLE IF NOT EXISTS forum_password_resets (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES forum_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_reports (
      id BIGSERIAL PRIMARY KEY,
      reporter_id BIGINT REFERENCES forum_users(id) ON DELETE SET NULL,
      post_id BIGINT REFERENCES forum_posts(id) ON DELETE SET NULL,
      target_user_id BIGINT REFERENCES forum_users(id) ON DELETE SET NULL,
      reason TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS forum_rate (
      id BIGSERIAL PRIMARY KEY,
      bucket TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await dbQuery(`CREATE INDEX IF NOT EXISTS forum_rate_bucket_time ON forum_rate (bucket, created_at)`);
  await dbQuery(`ALTER TABLE forum_users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ`);
  for (const c of SEED_COMMUNITIES) {
    await dbQuery(
      `INSERT INTO forum_communities (slug, title, description, kind)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.title, c.description, c.kind]
    );
  }
  await dbQuery(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS seed_key TEXT`);
  await dbQuery(`ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS seed_key TEXT`);
  await dbQuery(
    `DELETE FROM forum_posts a USING forum_posts b
     WHERE a.seed_key IS NOT NULL AND a.seed_key = b.seed_key AND a.id > b.id`
  );
  await dbQuery(
    `DELETE FROM forum_comments a USING forum_comments b
     WHERE a.seed_key IS NOT NULL AND a.seed_key = b.seed_key AND a.id > b.id`
  );
  await dbQuery(
    `CREATE UNIQUE INDEX IF NOT EXISTS forum_posts_seed_key_uidx ON forum_posts (seed_key) WHERE seed_key IS NOT NULL`
  );
  await dbQuery(
    `CREATE UNIQUE INDEX IF NOT EXISTS forum_comments_seed_key_uidx ON forum_comments (seed_key) WHERE seed_key IS NOT NULL`
  );
  const { rows: seedUsers } = await dbQuery(
    `SELECT email FROM forum_users WHERE email LIKE 'seed-%@uchral.internal'`
  );
  const haveUser = new Set(seedUsers.map((r: { email: string }) => r.email));
  for (const person of SEED_PEOPLE) {
    const email = seedEmail(person.key);
    if (haveUser.has(email)) continue;
    await dbQuery(
      `INSERT INTO forum_users (email, password_hash, display_name, birthdate)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [email, hashPassword(randomBytes(18).toString("hex")), person.name, "1993-04-12"]
    );
  }
  for (const post of SEED_POSTS) {
    const { rows: existing } = await dbQuery(`SELECT id FROM forum_posts WHERE seed_key = $1`, [post.key]);
    if (existing[0]) continue;
    const { rows } = await dbQuery(
      `INSERT INTO forum_posts (community_id, author_id, title, body, seed_key, created_at)
       SELECT c.id, u.id, $1, $2, $3, NOW() - ($4::int * INTERVAL '1 hour')
       FROM forum_communities c
       JOIN forum_users u ON u.email = $5
       WHERE c.slug = $6
       ON CONFLICT (seed_key) WHERE seed_key IS NOT NULL DO NOTHING
       RETURNING id`,
      [post.title, post.body, post.key, post.hoursAgo, seedEmail(post.author), post.slug]
    );
    const postId = rows[0]?.id;
    if (!postId) continue;
    for (const voter of post.up) {
      await dbQuery(
        `INSERT INTO forum_votes (user_id, post_id, value)
         SELECT u.id, $1, 1 FROM forum_users u WHERE u.email = $2
         ON CONFLICT DO NOTHING`,
        [postId, seedEmail(voter)]
      );
    }
    for (let i = 0; i < post.comments.length; i += 1) {
      const comment = post.comments[i];
      await dbQuery(
        `INSERT INTO forum_comments (post_id, author_id, body, seed_key, created_at)
         SELECT $1, u.id, $2, $3, NOW() - ($4::int * INTERVAL '1 hour')
         FROM forum_users u WHERE u.email = $5`,
        [postId, comment.body, `${post.key}-c${i}`, comment.hoursAgo, seedEmail(comment.author)]
      );
    }
  }
  schemaReady = true;
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getModToken(): string {
  let s = String(process.env.WAITLIST_EXPORT_TOKEN ?? "").trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}

function isModerator(req: VercelRequest): boolean {
  const want = getModToken();
  const got = headerToken(req);
  return want.length > 0 && got === want;
}

async function sendResetEmail(to: string, link: string) {
  const text = `Reset your Uchral password:\n\n${link}\n\nThis link expires in one hour. If you did not ask for this, ignore the email.`;
  const key = String(process.env.RESEND_API_KEY ?? "").trim();
  if (!key) {
    if (process.env.VERCEL === "1") throw new Error("RESEND_API_KEY is not set");
    console.log("[password reset]", to, link);
    return;
  }
  const from = String(process.env.RESET_FROM_EMAIL ?? "Uchral <contact@uchral.net>").trim();
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: "Reset your Uchral password", text }),
  });
  if (!r.ok) {
    console.error("resend failed", r.status, await r.text());
    throw new Error("email send failed");
  }
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

function clientIp(req: VercelRequest): string {
  const xf = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  const real = String(req.headers["x-real-ip"] ?? "").trim();
  return (xf || real || "unknown").slice(0, 80);
}

async function allowRate(bucket: string, max: number, hours: number): Promise<boolean> {
  await dbQuery(`DELETE FROM forum_rate WHERE created_at < NOW() - INTERVAL '48 hours'`);
  const { rows } = await dbQuery(
    `SELECT COUNT(*)::int AS n FROM forum_rate
     WHERE bucket = $1 AND created_at > NOW() - ($2::int * INTERVAL '1 hour')`,
    [bucket, hours]
  );
  if ((rows[0]?.n ?? 0) >= max) return false;
  await dbQuery(`INSERT INTO forum_rate (bucket) VALUES ($1)`, [bucket]);
  return true;
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
    `SELECT u.id, u.email, u.display_name, u.banned_at
     FROM forum_sessions s JOIN forum_users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.created_at > NOW() - INTERVAL '30 days'`,
    [token]
  );
  const user = rows[0];
  if (!user) return null;
  if (user.banned_at) {
    await dbQuery(`DELETE FROM forum_sessions WHERE token = $1`, [token]);
    return null;
  }
  return user;
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
  JOIN forum_users u ON u.id = p.author_id AND u.banned_at IS NULL
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
      if (action === "mine") {
        const user = await userFromToken(req);
        if (!user) return res.status(401).json({ error: "Sign in to continue." });
        const { rows: communities } = await dbQuery(
          `SELECT c.slug, c.title, c.description, c.kind,
                  (SELECT COUNT(*) FROM forum_posts p WHERE p.community_id = c.id)::int AS post_count
           FROM forum_communities c
           WHERE c.created_by = $1
           ORDER BY c.created_at DESC`,
          [user.id]
        );
        const { rows: posts } = await dbQuery(
          `${POST_LIST_SQL} WHERE p.author_id = $1 ORDER BY p.created_at DESC LIMIT 80`,
          [user.id]
        );
        return res.status(200).json({
          communities: communities.map((r: any) => ({
            slug: r.slug,
            title: r.title,
            description: r.description,
            kind: r.kind,
            postCount: Number(r.post_count) || 0,
          })),
          posts: posts.map(mapPost),
        });
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
           WHERE cm.post_id = $1 AND u.banned_at IS NULL ORDER BY cm.created_at ASC`,
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
           WHERE u.banned_at IS NULL
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
      if (action === "reports") {
        if (!isModerator(req)) return res.status(401).json({ error: "Unauthorized." });
        const { rows } = await dbQuery(
          `SELECT r.id, r.reason, r.created_at, r.post_id,
                  ru.display_name AS reporter_name, ru.email AS reporter_email,
                  tu.id AS target_id, tu.display_name AS target_name, tu.email AS target_email, tu.banned_at,
                  p.title AS post_title
           FROM forum_reports r
           LEFT JOIN forum_users ru ON ru.id = r.reporter_id
           LEFT JOIN forum_users tu ON tu.id = r.target_user_id
           LEFT JOIN forum_posts p ON p.id = r.post_id
           ORDER BY r.created_at DESC
           LIMIT 100`
        );
        return res.status(200).json({
          reports: rows.map((r: any) => ({
            id: String(r.id),
            reason: r.reason,
            createdAt: r.created_at,
            postId: r.post_id ? String(r.post_id) : null,
            postTitle: r.post_title || "",
            reporterName: r.reporter_name || "",
            reporterEmail: r.reporter_email || "",
            targetId: r.target_id ? String(r.target_id) : null,
            targetName: r.target_name || "",
            targetEmail: r.target_email || "",
            banned: !!r.banned_at,
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
      if (!(await allowRate(`reg:${clientIp(req)}`, 8, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
      const { rows: existing } = await dbQuery(`SELECT banned_at FROM forum_users WHERE email = $1`, [email]);
      if (existing[0]?.banned_at) return res.status(403).json({ error: "This account is closed." });
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
        `SELECT id, email, display_name, password_hash, banned_at FROM forum_users WHERE email = $1`,
        [email]
      );
      const user = rows[0];
      if (!(await allowRate(`login:${clientIp(req)}`, 20, 1)) || !(await allowRate(`login-email:${email}`, 10, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: "Email or password is incorrect." });
      }
      if (user.banned_at) return res.status(403).json({ error: "This account is closed." });
      await dbQuery(`DELETE FROM forum_sessions WHERE user_id = $1 AND created_at < NOW() - INTERVAL '30 days'`, [user.id]);
      const token = randomBytes(32).toString("hex");
      await dbQuery(`INSERT INTO forum_sessions (token, user_id) VALUES ($1, $2)`, [token, user.id]);
      return res.status(200).json({ token, user: publicUser(user) });
    }

    if (postAction === "logout") {
      const token = headerToken(req);
      if (token) await dbQuery(`DELETE FROM forum_sessions WHERE token = $1`, [token]);
      return res.status(200).json({ ok: true });
    }

    if (postAction === "requestPasswordReset") {
      const email = str(body.email, 120).toLowerCase();
      const generic = { ok: true };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(200).json(generic);
      const { rows } = await dbQuery(`SELECT id, banned_at FROM forum_users WHERE email = $1`, [email]);
      const user = rows[0];
      if (!user || user.banned_at) return res.status(200).json(generic);
      const { rows: recent } = await dbQuery(
        `SELECT COUNT(*)::int AS n FROM forum_password_resets
         WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
        [user.id]
      );
      if ((recent[0]?.n ?? 0) >= 3) return res.status(200).json(generic);
      const token = randomBytes(32).toString("hex");
      await dbQuery(
        `INSERT INTO forum_password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
        [user.id, hashResetToken(token)]
      );
      const origin = (process.env.APP_ORIGIN || "https://uchral.net").replace(/\/$/, "");
      try {
        await sendResetEmail(email, `${origin}/reset?token=${token}`);
      } catch (err) {
        console.error("reset email failed", err);
        return res.status(500).json({ error: "Could not send reset email." });
      }
      return res.status(200).json(generic);
    }

    if (postAction === "resetPassword") {
      const token = str(body.token, 80);
      const password = String(body.password ?? "");
      if (token.length < 32) return res.status(400).json({ error: "This reset link is invalid or expired." });
      if (password.length < 10) return res.status(400).json({ error: "Password must be at least 10 characters." });
      const { rows } = await dbQuery(
        `SELECT id, user_id FROM forum_password_resets
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [hashResetToken(token)]
      );
      const row = rows[0];
      if (!row) return res.status(400).json({ error: "This reset link is invalid or expired." });
      await dbQuery(`UPDATE forum_users SET password_hash = $1 WHERE id = $2`, [hashPassword(password), row.user_id]);
      await dbQuery(`UPDATE forum_password_resets SET used_at = NOW() WHERE id = $1`, [row.id]);
      await dbQuery(`DELETE FROM forum_sessions WHERE user_id = $1`, [row.user_id]);
      await dbQuery(`DELETE FROM forum_password_resets WHERE user_id = $1 AND id <> $2`, [row.user_id, row.id]);
      return res.status(200).json({ ok: true });
    }

    if (postAction === "report") {
      if (!(await allowRate(`report:${clientIp(req)}`, 8, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
      const reason = str(body.reason, 800);
      const postId = str(body.postId, 20);
      if (reason.length < 8) return res.status(400).json({ error: "Please describe what happened." });
      const reporter = await userFromToken(req);
      let targetId: string | null = null;
      if (postId) {
        const { rows: post } = await dbQuery(`SELECT author_id FROM forum_posts WHERE id = $1`, [postId]);
        if (!post[0]) return res.status(404).json({ error: "Post not found." });
        targetId = String(post[0].author_id);
      }
      await dbQuery(
        `INSERT INTO forum_reports (reporter_id, post_id, target_user_id, reason)
         VALUES ($1, $2, $3, $4)`,
        [reporter?.id ?? null, postId || null, targetId, reason]
      );
      const key = String(process.env.RESEND_API_KEY ?? "").trim();
      if (key) {
        const from = String(process.env.RESET_FROM_EMAIL ?? "Uchral <contact@uchral.net>").trim();
        void fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: "contact@uchral.net",
            subject: "Uchral report",
            text: `Reason: ${reason}\nPost: ${postId || "(none)"}\nTarget user: ${targetId || "(none)"}`,
          }),
        }).catch((err) => console.error("report email failed", err));
      }
      return res.status(200).json({ ok: true });
    }

    if (postAction === "banUser") {
      if (!isModerator(req)) return res.status(401).json({ error: "Unauthorized." });
      const userId = str(body.userId, 20);
      if (!userId) return res.status(400).json({ error: "Missing user." });
      await dbQuery(`UPDATE forum_users SET banned_at = NOW() WHERE id = $1 AND banned_at IS NULL`, [userId]);
      await dbQuery(`DELETE FROM forum_sessions WHERE user_id = $1`, [userId]);
      return res.status(200).json({ ok: true });
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (postAction === "createCommunity") {
      if (!(await allowRate(`community:${user.id}`, 3, 24))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
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
      if (!(await allowRate(`post:${user.id}`, 15, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
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
      if (!(await allowRate(`comment:${user.id}`, 40, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
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
      if (!(await allowRate(`dating:${user.id}`, 10, 1))) {
        return res.status(429).json({ error: "Too many tries. Wait a bit." });
      }
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
