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
    name: "Submariner Date",
    brand: "Rolex",
    year: 1984,
    price: 12800,
    category: "restored",
    condition: "excellent",
    slug: "rolex-submariner-1984",
    tagline: "Four decades of depth.",
    description:
      "A 1984 Rolex Submariner Date, fully serviced and restored to its original glory. The tropical dial tells the story of its lifetime — no two are alike.",
    story:
      "Found in a Geneva estate sale, this ref. 16800 had been worn daily for nearly two decades before being carefully stored. The movement was in remarkable condition — clean, accurate, and needing only a light service. The dial, however, had undergone something extraordinary: a slow oxidation process that turned its original matte black into a deep chocolate-brown. We call this character.",
    restorationNotes:
      "Full movement service by certified watchmaker. Crown and tube replaced. Crystal polished. Case and bracelet professionally cleaned — no polishing of case, preserving original brushed and polished surfaces. Tropical dial and original hands untouched.",
    specifications: {
      case: "Stainless steel, 40mm",
      diameter: "40mm",
      movement: "Cal. 3035, automatic, 26 jewels",
      crystal: "Acrylic, original",
      waterResistance: "300m / 30 bar",
      bracelet: "Oyster, 93150 with 580 end links",
      lug: "20mm",
    },
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=90",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90",
      "https://images.unsplash.com/photo-1548171915-e1f68e0e2e17?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "002",
    name: "Speedmaster Professional",
    brand: "Omega",
    year: 1971,
    price: 8400,
    category: "restored",
    condition: "excellent",
    slug: "omega-speedmaster-1971",
    tagline: "Moonphase, no moon required.",
    description:
      "The original manual-wind Moonwatch from 1971. Caliber 321, untouched lume, all-original dial. One of the last great ones.",
    story:
      "This Speedmaster Professional was purchased new by an Italian engineer at a Rome jeweler in 1971. It accompanied him through a career in aerospace. We acquired it directly from his son. The bracelet is stretched from years of wear — honest wear. The dial glows as it always did.",
    restorationNotes:
      "Complete Cal. 321 service. Pushers cleaned and tested. Crystal replaced with period-correct Hesalite. Original bracelet retained. Caseback polished. All functions verified.",
    specifications: {
      case: "Stainless steel",
      diameter: "42mm",
      movement: "Cal. 321, manual-wind, column wheel chronograph",
      crystal: "Hesalite acrylic",
      waterResistance: "30m splash proof",
      bracelet: "1171/571 flat link",
      lug: "19mm",
    },
    images: [
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=90",
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "003",
    name: "Datejust 36 — Shadow Edition",
    brand: "Custom / Rolex Base",
    year: 2002,
    price: 9200,
    category: "custom",
    condition: "mint",
    slug: "rolex-datejust-shadow-edition",
    tagline: "The Datejust reimagined in black.",
    description:
      "A 2002 Rolex Datejust 36 stripped of its color and rebuilt in complete shadow. PVD case, matte black sunburst dial, black ceramic bezel insert.",
    story:
      "We started with a solid ref. 16234 donor watch — Jubilee bracelet, white dial, fluted bezel. We had one vision: black. Everything black. The case and bracelet were sent for professional PVD coating in deep matte black. The original dial was replaced with a custom matte black sunburst. The fluted bezel replaced with a slim ceramic black insert. The result is a watch that wears like shadow on your wrist.",
    customModifications:
      "Professional PVD coating on case and bracelet. Custom matte black sunburst dial. Black ceramic bezel insert. Black hands with white lume. Original Cal. 3135 retained and serviced.",
    specifications: {
      case: "Stainless steel with matte black PVD coating",
      diameter: "36mm",
      movement: "Cal. 3135, automatic, 31 jewels",
      crystal: "Sapphire",
      waterResistance: "100m",
      bracelet: "Jubilee with PVD coating",
      lug: "20mm",
    },
    images: [
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=90",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=90",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "004",
    name: "Royal Oak 39mm",
    brand: "Audemars Piguet",
    year: 2015,
    price: 31500,
    category: "curated",
    condition: "excellent",
    slug: "ap-royal-oak-2015",
    tagline: "The original disruptor.",
    description:
      "A 2015 Royal Oak in stainless steel. Blue \"Petite Tapisserie\" dial. Box and papers. The watch that redefined luxury.",
    story:
      "Gerald Genta designed this watch in 48 hours in 1972. The brief was to create a steel sports watch that cost more than gold. He delivered an icon. This 2015 reference carries the same DNA — angular octagonal bezel, integrated bracelet, that unmistakable blue dial. Acquired from the original owner in Zürich with full documentation.",
    specifications: {
      case: "Stainless steel, octagonal bezel with 8 screws",
      diameter: "39mm",
      movement: "Cal. 3120, automatic",
      crystal: "Sapphire, anti-reflective coating",
      waterResistance: "50m",
      bracelet: "Integrated stainless steel",
      lug: "Integrated",
    },
    images: [
      "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=90",
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90",
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=90",
    ],
    featured: false,
    sold: false,
  },
  {
    id: "005",
    name: "Nautilus 5711 — Ghost",
    brand: "Custom / Patek Base",
    year: 2018,
    price: 74000,
    category: "custom",
    condition: "mint",
    slug: "patek-nautilus-ghost",
    tagline: "The Nautilus disappears into white.",
    description:
      "A 2018 Nautilus 5711 transformed into a full white ghost — white lacquer dial, white gold applied indices, white ceramic bezel treatment. Only one exists.",
    story:
      "The brief from the client was simple: disappear the blue. Take a 5711 and make it invisible, white, like a ghost. Six months of work with a master dial craftsman. The result was this — a watch that looks like it was pressed from a single block of white light.",
    customModifications:
      "Custom white lacquer dial by independent dial atelier. White gold indices re-applied. Case treated with matte white coating. Original movement untouched.",
    specifications: {
      case: "Stainless steel with white treatment",
      diameter: "40mm",
      movement: "Cal. 324 S C, automatic",
      crystal: "Sapphire",
      waterResistance: "120m",
      bracelet: "Nautilus integrated",
      lug: "Integrated",
    },
    images: [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c08a68?w=800&q=90",
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=90",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=90",
    ],
    featured: true,
    sold: false,
  },
  {
    id: "006",
    name: "Submariner No-Date",
    brand: "Rolex",
    year: 1993,
    price: 10200,
    category: "curated",
    condition: "good",
    slug: "rolex-submariner-nodate-1993",
    tagline: "The purist's choice.",
    description:
      "A 1993 Submariner No-Date ref. 14060. Matte black dial, pencil hands. The clean face of the deep.",
    story:
      "Some collectors insist on the no-date. No cyclops lens, no date wheel, just the essential geometry of the Submariner. This 1993 example is honest — it has lived on a wrist for decades and shows appropriate wear on the bracelet and case. Dial and movement are exceptional.",
    specifications: {
      case: "Stainless steel",
      diameter: "40mm",
      movement: "Cal. 3000, automatic",
      crystal: "Sapphire",
      waterResistance: "300m",
      bracelet: "Oyster 93250",
      lug: "20mm",
    },
    images: [
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=90",
      "https://images.unsplash.com/photo-1548963219-af4085fcef7e?w=800&q=90",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=90",
    ],
    featured: false,
    sold: false,
  },
];

export const testimonials = [
  {
    id: 1,
    text: "RE:DISTRICT found me a 1984 Sub I'd been hunting for three years. The restoration was impeccable — every detail considered.",
    author: "Alexander M.",
    location: "Moscow",
    watch: "Rolex Submariner 1984",
  },
  {
    id: 2,
    text: "The Shadow Edition Datejust is the most asked-about thing I own. Nobody can believe it's a Rolex. Pure obsession.",
    author: "Denis K.",
    location: "Berlin",
    watch: "Datejust Shadow Edition",
  },
  {
    id: 3,
    text: "I sent them my grandfather's broken Omega. They returned a piece of history, running perfectly, preserved exactly as it was.",
    author: "Pavel V.",
    location: "London",
    watch: "Omega Constellation Restoration",
  },
];

export const process = [
  {
    step: "01",
    title: "Source",
    description:
      "We hunt. Estate sales, private collections, trusted dealers across Europe and Japan. Every piece passes through our hands before it reaches you.",
  },
  {
    step: "02",
    title: "Assess",
    description:
      "Complete inspection under magnification. Movement, dial, case, crystal, crown — every component evaluated and documented.",
  },
  {
    step: "03",
    title: "Restore or Build",
    description:
      "Restoration respects originality. Custom work starts from vision. Both demand the same level of craft.",
  },
  {
    step: "04",
    title: "Certify",
    description:
      "Every watch leaves with full documentation of its condition, history, and any work performed. Honesty is the foundation.",
  },
];
