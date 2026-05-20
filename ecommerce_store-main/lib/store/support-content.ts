import { STORE_NAME } from "./site";

export type SupportCategoryId =
  | "ordering"
  | "payment"
  | "delivery"
  | "returns"
  | "account"
  | "contact";

export type SupportFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SupportCategory = {
  id: SupportCategoryId;
  label: string;
  icon: string;
  items: SupportFaqItem[];
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: "ordering",
    label: "Đặt hàng",
    icon: "fa-shopping-cart",
    items: [
      {
        id: "order-how",
        question: "Làm thế nào để đặt hàng?",
        answer: `Chọn sản phẩm → chọn size (nếu có) → bấm MUA NGAY hoặc thêm vào giỏ → hoàn tất thông tin giao hàng và thanh toán. Đơn hàng sẽ được ${STORE_NAME} xác nhận qua email hoặc tin nhắn.`,
      },
      {
        id: "order-cancel",
        question: "Làm thế nào để hủy đơn hàng đã đặt?",
        answer:
          "Liên hệ hotline 0901 234 567 hoặc email support@stusport.vn trong vòng 2 giờ sau khi đặt (trước khi đơn chuyển sang trạng thái đang giao). Đơn đã giao cho vận chuyển không thể hủy — Quý khách có thể từ chối nhận hoặc yêu cầu đổi trả theo chính sách 14 ngày.",
      },
      {
        id: "order-track",
        question: "Làm sao để tra cứu đơn hàng?",
        answer:
          "Sử dụng mã đơn hàng trong email xác nhận và liên hệ bộ phận CSKH. Chúng tôi sẽ gửi mã vận đơn khi hàng được bàn giao cho đơn vị ship.",
      },
    ],
  },
  {
    id: "payment",
    label: "Thanh toán",
    icon: "fa-credit-card",
    items: [
      {
        id: "pay-methods",
        question: "Các hình thức thanh toán được chấp nhận?",
        answer:
          "Chuyển khoản ngân hàng, thẻ ATM/Visa/Mastercard, ví Momo/ZaloPay (tùy thời điểm) và COD khi giao hàng tại một số khu vực.",
      },
      {
        id: "pay-installment",
        question: "Có trả góp 0% không?",
        answer:
          "Áp dụng trả góp 0% lãi suất cho đơn từ 3.000.000đ qua đối tác ngân hàng (điều kiện và kỳ hạn theo chương trình từng thời kỳ).",
      },
      {
        id: "pay-failed",
        question: "Thanh toán thất bại thì sao?",
        answer:
          "Đơn hàng sẽ ở trạng thái chờ thanh toán. Quý khách có thể thử lại hoặc chọn phương thức khác trong vòng 24 giờ, sau đó đơn có thể tự hủy.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Giao nhận",
    icon: "fa-truck",
    items: [
      {
        id: "ship-time",
        question: "Bao lâu thì tôi sẽ nhận được hàng?",
        answer:
          "Nội thành TP.HCM: 2–3 ngày làm việc. Các tỉnh khác: 3–7 ngày làm việc. Thời gian có thể kéo dài trong mùa sale hoặc thời tiết xấu.",
      },
      {
        id: "ship-fee",
        question: "Chi phí vận chuyển là bao nhiêu?",
        answer:
          "Miễn phí giao hàng cho đơn từ 799.000đ. Đơn dưới mức này áp dụng phí ship theo khu vực (thường 30.000–50.000đ nội thành).",
      },
      {
        id: "ship-address",
        question: "Tôi có thể thay đổi địa chỉ nhận hàng đã đặt không?",
        answer:
          "Có, nếu đơn chưa được bàn giao cho vận chuyển. Vui lòng gọi hotline ngay để cập nhật.",
      },
    ],
  },
  {
    id: "returns",
    label: "Đổi trả - Bảo hành",
    icon: "fa-sync-alt",
    items: [
      {
        id: "return-policy",
        question: "Chính sách đổi trả khi mua hàng tại website?",
        answer: `Miễn phí đổi trả trong 14 ngày, sản phẩm còn nguyên tem/hộp, chưa qua sử dụng. ${STORE_NAME} cam kết 100% hàng chính hãng.`,
      },
      {
        id: "return-time",
        question: "Thời gian đổi trả sản phẩm?",
        answer:
          "Yêu cầu đổi trả cần gửi trong vòng 14 ngày kể từ ngày nhận hàng. Sau khi nhận hàng hoàn, chúng tôi xử lý đổi size/mẫu hoặc hoàn tiền trong 3–7 ngày làm việc.",
      },
      {
        id: "warranty",
        question: "Chính sách bảo hành?",
        answer:
          "Sản phẩm lỗi do nhà sản xuất được bảo hành theo tem/hóa đơn của hãng. Stusport hỗ trợ tiếp nhận và chuyển bảo hành với nhà cung cấp chính hãng.",
      },
    ],
  },
  {
    id: "account",
    label: "Tài khoản",
    icon: "fa-user",
    items: [
      {
        id: "acc-login",
        question: "Tôi có bắt buộc đăng ký tài khoản không?",
        answer:
          "Có thể mua hàng khách với email/số điện thoại. Đăng nhập Google/Facebook giúp lưu lịch sử đơn và nhận ưu đãi thành viên.",
      },
      {
        id: "acc-forgot",
        question: "Quên mật khẩu thì làm sao?",
        answer:
          "Sử dụng chức năng quên mật khẩu trên trang đăng nhập hoặc liên hệ support@stusport.vn để được hỗ trợ xác minh.",
      },
    ],
  },
  {
    id: "contact",
    label: "Liên hệ",
    icon: "fa-comments",
    items: [
      {
        id: "contact-info",
        question: "Thông tin liên hệ Stusport?",
        answer:
          "Hotline: 0901 234 567 · Email: support@stusport.vn · Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM · Hỗ trợ: 09:00–22:00 hàng ngày.",
      },
      {
        id: "contact-form",
        question: "Gửi yêu cầu hỗ trợ qua đâu?",
        answer:
          "Gọi hotline, email support@stusport.vn hoặc nhắn tin qua fanpage Facebook/Zalo chính thức của Stusport.",
      },
    ],
  },
];
