/**
 * Generates supabase/products-import-template.xlsx
 * Run: node scripts/generate-products-import-xlsx.mjs
 */
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "supabase", "products-import-template.xlsx");

const GALLERY = {
  sneakers: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80",
    "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=500&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80",
  ],
  sunglasses: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5311?w=500&q=80",
    "https://images.unsplash.com/photo-1589782869502-86111beab0a5?w=500&q=80",
    "https://images.unsplash.com/photo-1508296697849-686698f76c09?w=500&q=80",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
  ],
  bags: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89e762c631?w=500&q=80",
    "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=500&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
  ],
  watches: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    "https://images.unsplash.com/photo-1547996160-81dfa6352040?w=500&q=80",
    "https://images.unsplash.com/photo-1587836374828-4dbafa8a0d7a?w=500&q=80",
    "https://images.unsplash.com/photo-1614164185128-e943d6928d74?w=500&q=80",
  ],
};

/** @type {{ name: string; price: number; category: string; brand_tag: string; description: string; primaryImage: string; sizes?: string }}[]} */
const SAMPLE_PRODUCTS = [
  {
    name: "Giày Nike Air Force 1 '07",
    price: 2550000,
    category: "sneakers",
    brand_tag: "nike",
    description:
      "Giày Nike Air Force 1 '07 chính hãng. Đế cao su bền, upper da synthetic, phù hợp streetwear hàng ngày.",
    primaryImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    sizes:
      '[{"size":"38","quantity":5},{"size":"39","quantity":8},{"size":"40","quantity":12},{"size":"41","quantity":10},{"size":"42","quantity":7}]',
  },
  {
    name: "New Balance 530 Running",
    price: 2650000,
    category: "sneakers",
    brand_tag: "new-balance",
    description: "New Balance 530 — retro running, đệm êm, phong cách Y2K.",
    primaryImage:
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&q=80",
    sizes:
      '[{"size":"39","quantity":6},{"size":"40","quantity":9},{"size":"41","quantity":11},{"size":"42","quantity":8}]',
  },
  {
    name: "Air Jordan 1 Retro High",
    price: 4200000,
    category: "sneakers",
    brand_tag: "jordan",
    description: "Air Jordan 1 Retro High OG — biểu tượng sneaker culture.",
    primaryImage:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80",
    sizes:
      '[{"size":"40","quantity":4},{"size":"41","quantity":6},{"size":"42","quantity":5},{"size":"43","quantity":3}]',
  },
  {
    name: "Ray-Ban Aviator Classic",
    price: 3500000,
    category: "sunglasses",
    brand_tag: "ray-ban",
    description: "Kính Ray-Ban Aviator Classic, tròng polarized, khung kim loại.",
    primaryImage:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    sizes: "[]",
  },
  {
    name: "Gentle Monster Lilit 01",
    price: 5200000,
    category: "sunglasses",
    brand_tag: "gentle-monster",
    description: "Gentle Monster Lilit 01 — thiết kế avant-garde, acetate cao cấp.",
    primaryImage:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80",
    sizes: "[]",
  },
  {
    name: "Áo thun Oversize Premium",
    price: 450000,
    category: "clothing",
    brand_tag: "stusport",
    description: "Áo thun cotton 240gsm, form oversize unisex.",
    primaryImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    sizes:
      '[{"size":"S","quantity":15},{"size":"M","quantity":20},{"size":"L","quantity":18},{"size":"XL","quantity":10}]',
  },
  {
    name: "Hoodie Zip Fleece",
    price: 890000,
    category: "clothing",
    brand_tag: "stusport",
    description: "Hoodie nỉ bông, khóa kéo YKK, túi kangaroo.",
    primaryImage:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    sizes:
      '[{"size":"M","quantity":8},{"size":"L","quantity":12},{"size":"XL","quantity":9}]',
  },
  {
    name: "Túi Crossbody Mini",
    price: 1250000,
    category: "bags",
    brand_tag: "stusport",
    description: "Túi đeo chéo mini, da PU chống nước nhẹ.",
    primaryImage:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    sizes: "[]",
  },
  {
    name: "Backpack Urban 20L",
    price: 1590000,
    category: "bags",
    brand_tag: "stusport",
    description: "Balo 20L, ngăn laptop 15.6\", đệm lưng thoáng khí.",
    primaryImage:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    sizes: "[]",
  },
  {
    name: "Đồng hồ Chronograph Sport",
    price: 2890000,
    category: "watches",
    brand_tag: "casio",
    description: "Đồng hồ chronograph, mặt 42mm, chống nước 5ATM.",
    primaryImage:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    sizes: "[]",
  },
  {
    name: "Đồng hồ Minimal Leather",
    price: 1990000,
    category: "watches",
    brand_tag: "daniel-wellington",
    description: "Đồng hồ mặt tròn tối giản, dây da genuine.",
    primaryImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    sizes: "[]",
  },
];

function buildImageUrls(category, primaryImage) {
  const pool = GALLERY[category] ?? GALLERY.sneakers;
  const urls = [primaryImage];
  for (const url of pool) {
    if (urls.length >= 5) break;
    if (!urls.includes(url)) urls.push(url);
  }
  while (urls.length < 5) urls.push("");
  return urls.slice(0, 5);
}

function toPgTextArray(urls) {
  const filtered = urls.filter(Boolean);
  if (filtered.length === 0) return "{}";
  return `{${filtered.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")}}`;
}

function toUserRow(product) {
  const imgs = buildImageUrls(product.category, product.primaryImage);
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    brand_tag: product.brand_tag,
    description: product.description,
    image_url_1: imgs[0],
    image_url_2: imgs[1],
    image_url_3: imgs[2],
    image_url_4: imgs[3],
    image_url_5: imgs[4],
    sizes: product.sizes ?? "[]",
  };
}

function toSupabaseRow(product) {
  const imgs = buildImageUrls(product.category, product.primaryImage);
  return {
    name: product.name,
    brand_tag: product.brand_tag,
    price: product.price,
    description: product.description,
    images: toPgTextArray(imgs),
    sizes: product.sizes ?? "[]",
  };
}

const userHeaders = [
  "name",
  "price",
  "category",
  "brand_tag",
  "description",
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "image_url_4",
  "image_url_5",
  "sizes",
];

const supabaseHeaders = [
  "name",
  "brand_tag",
  "price",
  "description",
  "images",
  "sizes",
];

const guideRows = [
  ["HƯỚNG DẪN IMPORT SẢN PHẨM LÊN SUPABASE"],
  [""],
  ["Sheet 'products'", "Điền dữ liệu theo cột bạn quen: name, price, category, image_url_1…5"],
  ["Sheet 'supabase_import'", "Cột khớp bảng public.products — dùng khi Import CSV trong Table Editor"],
  [""],
  ["Ánh xạ cột"],
  ["name", "→ products.name"],
  ["price", "→ products.price (số, không dấu phẩy)"],
  ["category", "sneakers | sunglasses | clothing | bags | watches (tham khảo danh mục)"],
  ["brand_tag", "→ products.brand_tag (bắt buộc): nike, adidas, stusport…"],
  ["description", "→ products.description"],
  ["image_url_1 … 5", "Gộp thành cột images (PostgreSQL array) — xem sheet supabase_import"],
  ["sizes", "JSON mảng: [{\"size\":\"40\",\"quantity\":12}] — để trống thì []"],
  [""],
  ["Cách import"],
  ["1", "Table Editor → products → Insert → Import data from CSV"],
  ["2", "Xuất sheet supabase_import sang CSV (Save As CSV trong Excel)"],
  ["3", "Bỏ dòng mẫu nếu chỉ muốn dữ liệu của bạn"],
  ["4", "Không import cột id — Supabase tự sinh UUID"],
  [""],
  ["Lưu ý", "Cần đăng nhập admin (RLS) hoặc dùng service role / SQL Editor"],
];

const wb = XLSX.utils.book_new();

const productsSheet = XLSX.utils.json_to_sheet(
  SAMPLE_PRODUCTS.map(toUserRow),
  { header: userHeaders },
);
XLSX.utils.book_append_sheet(wb, productsSheet, "products");

const supabaseSheet = XLSX.utils.json_to_sheet(
  SAMPLE_PRODUCTS.map(toSupabaseRow),
  { header: supabaseHeaders },
);
XLSX.utils.book_append_sheet(wb, supabaseSheet, "supabase_import");

const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
XLSX.utils.book_append_sheet(wb, guideSheet, "huong_dan");

XLSX.writeFile(wb, outPath);
console.log("Created:", outPath);
