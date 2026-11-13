import type { CategoryId } from "@/lib/demo-data";
import type { Locale } from "@/lib/locales";

export type Dictionary = {
  meta: {
    title: string;
    description: string;
    sellTitle: string;
    sellDescription: string;
  };
  brand: {
    short: string;
    market: string;
    tagline: string;
  };
  nav: {
    home: string;
    categories: string;
    makers: string;
    products: string;
    materials: string;
    craft: string;
    why: string;
    sell: string;
    newsletter: string;
    openMenu: string;
    menu: string;
    language: string;
    skip: string;
  };
  sampleBanner: string;
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    primary: string;
    secondary: string;
    note: string;
  };
  categories: {
    title: string;
    lede: string;
    items: Record<CategoryId, { name: string; text: string }>;
  };
  makers: {
    title: string;
    lede: string;
    city: string;
    sample: string;
    empty: string;
  };
  products: {
    title: string;
    lede: string;
    sample: string;
    samplePrice: string;
    by: string;
    details: string;
    hide: string;
    empty: string;
  };
  materials: {
    title: string;
    lede: string;
    cashmereTitle: string;
    cashmere: string;
    woolTitle: string;
    wool: string;
    note: string;
  };
  craft: {
    title: string;
    lede: string;
    points: { title: string; text: string }[];
  };
  why: {
    title: string;
    lede: string;
    points: { title: string; text: string }[];
  };
  sell: {
    eyebrow: string;
    title: string;
    lede: string;
    points: string[];
    cta: string;
    pageLede: string;
    refusal: string;
    name: string;
    email: string;
    city: string;
    craft: string;
    nameEmpty: string;
    emailEmpty: string;
    emailInvalid: string;
    cityEmpty: string;
    craftEmpty: string;
    invalid: string;
    sending: string;
    submit: string;
    unavailable: string;
    network: string;
  };
  newsletter: {
    title: string;
    lede: string;
    label: string;
    placeholder: string;
    emailEmpty: string;
    emailInvalid: string;
    invalid: string;
    sending: string;
    submit: string;
    unavailable: string;
    network: string;
  };
  footer: {
    explore: string;
    place: string;
    note: string;
  };
  notFound: {
    title: string;
    text: string;
    home: string;
  };
  error: {
    title: string;
    text: string;
    retry: string;
    home: string;
  };
};

const mn: Dictionary = {
  meta: {
    title: "Mongolian Makers",
    description:
      "Монголын урлаач, жижиг цехийн зах зээлийн урьдчилсан хуудас. Урлаач, бараа, үнэ бүгд жишээ.",
    sellTitle: "Худалдагч болох",
    sellDescription:
      "Худалдагчийн бүртгэл хараахан нээгдээгүй. Маягт илгээсэн зүйлийг хадгалахгүй.",
  },
  brand: {
    short: "Mongolian Makers",
    market: "Market",
    tagline: "Нээ. Дэмж. Монголоос ав.",
  },
  nav: {
    home: "Нүүр",
    categories: "Ангилал",
    makers: "Урлаачид",
    products: "Бүтээгдэхүүн",
    materials: "Ноолуур ба ноос",
    craft: "Урлал",
    why: "Яагаад эндээс",
    sell: "Худалдагч",
    newsletter: "Мэдээ",
    openMenu: "Цэс нээх",
    menu: "Цэс",
    language: "Хэл",
    skip: "Агуулга руу алгасах",
  },
  sampleBanner:
    "Энэ бол урьдчилсан хуудас. Урлаач, бараа, үнэ бүгд жишээ. Жинхэнэ дэлгүүр, борлуулалт, сэтгэгдэл байхгүй.",
  hero: {
    eyebrow: "Улаанбаатар · Бодит бараа · Урьдчилсан хуудас",
    title: "Монголын бүтээлч чанарыг нээ.",
    lede: "Бие даасан монгол урлаач, жижиг цехийн зах зээл. Энэ хуудас жишээ урлаач, жишээ бараа ашиглана. Энд зарагдах зүйл алга.",
    primary: "Ангилал үзэх",
    secondary: "Худалдагч болох",
    note: "Үнэ нь төгрөгөөр бичсэн жишээ үнэ. Санал биш.",
  },
  categories: {
    title: "Онцлох ангилал",
    lede: "Зөвхөн бодит бараа. Зах зээл Улаанбаатараас эхэлнэ.",
    items: {
      cashmere: {
        name: "Ноолуур",
        text: "Зөөлөн дотуур ноос, нарийн ээрмэл.",
      },
      wool: {
        name: "Ноос",
        text: "Даавуу, хөнжил, эсгийн эх ноос.",
      },
      felt: {
        name: "Эсгий",
        text: "Халуун, усаар нягтруулсан ноос.",
      },
      leather: {
        name: "Арьс",
        text: "Гараар эсгэж оёсон жижиг эдлэл.",
      },
      ceramics: {
        name: "Шавар",
        text: "Зуухнаас гарсан аяга, сав.",
      },
      jewelry: {
        name: "Мөнгө",
        text: "Жишээ болгон харуулсан дарсан мөнгө.",
      },
      wood: {
        name: "Мод",
        text: "Гэрт зориулсан сийлбэр, эргүүлсэн мод.",
      },
      home: {
        name: "Гэрийн нэхээс",
        text: "Гэр, байрны бүрээс, даавуу.",
      },
    },
  },
  makers: {
    title: "Онцлох урлаачид",
    lede: "Энэ хуудсын жишээ студи. Жинхэнэ аж ахуй биш.",
    city: "Улаанбаатар",
    sample: "Жишээ",
    empty: "Харуулах жишээ урлаач алга.",
  },
  products: {
    title: "Эрэлттэй бүтээгдэхүүн",
    lede: "Жишээ цуглуулга. Бодит захиалгаар эрэмбэлээгүй, сэтгэгдэл байхгүй.",
    sample: "Жишээ",
    samplePrice: "Жишээ үнэ",
    by: "Урлаач",
    details: "Дэлгэрэнгүй",
    hide: "Хураах",
    empty: "Харуулах жишээ бараа алга.",
  },
  materials: {
    title: "Ноолуур ба ноос",
    lede: "Монгол малын ширхэг. Эндхүү дээж нь зураг, худалдааны цуглуулга биш.",
    cashmereTitle: "Ноолуур",
    cashmere:
      "Хавар ямаанаас самнаж, дараа нь ээрдэг. Энэ хуудсын дээж нь хээ бөгөөд хэн нэгний нөөцийн гэрэл зураг биш.",
    woolTitle: "Ноос",
    wool: "Хонины ноос даавуу, хөнжил болж, эсгий болмогц хивс, шаахай болдог. Энэ ч мөн жишээ, зар биш.",
    note: "Зах зээл энэ ноосыг агуулахгүй. Хожим худалдагч өөрийн нөөцийг хариуцна.",
  },
  craft: {
    title: "Уламжлалт урлал",
    lede: "Гэрт, биед хэрэглэдэг эдлэлийн танил хэлбэр. Эндхийн картууд түүхийг орлохгүй.",
    points: [
      {
        title: "Эсгий",
        text: "Ноос, ус, даралт. Гэрт зориулсан урлал: шаахайнаас шалны бүрээс хүртэл.",
      },
      {
        title: "Металл",
        text: "Жижиг вандан дээрх мөнгө: бөгж, ээмэг, тамга. Энд зөвхөн жишээ.",
      },
      {
        title: "Мод ба арьс",
        text: "Өдөр тутмын сийлсэн мод, оёсон арьс. Энэ хуудсын нэг ч урлаач жинхэнэ дэлгүүр биш.",
      },
    ],
  },
  why: {
    title: "Яагаад эндээс авах вэ",
    lede: "Энэ урьдчилсан хуудсаар худалдан авалт нээгдээгүй. Зах зээлийг энэ зарчмаар бүтээж байна.",
    points: [
      {
        title: "Худалдагч бүтээлээ өөрөө хариуцна",
        text: "Худалдагч зар, нөөц, хүргэлт, худалдан авагчтайгаа харилцах харилцааг өөрөө эзэмшинэ. Зах зээл агуулах ажиллуулахгүй.",
      },
      {
        title: "Эхлээд Монгол",
        text: "Эхний зах зээл нь Монгол, Улаанбаатараас эхэлнэ. Зөвхөн бодит бараа. Төлбөр, хүргэлт, гааль, татвар тогтохоос өмнө өөр улс руу нээхгүй.",
      },
      {
        title: "Төлөвлөсөн энгийн шимтгэл",
        text: "Төлөвлөгөө нь үнэгүй бүртгэл, үнэгүй энгийн зар, админ өөрчилж болох 10% шимтгэл. Эхний хувилбарт төлбөртэй худалдагчийн хэрэгсэл байхгүй.",
      },
      {
        title: "Нийтлэхээс өмнө зөвшөөрөл",
        text: "Бараа нийтэд гарахаас өмнө худалдагчийг зөвшөөрнө. Тэр шалгалт энэ хуудсанд хараахан байхгүй.",
      },
    ],
  },
  sell: {
    eyebrow: "Худалдагч",
    title: "Худалдагч болох",
    lede: "Бүртгэл нээгдээгүй. Сонирхлоо илгээж болно. Энэ хуудас бүртгэл үүсгэхгүй, илгээсэн зүйлийг хадгалахгүй.",
    points: [
      "Үнэгүй бүртгэл, үнэгүй энгийн зарыг төлөвлөсөн.",
      "Шимтгэлийг 10% байхаар төлөвлөсөн бөгөөд админ өөрчилж болно.",
      "Бараа нийтэд гарахаас өмнө зөвшөөрөл хэрэгтэй.",
      "Хянах самбар, гэрээ, төлбөр энэ үе шатанд байхгүй.",
    ],
    cta: "Сонирхол илгээх",
    pageLede:
      "Урлал, хотоо бичнэ үү. Маягт талбарыг шалгаад, сервер хадгалахаас татгалзана.",
    refusal:
      "Хянах самбар, гэрээ, төлбөр байхгүй. Амжилттай бүртгэл гэж харуулахгүй.",
    name: "Нэр",
    email: "Имэйл",
    city: "Хот",
    craft: "Урлал",
    nameEmpty: "Нэрээ оруулна уу.",
    emailEmpty: "Имэйл хаягаа оруулна уу.",
    emailInvalid: "Имэйл хаяг буруу байна.",
    cityEmpty: "Хотоо оруулна уу.",
    craftEmpty: "Урлалаа оруулна уу.",
    invalid: "Талбарыг шалгаад дахин илгээнэ үү.",
    sending: "Илгээж байна…",
    submit: "Сонирхол илгээх",
    unavailable: "Бүртгэл нээгдээгүй. Юу ч хадгалаагүй.",
    network: "Хүсэлт амжилтгүй боллоо. Дахин оролдоно уу.",
  },
  newsletter: {
    title: "Мэдээ",
    lede: "Зах нээгдэхэд мэдээ авах бол имэйлээ үлдээнэ үү. Энэ хуудас хаяг хадгалахгүй.",
    label: "Имэйл",
    placeholder: "name@email.com",
    emailEmpty: "Имэйл хаягаа оруулна уу.",
    emailInvalid: "Имэйл хаяг буруу байна.",
    invalid: "Имэйл хаягийг шалгаад дахин илгээнэ үү.",
    sending: "Илгээж байна…",
    submit: "Илгээх",
    unavailable: "Бүртгэл холбогдоогүй. Юу ч хадгалаагүй.",
    network: "Хүсэлт амжилтгүй боллоо. Дахин оролдоно уу.",
  },
  footer: {
    explore: "Хэсгүүд",
    place: "Улаанбаатар, Монгол",
    note: "Жишээ хуудас. Төлбөр, худалдагчийн бүртгэл, шууд зар байхгүй.",
  },
  notFound: {
    title: "Хуудас алга",
    text: "Энэ хуудас урьдчилсан хувилбарт алга.",
    home: "Нүүр лүү буцах",
  },
  error: {
    title: "Хуудсыг харуулж чадсангүй",
    text: "Ачаалахад алдаа гарлаа. Дахин оролдож болно.",
    retry: "Дахин оролдох",
    home: "Нүүр лүү буцах",
  },
};

const en: Dictionary = {
  meta: {
    title: "Mongolian Makers",
    description:
      "A preview of a market for Mongolian artisans and small workshops. Makers, products, and prices are samples.",
    sellTitle: "Become a seller",
    sellDescription:
      "Seller registration is not open. The form does not keep what you send.",
  },
  brand: {
    short: "Mongolian Makers",
    market: "Market",
    tagline: "Discover. Support. Shop Mongolian.",
  },
  nav: {
    home: "Home",
    categories: "Categories",
    makers: "Makers",
    products: "Products",
    materials: "Cashmere and wool",
    craft: "Craft",
    why: "Why shop here",
    sell: "Sell",
    newsletter: "Newsletter",
    openMenu: "Open menu",
    menu: "Menu",
    language: "Language",
    skip: "Skip to content",
  },
  sampleBanner:
    "This is a preview. Makers, products, and prices are samples. There are no real shops, sales, or reviews.",
  hero: {
    eyebrow: "Ulaanbaatar · Physical goods · Preview",
    title: "Discover the creativity of Mongolia.",
    lede: "A market for independent Mongolian artisans and small workshops. This preview uses sample makers and sample goods. Nothing here is for sale.",
    primary: "Browse categories",
    secondary: "Become a seller",
    note: "Prices are sample prices in tögrög. They are not offers.",
  },
  categories: {
    title: "Featured categories",
    lede: "Physical goods only, for a market that starts in Ulaanbaatar.",
    items: {
      cashmere: {
        name: "Cashmere",
        text: "Soft undercoat, spun fine.",
      },
      wool: {
        name: "Wool",
        text: "Cloth, throws, and the fiber felt starts from.",
      },
      felt: {
        name: "Felt",
        text: "Wool pressed with heat and water.",
      },
      leather: {
        name: "Leather",
        text: "Small goods cut and stitched by hand.",
      },
      ceramics: {
        name: "Ceramics",
        text: "Bowls and vessels from a kiln.",
      },
      jewelry: {
        name: "Silver",
        text: "Stamped silver, shown here as samples.",
      },
      wood: {
        name: "Wood",
        text: "Turned and carved pieces for the home.",
      },
      home: {
        name: "Home textiles",
        text: "Covers and cloth for the ger and the apartment.",
      },
    },
  },
  makers: {
    title: "Featured makers",
    lede: "Sample studios for this preview. These are not real businesses.",
    city: "Ulaanbaatar",
    sample: "Sample",
    empty: "No sample makers to show.",
  },
  products: {
    title: "Popular products",
    lede: "A sample selection. These pieces are not ranked by real orders, and there are no reviews.",
    sample: "Sample",
    samplePrice: "Sample price",
    by: "Maker",
    details: "Details",
    hide: "Hide details",
    empty: "No sample products to show.",
  },
  materials: {
    title: "Cashmere and wool",
    lede: "Fiber from Mongolian herds. The swatches here are drawings, not a collection for sale.",
    cashmereTitle: "Cashmere",
    cashmere:
      "Combed from the goat in spring, then spun. The swatch on this page is a pattern, not a photograph of someone’s stock.",
    woolTitle: "Wool",
    wool: "Sheep wool becomes cloth, blankets, and, once felted, rugs and slippers. Still a sample, not a listing.",
    note: "The market does not hold this fiber. A later seller would keep their own stock.",
  },
  craft: {
    title: "Traditional craftsmanship",
    lede: "Familiar forms for the home and the body. The cards here do not stand in for a workshop’s history.",
    points: [
      {
        title: "Felt",
        text: "Wool, water, and pressure. A craft still made for the home, from slippers to floor covers.",
      },
      {
        title: "Metal",
        text: "Silver worked at a small bench: rings, earrings, and stamps. Shown here only as samples.",
      },
      {
        title: "Wood and leather",
        text: "Carved wood and stitched leather for daily use. No maker on this page is a real shop.",
      },
    ],
  },
  why: {
    title: "Why shop here",
    lede: "Shopping is not open in this preview. These are the terms the market is designed around.",
    points: [
      {
        title: "The seller keeps the goods",
        text: "Sellers are meant to own the listing, the stock, fulfillment, and the conversation with the customer. The market does not hold inventory.",
      },
      {
        title: "Mongolia first",
        text: "The first market is Mongolia, starting with Ulaanbaatar. Physical products only. Other countries stay closed until payments, shipping, customs, and tax are settled.",
      },
      {
        title: "Plain planned terms",
        text: "The plan is free registration, free basic listings, and a 10% commission an administrator can change. No paid seller tools in the first version.",
      },
      {
        title: "Public only after approval",
        text: "A seller would need approval before a product is public. That review does not exist in this preview.",
      },
    ],
  },
  sell: {
    eyebrow: "Sellers",
    title: "Become a seller",
    lede: "Registration is not open. You can send a note of interest. This preview does not create an account and does not keep what you send.",
    points: [
      "Free registration and free basic listings are the plan.",
      "The planned commission is 10%, and an admin can change it.",
      "A product would need approval before it is public.",
      "There is no dashboard, contract, or payment in this phase.",
    ],
    cta: "Send interest",
    pageLede:
      "Write the craft and the city. The form checks the fields, then the server declines to store them.",
    refusal:
      "There is no dashboard, no contract, and no payment. This page will not pretend an account was created.",
    name: "Name",
    email: "Email",
    city: "City",
    craft: "Craft",
    nameEmpty: "Enter a name.",
    emailEmpty: "Enter an email address.",
    emailInvalid: "That email address is not valid.",
    cityEmpty: "Enter a city.",
    craftEmpty: "Enter a craft.",
    invalid: "Check the fields and send again.",
    sending: "Sending…",
    submit: "Send interest",
    unavailable: "Registration is not open. Nothing was saved.",
    network: "The request failed. Try again.",
  },
  newsletter: {
    title: "Newsletter",
    lede: "Leave an email if you want news when the market opens. This preview does not store addresses.",
    label: "Email",
    placeholder: "name@email.com",
    emailEmpty: "Enter an email address.",
    emailInvalid: "That email address is not valid.",
    invalid: "Check the email address and send again.",
    sending: "Sending…",
    submit: "Send",
    unavailable: "Signup is not connected. Nothing was saved.",
    network: "The request failed. Try again.",
  },
  footer: {
    explore: "On this page",
    place: "Ulaanbaatar, Mongolia",
    note: "Sample preview. No checkout, no seller accounts, and no live listings.",
  },
  notFound: {
    title: "Page not found",
    text: "This page is not part of the preview.",
    home: "Back to the homepage",
  },
  error: {
    title: "This page could not be shown",
    text: "Something went wrong while loading. You can try again.",
    retry: "Try again",
    home: "Back to the homepage",
  },
};

const dictionaries: Record<Locale, Dictionary> = { mn, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
