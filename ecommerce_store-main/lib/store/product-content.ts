import { formatBrandDisplay } from "./brands";
import type { ProductDetail } from "./catalog";
import type { ProductCategory } from "./types";
import { STORE_NAME } from "./site";

export type ProductSpecRow = {
  label: string;
  value: string;
};

const CATEGORY_OCCASION: Record<ProductCategory, string> = {
  sneakers: "Đi chơi, tập luyện",
  sunglasses: "Đi chơi, du lịch",
  sandals: "Đi chơi, mùa hè",
  clothing: "Đi chơi, tập luyện",
  bags: "Đi học, đi làm, du lịch",
  perfume: "Hàng ngày, sự kiện",
  watches: "Công sở, thời trang",
};

const CATEGORY_SPORT: Record<ProductCategory, string> = {
  sneakers: "Chạy bộ, lifestyle",
  sunglasses: "Lifestyle",
  sandals: "Lifestyle",
  clothing: "Tập luyện, lifestyle",
  bags: "Lifestyle",
  perfume: "—",
  watches: "—",
};

function materialForCategory(category: ProductCategory): string {
  switch (category) {
    case "sneakers":
    case "sandals":
      return "Da tổng hợp / vải mesh";
    case "clothing":
      return "Cotton / Polyester";
    case "sunglasses":
      return "Acetate / Kim loại";
    case "bags":
      return "Polyester / Da PU";
    case "perfume":
      return "Eau de Parfum";
    case "watches":
      return "Thép không gỉ / Silicone";
    default:
      return "Chất liệu cao cấp";
  }
}

export function getProductSpecs(product: ProductDetail): ProductSpecRow[] {
  const brand = formatBrandDisplay(product.brand);
  const base: ProductSpecRow[] = [
    { label: "Thương hiệu", value: brand },
    { label: "Dịp sử dụng", value: CATEGORY_OCCASION[product.category] },
    { label: "Danh mục", value: product.category },
    { label: "Chất liệu", value: materialForCategory(product.category) },
  ];

  if (product.category === "clothing") {
    return [
      ...base,
      { label: "Môn thể thao", value: CATEGORY_SPORT[product.category] },
      { label: "Công nghệ", value: "Vải co giãn 4 chiều" },
      {
        label: "Tính năng nổi bật",
        value: "Nhanh khô, thoáng khí, nhẹ, co giãn",
      },
      { label: "Kiểu dáng", value: "Regular fit" },
      { label: "Họa tiết", value: "Trơn / logo thương hiệu" },
    ];
  }

  if (product.category === "sneakers" || product.category === "sandals") {
    return [
      ...base,
      { label: "Môn thể thao", value: CATEGORY_SPORT[product.category] },
      { label: "Công nghệ", value: "Đệm êm, bám sàn tốt" },
      {
        label: "Tính năng nổi bật",
        value: "Thoáng khí, nhẹ, bền form",
      },
      { label: "Kiểu dáng", value: "Unisex" },
    ];
  }

  if (product.category === "perfume") {
    return [
      ...base,
      { label: "Nồng độ", value: "Eau de Parfum" },
      { label: "Hương", value: "Hương hiện đại, lưu hương lâu" },
      { label: "Dung tích", value: product.sizes?.join(", ") ?? "50ml, 100ml" },
    ];
  }

  if (product.category === "watches") {
    return [
      ...base,
      { label: "Máy", value: "Quartz / Automatic" },
      { label: "Mặt kính", value: "Kính cứng chống trầy" },
      { label: "Chống nước", value: "3ATM – 10ATM" },
    ];
  }

  return [
    ...base,
    { label: "Môn thể thao", value: CATEGORY_SPORT[product.category] },
    {
      label: "Tính năng nổi bật",
      value: "Chính hãng, bền đẹp, dễ phối đồ",
    },
  ];
}

export function getProductDetailBullets(product: ProductDetail): string[] {
  const brand = formatBrandDisplay(product.brand);
  return [
    `Sản phẩm chính hãng ${brand}, phân phối tại ${STORE_NAME}.`,
    "Chất liệu và hoàn thiện cao cấp, phù hợp sử dụng hàng ngày.",
    "Thiết kế hiện đại, dễ phối với streetwear và phong cách thể thao.",
    product.sizes
      ? `Có sẵn nhiều lựa chọn size: ${product.sizes.join(", ")}.`
      : "Số lượng có hạn — đặt hàng sớm để giữ size/mẫu ưa thích.",
    `Mã sản phẩm: ${product.id.toUpperCase()}.`,
  ];
}

export const PRODUCT_RETURN_POLICY = `Quý khách có thể đổi size hoặc đổi mẫu trong vòng 14 ngày kể từ ngày nhận hàng (sản phẩm còn nguyên tem, chưa qua sử dụng). ${STORE_NAME} hỗ trợ đổi trả miễn phí tại cửa hàng hoặc qua đơn vị vận chuyển đối tác. Không áp dụng đổi trả với hàng giảm giá sâu hoặc phụ kiện đã mở seal (nước hoa).`;

export const PRODUCT_CARE_GUIDE = `Giặt tay hoặc giặt máy chế độ nhẹ với nước lạnh; tránh tẩy chất mạnh. Phơi trong mát, tránh ánh nắng trực tiếp. Với giày/dép: vệ sinh bằng khăn ẩm, không ngâm nước lâu. Kính mắt: lau bằng vải microfiber. Đồng hồ: tránh va đập mạnh và hóa chất.`;

export const PRODUCT_STORAGE_GUIDE = `Bảo quản nơi khô ráo, thoáng mát. Giày và túi nên nhồi giấy báo giữ form. Nước hoa để xa nguồn nhiệt và ánh sáng. Đồng hồ nên cất hộp riêng, tránh ẩm mốc.`;

export function getAboutStoreContent(): string {
  return `${STORE_NAME} là cửa hàng sneaker, streetwear và phụ kiện chính hãng tại Việt Nam. Chúng tôi cam kết 100% hàng authentic, tư vấn size chuẩn và hỗ trợ đổi trả minh bạch. Mua sắm tại ${STORE_NAME} để trải nghiệm dịch vụ tận tâm và bộ sưu tập cập nhật theo xu hướng.`;
}
