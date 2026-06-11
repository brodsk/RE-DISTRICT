export type WatchCategory = "custom" | "restored" | "curated";
export type WatchCondition = "mint" | "excellent" | "good" | "fair";

export interface Watch {
  id: string;
  name: string;
  brand: string;
  year: number;
  price: number;
  category: WatchCategory;
  condition: WatchCondition;
  slug: string;
  tagline: string;
  description: string;
  story: string;
  restorationNotes?: string;
  customModifications?: string;
  specifications: {
    case: string;
    diameter: string;
    movement: string;
    crystal: string;
    waterResistance: string;
    bracelet: string;
    lug: string;
  };
  images: string[];
  featured: boolean;
  sold: boolean;
}

export const watches: Watch[] = [
  {
    id: "001",
    name: "G-Shock DW-5600 — Matte Black",
    brand: "Casio",
    year: 2019,
    price: 320,
    category: "custom",
    condition: "mint",
    slug: "casio-gshock-dw5600-matte",
    tagline: "Pure function. No apology.",
    description:
      "A DW-5600 stripped down and rebuilt in full matte black. Bezel replaced, case rattle-can cerakoted, new matte strap. Keeps everything that made it iconic, removes everything that didn't.",
    story:
      "The DW-5600 has been in continuous production since 1987. The same form factor, the same 200m water resistance, the same module. We took a 2019 unit and removed every glossy surface. What remains is the purest version of the idea.",
    customModifications:
      "Full matte cerakote on case. Aftermarket all-black resin bezel. Custom matte NATO strap. All functions tested and verified.",
    specifications: {
      case: "Resin, matte cerakote finish",
      diameter: "48.9 × 42.8mm",
      movement: "Module 3229, digital quartz",
      crystal: "Mineral glass",
      waterResistance: "200m",
      bracelet: "Custom matte NATO, 16mm",
      lug: "16mm",
    },
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "002",
    name: "SKX007 — Service + Bezel",
    brand: "Seiko",
    year: 2003,
    price: 680,
    category: "restored",
    condition: "excellent",
    slug: "seiko-skx007-restored",
    tagline: "Twenty years underwater.",
    description:
      "A 2003 Seiko SKX007 fully serviced with a new aftermarket ceramic bezel insert. The movement is running at +4 seconds per day. Dial original, unpolished case.",
    story:
      "The SKX007 was discontinued in 2019. This one was found at a flea market in Osaka, worn hard, movement tired. We serviced the 7S26 ourselves — cleaned, oiled, adjusted. The original tropical dial was too good to touch. We replaced only the bezel insert with a deep navy ceramic.",
    restorationNotes:
      "Full movement service on Cal. 7S26. Gaskets replaced. Crown and stem replaced. New ceramic bezel insert. Case NOT polished — original brushed surfaces preserved.",
    specifications: {
      case: "Stainless steel, brushed",
      diameter: "42mm",
      movement: "Cal. 7S26, automatic, 21 jewels",
      crystal: "Hardlex mineral",
      waterResistance: "200m",
      bracelet: "Original Seiko jubilee 93090",
      lug: "22mm",
    },
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90",
      "https://images.unsplash.com/photo-1548963219-af4085fcef7e?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "003",
    name: "Bambino V2 — Restored",
    brand: "Orient",
    year: 2015,
    price: 290,
    category: "restored",
    condition: "excellent",
    slug: "orient-bambino-v2-restored",
    tagline: "Dress watch. No pretension.",
    description:
      "An Orient Bambino Version 2 from 2015. White dial, domed crystal, hand-winding movement. Fully serviced. One of the most honest dress watches ever made.",
    story:
      "The Bambino came from a collection of a retired Tokyo schoolteacher who wore it to work for a decade. The movement was slow by 12 seconds per day. Now it's +2. The white lacquer dial is flawless. The domed Hardlex crystal has one micro-scratch only visible under direct light.",
    restorationNotes:
      "Cal. F6724 serviced. Strap replaced with black leather. Crystal retained. Caseback polished.",
    specifications: {
      case: "Stainless steel",
      diameter: "40.5mm",
      movement: "Cal. F6724, manual-wind, 17 jewels",
      crystal: "Domed Hardlex",
      waterResistance: "30m",
      bracelet: "Black leather strap, 20mm",
      lug: "20mm",
    },
    images: [
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=90",
      "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "004",
    name: "Promaster Diver NY0040",
    brand: "Citizen",
    year: 2011,
    price: 480,
    category: "curated",
    condition: "good",
    slug: "citizen-promaster-ny0040",
    tagline: "Eco-Drive never stops.",
    description:
      "A 2011 Citizen Promaster NY0040 Aqualand with depth meter. Solar-powered, 200m diver, original bracelet. The depth meter still reads accurately.",
    story:
      "Acquired from a professional diver who used it on the job for four years. Case has honest wear — scratches on lugs, original crystal. We checked the depth sensor (still accurate to ±1m), verified the Eco-Drive charge, and left everything else as it was. This is what a working tool watch looks like.",
    specifications: {
      case: "Stainless steel",
      diameter: "43mm",
      movement: "Cal. J280, Eco-Drive solar",
      crystal: "Hardlex",
      waterResistance: "200m with depth meter",
      bracelet: "Original stainless steel",
      lug: "22mm",
    },
    images: [
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=90",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "005",
    name: "G-Shock GA-2100 — Casioak Custom",
    brand: "Casio",
    year: 2022,
    price: 410,
    category: "custom",
    condition: "mint",
    slug: "casio-ga2100-casioak-custom",
    tagline: "The shape of now.",
    description:
      "A GA-2100 Casioak with custom aftermarket metal bezel kit and oyster-style bracelet. Analog-digital, 200m, carbon core guard. Modified to wear like an instrument.",
    story:
      "The GA-2100 came out in 2019 and immediately attracted attention for its form — octagonal bezel, flat profile, carbon composite case. We fitted it with an aftermarket stainless steel bezel kit and a custom link bracelet. The result is a watch that wears far more seriously than its price suggests.",
    customModifications:
      "Aftermarket stainless steel bezel kit installed. Custom link bracelet. All functions verified. Original strap retained.",
    specifications: {
      case: "Carbon Core Guard resin",
      diameter: "45.4mm",
      movement: "Module 5611, analog-digital quartz",
      crystal: "Mineral glass",
      waterResistance: "200m",
      bracelet: "Custom stainless link, 18mm",
      lug: "18mm",
    },
    images: [
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=90",
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=90",
    ],
    featured: false,
    sold: false,
  },
  {
    id: "006",
    name: "SARB033 — Mechanical",
    brand: "Seiko",
    year: 2008,
    price: 720,
    category: "curated",
    condition: "excellent",
    slug: "seiko-sarb033-curated",
    tagline: "Before they stopped making them.",
    description:
      "A Seiko SARB033 in stainless steel. Discontinued in 2019. Cal. 6R15, 50-hour power reserve, 23 jewels. One of the best movements Seiko ever put in an affordable case.",
    story:
      "The SARB033 was discontinued quietly, without announcement. This one came from a Tokyo collector who bought it new and wore it for eight years. Movement is running at +6 seconds per day — within spec, no service needed. Original bracelet with minimal stretch.",
    specifications: {
      case: "Stainless steel, Zaratsu polished",
      diameter: "38mm",
      movement: "Cal. 6R15, automatic, 23 jewels, 50hr reserve",
      crystal: "Sapphire",
      waterResistance: "100m",
      bracelet: "Original Seiko stainless, 20mm",
      lug: "20mm",
    },
    images: [
      "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=800&q=90",
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90",
    ],
    featured: false,
    sold: false,
  },
];

export const testimonials = [
  {
    id: 1,
    en: {
      text: "Bought the SKX007 restoration. Running perfectly. The decision not to polish the case was exactly right.",
      author: "Mikhail D.",
      location: "Moscow",
      watch: "Seiko SKX007",
    },
    ru: {
      text: "Купил реставрацию SKX007. Ходит идеально. Решение не полировать корпус — именно то, что нужно.",
      author: "Михаил Д.",
      location: "Москва",
      watch: "Seiko SKX007",
    },
  },
  {
    id: 2,
    en: {
      text: "The Casioak custom is the most-asked-about thing I wear. Nobody can place what it is.",
      author: "Denis K.",
      location: "Berlin",
      watch: "Casio GA-2100 Custom",
    },
    ru: {
      text: "Casio GA-2100 кастом — то, о чём меня спрашивают чаще всего. Никто не может понять, что это.",
      author: "Денис К.",
      location: "Берлин",
      watch: "Casio GA-2100 Custom",
    },
  },
  {
    id: 3,
    en: {
      text: "Found the SARB033 here two days after it sold out everywhere else. These people actually know what they're looking for.",
      author: "Pavel V.",
      location: "London",
      watch: "Seiko SARB033",
    },
    ru: {
      text: "Нашёл здесь SARB033 через два дня после того, как его не стало нигде. Эти ребята реально знают, что ищут.",
      author: "Павел В.",
      location: "Лондон",
      watch: "Seiko SARB033",
    },
  },
];

export const process = [
  {
    step: "01",
    en: { title: "Source", description: "Estate sales, private sellers, and trusted dealers in Japan, Russia, and Europe. Every piece handled before it's listed." },
    ru: { title: "Поиск", description: "Частные продавцы, аукционы, проверенные дилеры в Японии, России и Европе. Каждый экземпляр проходит через руки." },
  },
  {
    step: "02",
    en: { title: "Assess", description: "Movement accuracy tested. Condition documented with photos. Every flaw disclosed. Nothing hidden." },
    ru: { title: "Оценка", description: "Точность хода измерена. Состояние задокументировано с фото. Каждый недостаток раскрыт. Ничего скрытого." },
  },
  {
    step: "03",
    en: { title: "Restore or Build", description: "Service only what needs servicing. Modify only with purpose. No unnecessary intervention." },
    ru: { title: "Реставрация или сборка", description: "Сервис только тому, что требует. Модификации только с целью. Никаких лишних вмешательств." },
  },
  {
    step: "04",
    en: { title: "Document", description: "Full record of origin, condition, and any work done. The paper trail is part of the product." },
    ru: { title: "Документация", description: "Полная запись происхождения, состояния и выполненных работ. Документация — часть продукта." },
  },
];
