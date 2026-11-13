export const categoryIds = [
  "cashmere",
  "wool",
  "felt",
  "leather",
  "ceramics",
  "jewelry",
  "wood",
  "home",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export type Copy = {
  mn: string;
  en: string;
};

export type Maker = {
  id: string;
  category: CategoryId;
  name: Copy;
  text: Copy;
};

export type Product = {
  id: string;
  category: CategoryId;
  makerId: string;
  priceMnt: number;
  name: Copy;
  summary: Copy;
  detail: Copy;
};

/** Invented sample records. Not real businesses, stock, or prices. */
export const makers: Maker[] = [
  {
    id: "sample-cashmere-studio",
    category: "cashmere",
    name: { mn: "Жишээ ноолуур студи", en: "Sample Cashmere Studio" },
    text: {
      mn: "Жишээ дэлгүүр. Ноолууран ороолт, энгэрийн алчуур. Бодит цех биш.",
      en: "Sample shop. Scarves and a neck cloth in cashmere. Not a real workshop.",
    },
  },
  {
    id: "sample-felt-workshop",
    category: "felt",
    name: { mn: "Жишээ эсгий цех", en: "Sample Felt Workshop" },
    text: {
      mn: "Жишээ дэлгүүр. Эсгий шаахай, суудал. Бодит цех биш.",
      en: "Sample shop. Felt slippers and a seat pad. Not a real workshop.",
    },
  },
  {
    id: "sample-silver-bench",
    category: "jewelry",
    name: { mn: "Жишээ мөнгөн вандан", en: "Sample Silver Bench" },
    text: {
      mn: "Жишээ дэлгүүр. Мөнгөн бөгж. Бодит дархан биш.",
      en: "Sample shop. A silver ring. Not a real bench.",
    },
  },
  {
    id: "sample-wool-weave",
    category: "wool",
    name: { mn: "Жишээ ноос нэхээс", en: "Sample Wool Weave" },
    text: {
      mn: "Жишээ дэлгүүр. Ноосон хөнжил. Бодит нэхээс биш.",
      en: "Sample shop. A wool throw. Not a real loom.",
    },
  },
  {
    id: "sample-clay-kiln",
    category: "ceramics",
    name: { mn: "Жишээ шавар зуух", en: "Sample Clay Kiln" },
    text: {
      mn: "Жишээ дэлгүүр. Шавар аяга. Бодит зуух биш.",
      en: "Sample shop. A clay bowl. Not a real kiln.",
    },
  },
  {
    id: "sample-leather-bench",
    category: "leather",
    name: { mn: "Жишээ арьс вандан", en: "Sample Leather Bench" },
    text: {
      mn: "Жишээ дэлгүүр. Арьсан дотор. Бодит цех биш.",
      en: "Sample shop. A leather pouch. Not a real workshop.",
    },
  },
];

export const featuredMakerIds = [
  "sample-cashmere-studio",
  "sample-felt-workshop",
  "sample-silver-bench",
  "sample-wool-weave",
] as const;

/** Sample prices in tögrög. Not offers and not taken from a catalog. */
export const products: Product[] = [
  {
    id: "sample-cashmere-scarf",
    category: "cashmere",
    makerId: "sample-cashmere-studio",
    priceMnt: 240000,
    name: { mn: "Жишээ ноолууран ороолт", en: "Sample cashmere scarf" },
    summary: {
      mn: "Жишээ бараа. Нэг өнгийн ороолт.",
      en: "Sample goods. A single-color scarf.",
    },
    detail: {
      mn: "Хэмжээ, нөөц, хүргэлт байхгүй. Энэ тайлбар зөвхөн урьдчилсан хуудсанд зориулагдсан.",
      en: "No size, stock, or delivery. This note exists only for the preview.",
    },
  },
  {
    id: "sample-wool-throw",
    category: "wool",
    makerId: "sample-wool-weave",
    priceMnt: 310000,
    name: { mn: "Жишээ ноосон хөнжил", en: "Sample wool throw" },
    summary: {
      mn: "Жишээ бараа. Өвдөгний хөнжил.",
      en: "Sample goods. A throw for a chair or a bed.",
    },
    detail: {
      mn: "Бодит захиалга, үнэлгээ байхгүй. Үнэ нь санал биш.",
      en: "There are no real orders and no reviews. The price is not an offer.",
    },
  },
  {
    id: "sample-felt-slippers",
    category: "felt",
    makerId: "sample-felt-workshop",
    priceMnt: 86000,
    name: { mn: "Жишээ эсгий шаахай", en: "Sample felt slippers" },
    summary: {
      mn: "Жишээ бараа. Гэрт өмсөх эсгий шаахай.",
      en: "Sample goods. Felt slippers for indoors.",
    },
    detail: {
      mn: "Хэмжээний сонголт байхгүй. Энэ бол жишээ карт.",
      en: "There is no size run. This card is a sample.",
    },
  },
  {
    id: "sample-silver-ring",
    category: "jewelry",
    makerId: "sample-silver-bench",
    priceMnt: 175000,
    name: { mn: "Жишээ мөнгөн бөгж", en: "Sample silver ring" },
    summary: {
      mn: "Жишээ бараа. Энгийн мөнгөн бөгж.",
      en: "Sample goods. A plain silver ring.",
    },
    detail: {
      mn: "Чулуу, хэмжээ, дархны нэр байхгүй. Жинхэнэ үнэт эдлэл биш.",
      en: "No stone, size, or smith. Not a real piece of jewelry.",
    },
  },
  {
    id: "sample-clay-bowl",
    category: "ceramics",
    makerId: "sample-clay-kiln",
    priceMnt: 64000,
    name: { mn: "Жишээ шавар аяга", en: "Sample clay bowl" },
    summary: {
      mn: "Жишээ бараа. Өдөр тутмын аяга.",
      en: "Sample goods. An everyday bowl.",
    },
    detail: {
      mn: "Шатаалт, палитр, нөөц байхгүй. Зураг нь хээ, гэрэл зураг биш.",
      en: "No firing, glaze, or stock. The picture is a pattern, not a photograph.",
    },
  },
  {
    id: "sample-leather-pouch",
    category: "leather",
    makerId: "sample-leather-bench",
    priceMnt: 92000,
    name: { mn: "Жишээ арьсан дотор", en: "Sample leather pouch" },
    summary: {
      mn: "Жишээ бараа. Жижиг оёмол дотор.",
      en: "Sample goods. A small stitched pouch.",
    },
    detail: {
      mn: "Арьсны гарал, үнэр, баталгаа байхгүй. Худалдаанд гараагүй.",
      en: "No hide, scent, or guarantee. It is not for sale.",
    },
  },
];

export function makerById(id: string) {
  return makers.find((maker) => maker.id === id);
}

export function featuredMakers() {
  return featuredMakerIds.flatMap((id) => {
    const maker = makerById(id);
    return maker ? [maker] : [];
  });
}
