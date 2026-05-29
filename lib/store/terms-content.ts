import { STORE_NAME } from "./site";

export type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "gioi-thieu",
    title: "1. Giới thiệu",
    paragraphs: [
      `Website ${STORE_NAME} (sau đây gọi là "Chúng tôi") cung cấp nền tảng mua sắm trực tuyến các sản phẩm sneaker, streetwear, phụ kiện, nước hoa và đồng hồ chính hãng.`,
      `Khi truy cập và sử dụng website, Quý khách đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.`,
    ],
  },
  {
    id: "quy-dinh-chung",
    title: "2. Quy định chung",
    paragraphs: [
      "Thông tin sản phẩm (hình ảnh, mô tả, giá) có thể được cập nhật mà không cần báo trước. Giá niêm yết đã bao gồm VAT (nếu có quy định áp dụng).",
      `${STORE_NAME} có quyền từ chối hoặc hủy đơn hàng trong trường hợp sai sót về giá, thông tin sản phẩm, nghi ngờ gian lận hoặc hết hàng.`,
      "Quý khách cam kết cung cấp thông tin đặt hàng chính xác, đầy đủ để chúng tôi giao hàng và hỗ trợ sau bán.",
    ],
  },
  {
    id: "dat-hang-thanh-toan",
    title: "3. Đặt hàng và thanh toán",
    paragraphs: [
      "Đơn hàng được xác nhận khi Quý khách hoàn tất các bước đặt hàng trên website và nhận email/xác nhận từ hệ thống.",
      "Phương thức thanh toán: chuyển khoản, thẻ nội địa/quốc tế, ví điện tử và COD (nếu được hỗ trợ tại khu vực giao hàng).",
      "Đơn hàng có thể bị hủy nếu thanh toán không thành công trong thời hạn quy định hoặc theo yêu cầu của Quý khách trước khi hàng được bàn giao cho đơn vị vận chuyển.",
    ],
  },
  {
    id: "giao-hang",
    title: "4. Giao hàng",
    paragraphs: [
      "Thời gian giao hàng dự kiến 2–5 ngày làm việc (nội thành) và 3–7 ngày (tỉnh thành khác), tùy địa chỉ và đơn vị vận chuyển.",
      "Miễn phí giao hàng cho đơn hàng từ 799.000đ trở lên theo chương trình đang áp dụng trên website.",
      "Quý khách vui lòng kiểm tra hàng khi nhận; mọi khiếu nại về thiếu/hỏng cần phản hồi trong vòng 48 giờ kể từ khi nhận hàng.",
    ],
  },
  {
    id: "doi-tra",
    title: "5. Đổi trả",
    paragraphs: [
      "Miễn phí đổi trả trong vòng 14 ngày kể từ ngày nhận hàng đối với sản phẩm còn nguyên tem, chưa qua sử dụng và đủ điều kiện theo chính sách đổi trả.",
      "Một số danh mục (nước hoa đã mở seal, sản phẩm giảm giá đặc biệt) có thể không áp dụng đổi trả — sẽ được ghi rõ trên trang sản phẩm.",
      "Chi phí vận chuyển đổi trả do lỗi từ phía chúng tôi sẽ do Stusport chi trả; trường hợp đổi size/mẫu theo nhu cầu cá nhân có thể phát sinh phí ship theo biểu phí hiện hành.",
    ],
  },
  {
    id: "bao-mat",
    title: "6. Bảo mật thông tin",
    paragraphs: [
      "Thông tin cá nhân của Quý khách được bảo mật và chỉ sử dụng cho mục đích xử lý đơn hàng, chăm sóc khách hàng và cải thiện dịch vụ.",
      `${STORE_NAME} không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích marketing khi chưa có sự đồng ý của Quý khách, trừ yêu cầu của pháp luật.`,
    ],
  },
  {
    id: "quyen-nghia-vu",
    title: "7. Quyền và nghĩa vụ",
    paragraphs: [
      `Quý khách có quyền tra cứu đơn hàng, yêu cầu hỗ trợ và khiếu nại qua hotline, email hoặc trang Hỗ trợ & giải đáp thắc mắc của ${STORE_NAME}.`,
      "Quý khách không được sử dụng website cho mục đích vi phạm pháp luật, gian lận thanh toán hoặc làm ảnh hưởng đến hệ thống kỹ thuật.",
    ],
  },
  {
    id: "lien-he",
    title: "8. Liên hệ",
    paragraphs: [
      "Hotline: 0901 234 567 (09:00 – 22:00 hàng ngày)",
      "Email: support@stusport.vn",
      "Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      `${STORE_NAME} có quyền điều chỉnh điều khoản này; phiên bản cập nhật sẽ được đăng trên website và có hiệu lực kể từ thời điểm công bố.`,
    ],
  },
];
