import type { Product } from "./types";
import { buildSizeStock, resolveProductStock } from "./stock";

type ProductSeed = {
  brand: string;
  name: string;
  images: string[];
  imageAlt: string;
  basePrice: number;
  sizes?: string[];
};

const IMAGES_PER_PRODUCT = 5;

function hasVariantOptions(values?: string[]): boolean {
  return values !== undefined && values.length > 0;
}

type CategoryConfig = {
  idPrefix: string;
  seeds: ProductSeed[];
  nameSuffixes: string[];
};

const SNEAKER_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];
const SANDAL_SIZES = ["37", "38", "39", "40", "41", "42", "43"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PERFUME_SIZES = ["30ml", "50ml", "100ml"];

/** Extra angles merged into each product gallery when a seed lists only one image. */
const CATEGORY_GALLERY_EXTRAS: Record<string, string[]> = {
  sneaker: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
    "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=500&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
    "https://images.unsplash.com/photo-1607522370275-f14206abecca?w=500&q=80",
  ],
  sun: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5311?w=500&q=80",
    "https://images.unsplash.com/photo-1589782869502-86111beab0a5?w=500&q=80",
    "https://images.unsplash.com/photo-1508296697849-686698f76c09?w=500&q=80",
  ],
  sandal: [
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80",
    "https://images.unsplash.com/photo-1628151016834-455b850d26cd?w=500&q=80",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd1?w=500&q=80",
    "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=500&q=80",
    "https://images.unsplash.com/photo-1603485669160-0b8df0125f12?w=500&q=80",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
  ],
  bag: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89e762c631?w=500&q=80",
    "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=500&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
  ],
  perfume: [
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80",
    "https://images.unsplash.com/photo-1594035910387-36e1aed659c5?w=500&q=80",
    "https://images.unsplash.com/photo-1595425970377-c970029bf950?w=500&q=80",
    "https://images.unsplash.com/photo-1587017539504-67cfbddcf2b4?w=500&q=80",
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80",
  ],
  watch: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    "https://images.unsplash.com/photo-1547996160-81dfa6352040?w=500&q=80",
    "https://images.unsplash.com/photo-1587836374828-4dbafa8a0d7a?w=500&q=80",
    "https://images.unsplash.com/photo-1614164185128-e943d6928d74?w=500&q=80",
  ],
};

const PRODUCTS_PER_CATEGORY = 50;

function buildGallery(
  seedImages: string[],
  idPrefix: string,
  seedIndex: number,
): string[] {
  const extras = CATEGORY_GALLERY_EXTRAS[idPrefix] ?? [];
  const gallery = [...seedImages];

  let pass = 0;
  while (gallery.length < IMAGES_PER_PRODUCT && pass < extras.length * 2) {
    const url = extras[(seedIndex + pass) % extras.length];
    pass += 1;
    if (!gallery.includes(url)) {
      gallery.push(url);
    }
  }

  return gallery.slice(0, IMAGES_PER_PRODUCT);
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function buildProducts(config: CategoryConfig): Product[] {
  return Array.from({ length: PRODUCTS_PER_CATEGORY }, (_, index) => {
    const number = index + 1;
    const seed = config.seeds[index % config.seeds.length];
    const suffix = config.nameSuffixes[index % config.nameSuffixes.length];
    const priceOffset = (index % 11) * 85_000;
    const price = seed.basePrice + priceOffset;
    const hasSale = number % 3 === 0;
    const oldPrice = hasSale ? price + 350_000 + (index % 5) * 120_000 : undefined;
    const fullName =
      suffix.length > 0 ? `${seed.name} ${suffix}` : seed.name;
    const sizes = hasVariantOptions(seed.sizes) ? seed.sizes : undefined;
    const sizeStock =
      sizes !== undefined ? buildSizeStock(sizes, index) : undefined;
    const stock =
      sizeStock !== undefined
        ? Object.values(sizeStock).reduce((sum, qty) => sum + qty, 0)
        : resolveProductStock(index);
    const fulfillmentType = number % 5 === 0 ? "pre_order" : "in_stock";

    return {
      id: `${config.idPrefix}-${number}`,
      images: buildGallery(
        seed.images,
        config.idPrefix,
        index % config.seeds.length,
      ),
      imageAlt: `${seed.imageAlt} ${suffix}`.trim(),
      brand: seed.brand,
      name: fullName,
      price: formatVnd(price),
      stock,
      fulfillmentType,
      ...(sizes !== undefined ? { sizes, sizeStock } : {}),
      ...(oldPrice !== undefined ? { oldPrice: formatVnd(oldPrice) } : {}),
    };
  });
}

const SNEAKER_SEEDS: ProductSeed[] = [
  {
    brand: "/Nike/",
    name: "Giày Nike Air Force 1 '07",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    ],
    imageAlt: "Giày Nike Air Force 1",
    basePrice: 2_550_000,
    sizes: SNEAKER_SIZES,
  },
  {
    brand: "/New Balance/",
    name: "New Balance 530 Running",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&q=80",
    ],
    imageAlt: "New Balance 530",
    basePrice: 2_650_000,
    sizes: SNEAKER_SIZES,
  },
  {
    brand: "/Asics/",
    name: "Asics Gel-Challenger 15",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
    ],
    imageAlt: "Asics Gel-Challenger",
    basePrice: 2_850_000,
    sizes: ["39", "40", "41", "42", "43", "44"],
  },
  {
    brand: "/Adidas/",
    name: "Adidas Adizero Ubersonic 4",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
    ],
    imageAlt: "Adidas Adizero",
    basePrice: 2_350_000,
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    brand: "/Jordan/",
    name: "Air Jordan 1 Retro High",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80",
    ],
    imageAlt: "Air Jordan 1",
    basePrice: 4_200_000,
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
  {
    brand: "/Puma/",
    name: "Puma Suede Classic XXI",
    images: [
      "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=500&q=80",
    ],
    imageAlt: "Puma Suede",
    basePrice: 1_890_000,
    sizes: SNEAKER_SIZES,
  },
  {
    brand: "/Converse/",
    name: "Converse Chuck 70 High",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abecca?w=500&q=80",
    ],
    imageAlt: "Converse Chuck 70",
    basePrice: 1_650_000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
  },
  {
    brand: "/Vans/",
    name: "Vans Old Skool Pro",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b3944a?w=500&q=80",
    ],
    imageAlt: "Vans Old Skool",
    basePrice: 1_750_000,
    sizes: SNEAKER_SIZES,
  },
  {
    brand: "/Reebok/",
    name: "Reebok Club C 85 Vintage",
    images: [
      "https://images.unsplash.com/photo-1605348532760-675e11be0411?w=500&q=80",
    ],
    imageAlt: "Reebok Club C",
    basePrice: 1_980_000,
    sizes: SNEAKER_SIZES,
  },
  {
    brand: "/Salomon/",
    name: "Salomon XT-6 Gore-Tex",
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&q=80",
    ],
    imageAlt: "Salomon XT-6",
    basePrice: 3_450_000,
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
];

const SUNGLASSES_SEEDS: ProductSeed[] = [
  {
    brand: "/Ray-Ban/",
    name: "Ray-Ban Aviator Classic",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    ],
    imageAlt: "Ray-Ban Aviator",
    basePrice: 3_500_000,
  },
  {
    brand: "/Gentle Monster/",
    name: "Gentle Monster Lilit 01",
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80",
    ],
    imageAlt: "Gentle Monster Lilit",
    basePrice: 6_300_000,
  },
  {
    brand: "/Oakley/",
    name: "Oakley Holbrook",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    ],
    imageAlt: "Oakley Holbrook",
    basePrice: 2_950_000,
  },
  {
    brand: "/Gucci/",
    name: "Gucci Square-frame Sunglasses",
    images: [
      "https://images.unsplash.com/photo-1589782869502-86111beab0a5?w=500&q=80",
    ],
    imageAlt: "Gucci Sunglasses",
    basePrice: 8_500_000,
  },
  {
    brand: "/Prada/",
    name: "Prada Symbole Sunglasses",
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5311?w=500&q=80",
    ],
    imageAlt: "Prada Symbole",
    basePrice: 9_200_000,
  },
  {
    brand: "/Versace/",
    name: "Versace Medusa Biggie",
    images: [
      "https://images.unsplash.com/photo-1508296697849-686698f76c09?w=500&q=80",
    ],
    imageAlt: "Versace Medusa",
    basePrice: 7_800_000,
  },
  {
    brand: "/Carrera/",
    name: "Carrera Champion65",
    images: [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500&q=80",
    ],
    imageAlt: "Carrera Champion",
    basePrice: 2_100_000,
  },
  {
    brand: "/Persol/",
    name: "Persol PO0649",
    images: [
      "https://images.unsplash.com/photo-1509690293794-d21c23ff9d6b?w=500&q=80",
    ],
    imageAlt: "Persol PO0649",
    basePrice: 4_600_000,
  },
  {
    brand: "/Dior/",
    name: "DiorSignature S7U",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
    ],
    imageAlt: "Dior Signature",
    basePrice: 10_500_000,
  },
  {
    brand: "/Tom Ford/",
    name: "Tom Ford Whitney",
    images: [
      "https://images.unsplash.com/photo-1556306534-38fe83f27f29?w=500&q=80",
    ],
    imageAlt: "Tom Ford Whitney",
    basePrice: 8_900_000,
  },
];

const SANDALS_SEEDS: ProductSeed[] = [
  {
    brand: "/Adidas/",
    name: "Yeezy Slide Pure",
    images: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80",
    ],
    imageAlt: "Yeezy Slide",
    basePrice: 2_850_000,
    sizes: SANDAL_SIZES,
  },
  {
    brand: "/Nike/",
    name: "Nike Victori One",
    images: [
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=500&q=80",
    ],
    imageAlt: "Nike Victori One",
    basePrice: 850_000,
    sizes: SANDAL_SIZES,
  },
  {
    brand: "/MLB/",
    name: "MLB Mound New York Yankees",
    images: [
      "https://images.unsplash.com/photo-1596541014163-9bfd8c97dd36?w=500&q=80",
    ],
    imageAlt: "MLB Mound",
    basePrice: 1_250_000,
    sizes: ["38", "39", "40", "41", "42"],
  },
  {
    brand: "/Crocs/",
    name: "Crocs Classic Clog",
    images: [
      "https://images.unsplash.com/photo-1628151016834-455b850d26cd?w=500&q=80",
    ],
    imageAlt: "Crocs Classic",
    basePrice: 1_390_000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
  },
  {
    brand: "/Birkenstock/",
    name: "Birkenstock Arizona",
    images: [
      "https://images.unsplash.com/photo-1603485669160-0b8df0125f12?w=500&q=80",
    ],
    imageAlt: "Birkenstock Arizona",
    basePrice: 2_150_000,
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44"],
  },
  {
    brand: "/Havaianas/",
    name: "Havaianas Top Max",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd1?w=500&q=80",
    ],
    imageAlt: "Havaianas Top",
    basePrice: 450_000,
    sizes: ["37", "38", "39", "40", "41", "42"],
  },
  {
    brand: "/Puma/",
    name: "Puma Leadcat 2.0",
    images: [
      "https://images.unsplash.com/photo-1608255276919-9e9f7f1c0f1b?w=500&q=80",
    ],
    imageAlt: "Puma Leadcat",
    basePrice: 690_000,
    sizes: SANDAL_SIZES,
  },
  {
    brand: "/Jordan/",
    name: "Jordan Super Play Slide",
    images: [
      "https://images.unsplash.com/photo-1603485669175-0b9e7a8f1c0a?w=500&q=80",
    ],
    imageAlt: "Jordan Slide",
    basePrice: 1_590_000,
    sizes: SANDAL_SIZES,
  },
  {
    brand: "/New Balance/",
    name: "New Balance Slide 240",
    images: [
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80",
    ],
    imageAlt: "NB Slide 240",
    basePrice: 990_000,
    sizes: SANDAL_SIZES,
  },
  {
    brand: "/Oofos/",
    name: "Oofos Ooriginal Sport",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80",
    ],
    imageAlt: "Oofos Sport",
    basePrice: 1_120_000,
    sizes: ["38", "39", "40", "41", "42", "43"],
  },
];

const CLOTHING_SEEDS: ProductSeed[] = [
  {
    brand: "/Fear Of God/",
    name: "Essentials T-Shirt",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    ],
    imageAlt: "Essentials T-Shirt",
    basePrice: 1_950_000,
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "/Drew House/",
    name: "Mascot Hoodie",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    ],
    imageAlt: "Mascot Hoodie",
    basePrice: 3_800_000,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    brand: "/The North Face/",
    name: "1996 Retro Nuptse Jacket",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    ],
    imageAlt: "Nuptse Jacket",
    basePrice: 7_200_000,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    brand: "/Nike/",
    name: "Nike Sportswear Club Fleece",
    images: [
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=500&q=80",
    ],
    imageAlt: "Nike Club Fleece",
    basePrice: 1_450_000,
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "/Stussy/",
    name: "Stussy Basic Stussy Tee",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
    ],
    imageAlt: "Stussy Tee",
    basePrice: 1_280_000,
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "/Carhartt WIP/",
    name: "Carhartt WIP Active Jacket",
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&q=80",
    ],
    imageAlt: "Carhartt Jacket",
    basePrice: 4_350_000,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    brand: "/Champion/",
    name: "Champion Reverse Weave Hoodie",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6e633?w=500&q=80",
    ],
    imageAlt: "Champion Hoodie",
    basePrice: 2_150_000,
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "/Uniqlo/",
    name: "Uniqlo U Crew Neck",
    images: [
      "https://images.unsplash.com/photo-1622445275463-afa2ab9c0e84?w=500&q=80",
    ],
    imageAlt: "Uniqlo Crew Neck",
    basePrice: 590_000,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    brand: "/Patagonia/",
    name: "Patagonia Better Sweater",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&q=80",
    ],
    imageAlt: "Patagonia Sweater",
    basePrice: 3_250_000,
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "/Supreme/",
    name: "Supreme Box Logo Hoodie",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
    ],
    imageAlt: "Supreme Box Logo",
    basePrice: 8_900_000,
    sizes: ["S", "M", "L", "XL"],
  },
];

const BAGS_SEEDS: ProductSeed[] = [
  {
    brand: "/Nike/",
    name: "Nike Heritage Backpack",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    ],
    imageAlt: "Nike Heritage Backpack",
    basePrice: 950_000,
  },
  {
    brand: "/MLB/",
    name: "MLB Monogram Mini Backpack",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    ],
    imageAlt: "MLB Mini Backpack",
    basePrice: 2_450_000,
  },
  {
    brand: "/Supreme/",
    name: "Supreme Shoulder Bag",
    images: [
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=500&q=80",
    ],
    imageAlt: "Supreme Shoulder Bag",
    basePrice: 3_100_000,
  },
  {
    brand: "/Adidas/",
    name: "Adidas Originals Mini 3D",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
    ],
    imageAlt: "Adidas Mini 3D",
    basePrice: 1_200_000,
  },
  {
    brand: "/Herschel/",
    name: "Herschel Little America",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    ],
    imageAlt: "Herschel Little America",
    basePrice: 1_850_000,
  },
  {
    brand: "/Eastpak/",
    name: "Eastpak Padded Pak'r",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    ],
    imageAlt: "Eastpak Pak'r",
    basePrice: 1_150_000,
  },
  {
    brand: "/Coach/",
    name: "Coach Racer Backpack",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
    ],
    imageAlt: "Coach Racer",
    basePrice: 5_600_000,
  },
  {
    brand: "/Gucci/",
    name: "Gucci GG Marmont Mini",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89e762c631?w=500&q=80",
    ],
    imageAlt: "Gucci Marmont Mini",
    basePrice: 18_500_000,
  },
  {
    brand: "/Louis Vuitton/",
    name: "LV Discovery PM",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    ],
    imageAlt: "LV Discovery",
    basePrice: 42_000_000,
  },
  {
    brand: "/Balenciaga/",
    name: "Balenciaga Explorer Bag",
    images: [
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=500&q=80",
    ],
    imageAlt: "Balenciaga Explorer",
    basePrice: 12_800_000,
  },
];

const PERFUME_SEEDS: ProductSeed[] = [
  {
    brand: "/Chanel/",
    name: "Chanel Bleu de Chanel EDP",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80",
    ],
    imageAlt: "Chanel Bleu de Chanel",
    basePrice: 3_850_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/Dior/",
    name: "Dior Sauvage EDP",
    images: [
      "https://images.unsplash.com/photo-1594035910387-36e1aed659c5?w=500&q=80",
    ],
    imageAlt: "Dior Sauvage",
    basePrice: 3_200_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/Tom Ford/",
    name: "Tom Ford Oud Wood",
    images: [
      "https://images.unsplash.com/photo-1595425970377-c970029bf950?w=500&q=80",
    ],
    imageAlt: "Tom Ford Oud Wood",
    basePrice: 5_600_000,
    sizes: ["50ml", "100ml"],
  },
  {
    brand: "/Gucci/",
    name: "Gucci Guilty Pour Homme",
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddcf2b4?w=500&q=80",
    ],
    imageAlt: "Gucci Guilty",
    basePrice: 2_950_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/YSL/",
    name: "YSL Y Eau de Parfum",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80",
    ],
    imageAlt: "YSL Y",
    basePrice: 2_750_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/Versace/",
    name: "Versace Eros EDP",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b1713135e2fc?w=500&q=80",
    ],
    imageAlt: "Versace Eros",
    basePrice: 2_450_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/Creed/",
    name: "Creed Aventus",
    images: [
      "https://images.unsplash.com/photo-1595425970377-c970029bf950?w=500&q=80",
    ],
    imageAlt: "Creed Aventus",
    basePrice: 7_800_000,
    sizes: ["50ml", "100ml"],
  },
  {
    brand: "/Jo Malone/",
    name: "Jo Malone Wood Sage & Sea Salt",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80",
    ],
    imageAlt: "Jo Malone Wood Sage",
    basePrice: 2_150_000,
    sizes: ["30ml", "100ml"],
  },
  {
    brand: "/Hermès/",
    name: "Hermès Terre d'Hermès",
    images: [
      "https://images.unsplash.com/photo-1594035910387-36e1aed659c5?w=500&q=80",
    ],
    imageAlt: "Hermès Terre d'Hermès",
    basePrice: 3_450_000,
    sizes: PERFUME_SIZES,
  },
  {
    brand: "/Louis Vuitton/",
    name: "Louis Vuitton Imagination",
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddcf2b4?w=500&q=80",
    ],
    imageAlt: "LV Imagination",
    basePrice: 8_500_000,
    sizes: ["50ml", "100ml"],
  },
];

const WATCHES_SEEDS: ProductSeed[] = [
  {
    brand: "/Rolex/",
    name: "Rolex Submariner Date",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    ],
    imageAlt: "Rolex Submariner",
    basePrice: 285_000_000,
  },
  {
    brand: "/Omega/",
    name: "Omega Seamaster Diver 300M",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    ],
    imageAlt: "Omega Seamaster",
    basePrice: 42_000_000,
  },
  {
    brand: "/Seiko/",
    name: "Seiko Prospex Speedtimer",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa6352040?w=500&q=80",
    ],
    imageAlt: "Seiko Prospex",
    basePrice: 8_500_000,
  },
  {
    brand: "/Casio/",
    name: "Casio G-Shock GA-2100",
    images: [
      "https://images.unsplash.com/photo-1587836374828-4dbafa8a0d7a?w=500&q=80",
    ],
    imageAlt: "Casio G-Shock",
    basePrice: 3_200_000,
  },
  {
    brand: "/TAG Heuer/",
    name: "TAG Heuer Carrera Chronograph",
    images: [
      "https://images.unsplash.com/photo-1614164185128-e943d6928d74?w=500&q=80",
    ],
    imageAlt: "TAG Heuer Carrera",
    basePrice: 18_500_000,
  },
  {
    brand: "/Tissot/",
    name: "Tissot PRX Powermatic 80",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    ],
    imageAlt: "Tissot PRX",
    basePrice: 9_800_000,
  },
  {
    brand: "/Apple/",
    name: "Apple Watch Ultra 2",
    images: [
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80",
    ],
    imageAlt: "Apple Watch Ultra",
    basePrice: 16_500_000,
  },
  {
    brand: "/Citizen/",
    name: "Citizen Eco-Drive Promaster",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    ],
    imageAlt: "Citizen Eco-Drive",
    basePrice: 6_200_000,
  },
  {
    brand: "/Fossil/",
    name: "Fossil Gen 6 Hybrid",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa6352040?w=500&q=80",
    ],
    imageAlt: "Fossil Gen 6",
    basePrice: 4_500_000,
  },
  {
    brand: "/Hublot/",
    name: "Hublot Big Bang Unico",
    images: [
      "https://images.unsplash.com/photo-1614164185128-e943d6928d74?w=500&q=80",
    ],
    imageAlt: "Hublot Big Bang",
    basePrice: 125_000_000,
  },
];

const EDITION_SUFFIXES = [
  "Limited",
  "Edition",
  "Premium",
  "Classic",
  "Pro",
  "OG",
  "Retro",
  "2024",
  "Essential",
  "Signature",
];

export function generateSneakerProducts(): Product[] {
  return buildProducts({
    idPrefix: "sneaker",
    seeds: SNEAKER_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generateSunglassesProducts(): Product[] {
  return buildProducts({
    idPrefix: "sun",
    seeds: SUNGLASSES_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generateSandalsProducts(): Product[] {
  return buildProducts({
    idPrefix: "sandal",
    seeds: SANDALS_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generateClothingProducts(): Product[] {
  return buildProducts({
    idPrefix: "clothing",
    seeds: CLOTHING_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generateBagsProducts(): Product[] {
  return buildProducts({
    idPrefix: "bag",
    seeds: BAGS_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generatePerfumeProducts(): Product[] {
  return buildProducts({
    idPrefix: "perfume",
    seeds: PERFUME_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}

export function generateWatchesProducts(): Product[] {
  return buildProducts({
    idPrefix: "watch",
    seeds: WATCHES_SEEDS,
    nameSuffixes: EDITION_SUFFIXES,
  });
}
