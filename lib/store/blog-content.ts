import type { BlogCategoryId } from "@/lib/store/blog-categories";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  /** Chuỗi nội dung (chia đoạn bằng \\n\\n) */
  body: string;
  /** Nhóm hiển thị trên trang blog (Tips, Sneaker, …) */
  category?: BlogCategoryId;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    category: "sneakers",
    title: "Cách chọn sneaker phù hợp phong cách streetwear",
    excerpt:
      "Streetwear không có công thức cố định — nhưng bạn vẫn có thể chọn sneaker đúng phom dáng, tông màu và chất liệu để outfit “khớp gu” hơn mỗi ngày.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    date: "12 Tháng 3, 2026",
    body: [
      "Streetwear là sự tự do trong phối đồ. Vì vậy, chọn sneaker phù hợp không phải để “đúng bài”, mà để đôi giày hỗ trợ đúng tinh thần outfit bạn đang theo đuổi.",
      "1) Cân bằng phom dáng: Sneaker chunky hợp khi bạn mix layer dày, quần ống rộng/cargo. Ngược lại, low-top hoặc silhouette gọn sẽ cân tốt với jeans slim/straight fit hoặc quần lửng.",
      "2) Chọn màu để outfit dễ sống chung: Nếu bạn mặc nhiều chi tiết, ưu tiên tông trung tính (trắng/đen/xám). Nếu outfit đơn sắc, sneaker màu nổi (đỏ/cam/xanh lá…) sẽ trở thành điểm nhấn.",
      "3) Chất liệu quyết định “vibe”: Canvas thường nhẹ, thoáng và hợp nhịp dạo phố. Da lộn/dạ tổng hợp cho cảm giác cá tính, vintage hơn. Với nhu cầu vận động, chất liệu bền và giữ form sẽ giúp bạn ít phải “đi sửa” sau thời gian dài.",
      "Checklist nhanh trước khi mua: (i) form chân bạn—ôm vừa hay cần thoải mái, (ii) chiều dài/không gian mũi giày, (iii) màu có phối được đa số đồ sẵn có hay không, (iv) chất liệu có hợp mùa và mục đích dùng.",
      "Chọn đúng sneaker streetwear sẽ giúp outfit trông “có chủ đích” hơn, dù bạn chỉ mặc một chiếc áo thun và một chiếc quần đơn giản. Quan trọng nhất: bạn thấy tự tin và thoải mái khi đi."
    ].join("\n\n"),
  },
  {
    id: "blog-2",
    category: "accessories",
    title: "Xu hướng kính mát thể thao 2026",
    excerpt:
      "2026 chứng kiến sự giao thoa giữa hiệu năng và thời trang: kính ôm sát khuôn mặt, tròng phân cực, và các tùy chọn thích ứng ánh sáng để dùng từ tập luyện đến dạo phố.",
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    date: "5 Tháng 3, 2026",
    body: [
      "Kính mát thể thao 2026 không còn chia tách rõ ràng giữa “kính để chạy” và “kính để đi chơi”. Người mua ngày càng muốn một cặp kính: nhìn đẹp, đỡ chói và dùng được trong nhiều bối cảnh.",
      "1) Trào lưu form wrap/ôm sát: Các dáng wraparound hoặc shield tạo cảm giác bảo vệ vùng mắt rộng hơn, đồng thời tạo điểm nhấn thời trang mạnh mẽ. Kiểu dáng này đặc biệt hợp với lối chơi street + outdoor.",
      "2) Polarized (phân cực) vẫn là “điểm cộng”: Khi đi đường nắng gắt, lái xe, hoặc hoạt động gần mặt nước, tròng phân cực giúp giảm chói và tăng độ tương phản.",
      "3) Tính linh hoạt của tròng: Xu hướng tròng có khả năng tự thích ứng theo ánh sáng (photochromic) đang được quan tâm vì giảm nhu cầu thay kính khi chuyển môi trường.",
      "4) Vật liệu gọng và cảm giác đeo: Gọng nhẹ, bền và giữ form lâu sẽ giúp bạn đeo lâu hơn mà ít mỏi. Thêm nữa, lớp hoàn thiện/hoàn màu (gradient, mirrored…) giúp trang phục “lên level” nhanh hơn.",
      "Gợi ý chọn nhanh: Nếu bạn ưu tiên hiệu năng khi vận động—chọn tròng phân cực + form ôm. Nếu bạn ưu tiên thời trang hằng ngày—ưu tiên dáng cổ điển/retro nhưng vẫn có tính năng chống UV."
    ].join("\n\n"),
  },
  {
    id: "blog-3",
    category: "tips",
    title: "Chăm sóc giày da và vải đúng cách",
    excerpt:
      "Da và vải cần “đúng cách” mới bền màu. Bài viết này tóm tắt quy trình làm sạch – làm khô – dưỡng và bảo quản theo từng chất liệu.",
    image:
      "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=800&q=80",
    date: "28 Tháng 2, 2026",
    body: [
      "Để giày luôn đẹp lâu, nguyên tắc số 1 là: làm sạch nhẹ nhàng và xử lý đúng chất liệu. Đừng ngâm nước, đừng chà mạnh “bằng cảm giác” vì sẽ làm bay màu hoặc biến dạng bề mặt.",
      "Giày da (leather):\n- Dùng khăn khô hoặc bàn chải mềm để loại bụi.\n- Lau vết bẩn bằng khăn ẩm vắt khô; với vết khó, dùng dung dịch chuyên cho da và chỉ thoa lượng nhỏ.\n- Đợi giày khô tự nhiên nơi thoáng mát, tránh nắng gắt và máy sấy.",
      "Sau khi sạch và khô: bổ sung dưỡng/conditioner cho da để giảm nứt nẻ và giữ độ mềm. Dưỡng định kỳ sẽ giúp màu giày ổn định hơn theo thời gian.",
      "Giày da lộn/suede: tránh nước. Nếu cần làm sạch, dùng bàn chải chuyên và các sản phẩm làm sạch dạng gôm/tẩy phù hợp.",
      "Giày vải/canvas: có thể dùng dung dịch nhẹ (xà phòng loãng) và chà nhẹ theo chiều bề mặt. Sau đó lau lại bằng khăn sạch và để khô tự nhiên.",
      "Bảo quản đúng: để giày nơi khô ráo, có thông gió. Nhét giấy giữ form giúp hạn chế nhăn và hạn chế mùi ẩm."
    ].join("\n\n"),
  },
  {
    id: "blog-4",
    category: "clothing",
    title: "5 outfit với áo hoodie basic cho nam",
    excerpt:
      "Hoodie basic dễ phối nhưng muốn đẹp “đúng chất streetwear” thì bạn cần chọn phom quần phù hợp và cân bằng màu sắc. Dưới đây là 5 công thức dễ áp dụng.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    date: "20 Tháng 2, 2026",
    body: [
      "Hoodie basic có lợi thế: mặc nhanh, lên dáng dễ và “cân” được nhiều hoàn cảnh. Điểm khác nhau là bạn phối quần/giày thế nào để outfit không bị xuề xòa.",
      "1) Hoodie + quần jogger\nCông thức an toàn nhất cho dạo phố: hoodie phom vừa + jogger gọn ở gấu. Thêm sneaker trắng và một phụ kiện nhỏ là đủ chất.",
      "2) Hoodie + quần jeans\nChọn jeans straight hoặc baggy vừa phải để cân với phom hoodie. Màu trung tính (đen/xám/blue tối) giúp tổng thể sạch và dễ nhìn.",
      "3) Hoodie + quần cargo\nCargo túi hộp tạo đúng tinh thần streetwear. Gợi ý: chọn hoodie đơn sắc, để cargo là điểm nhấn form.",
      "4) Hoodie + layering áo khoác\nKéo outfit lên mức “có chiều sâu”: khoác bomber/denim/áo khoác ngoài cùng tông màu. Mẹo nhỏ là giữ đường viền cổ và tay áo gọn để outfit không rối.",
      "5) Hoodie + quần short\nPhù hợp thời tiết mát: chọn short vừa không quá ngắn và đi sneaker phù hợp để tổng thể không bị “lệch nhịp”.",
      "Gợi ý màu sắc: Nếu bạn muốn phối dễ, cứ ưu tiên đen/xám/trắng/be. Khi muốn nổi bật, hãy chọn 1 món nhấn (giày hoặc phụ kiện) thay vì nhồi nhiều màu."
    ].join("\n\n"),
  },
  {
    id: "blog-5",
    category: "tips",
    title: "Dép slide: chọn đôi nào cho mùa hè?",
    excerpt:
      "Dép slide hợp hè vì tiện và nhẹ. Nhưng để đi lâu mà không đau chân, bạn cần để ý chất liệu, độ êm và độ hỗ trợ vòm bàn chân.",
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    date: "14 Tháng 2, 2026",
    body: [
      "Mùa hè thường cần một đôi dép có thể mang nhanh, dễ vệ sinh và hợp hoàn cảnh. Dép slide đáp ứng tốt phần “tiện”, nhưng mức độ thoải mái sẽ khác nhau tùy thiết kế và chất liệu.",
      "Yeezy Slide (phong cách tối giản streetwear):\n- Ưu điểm: nhẹ, form tối giản, dễ phối đồ casual.\n- Lưu ý: nếu bạn đi bộ nhiều, hãy cân nhắc cảm giác ôm và hỗ trợ vòm.",
      "Crocs slide (tính thực dụng):\n- Ưu điểm: bền bỉ, dễ làm sạch và thường hợp với hoạt động gần nước.\n- Lưu ý: ưu tiên size đúng để không bị lỏng khi di chuyển.",
      "Birkenstock (comfort và hỗ trợ):\n- Ưu điểm: thiết kế công thái học thiên về hỗ trợ chân, hợp người muốn mang lâu.\n- Lưu ý: có thể cần thời gian làm quen với form.",
      "Cách chọn nhanh trước khi mua: \n1) thử đi vài phút xem có cấn chỗ nào không,\n2) ưu tiên bề mặt dễ vệ sinh,\n3) chọn độ êm vừa đủ cho nhu cầu (đi loanh quanh hay đi bộ cả ngày)."
    ].join("\n\n"),
  },
  {
    id: "blog-6",
    category: "accessories",
    title: "Túi backpack: size và chất liệu cần biết",
    excerpt:
      "Chọn backpack không chỉ là mua theo “20L/30L”. Bạn cần hiểu dung tích thực dùng, ngăn laptop, và chất liệu chống nước để balo đi bền trong điều kiện Việt Nam.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    date: "8 Tháng 2, 2026",
    body: [
      "Backpack size phù hợp sẽ giúp bạn sắp xếp gọn hơn và đỡ mỏi vai lưng. Trên thị trường, cùng một con số dung tích có thể cảm giác khác nhau tùy thiết kế ngăn.",
      "1) Chọn dung tích theo nhu cầu\n- 20L: phù hợp đi học/đi làm hoặc chuyến đi ngắn ngày.\n- 30L: hợp các chuyến đi 2–4 ngày, mang thêm thiết bị và đồ cá nhân.",
      "2) Chất liệu và độ chống nước\nBạn nên ưu tiên vải có phủ lớp chống thấm như PU/TPU/DWR trên polyester hoặc nylon. Nếu muốn chịu mưa tốt hơn, dòng tarpaulin (hoặc vật liệu tương tự) thường bền và dễ làm sạch.",
      "3) Ngăn laptop và cấu trúc\nKiểm tra kích thước ngăn laptop phù hợp máy bạn, thêm đệm lưng và dây đeo êm sẽ quyết định cảm giác mang cả ngày.",
      "Checklist trước khi chọn: (i) laptop size, (ii) cần mang bao nhiêu đồ, (iii) gặp thời tiết mưa thường xuyên hay không, (iv) bạn thích gọn hay thích nhiều ngăn chia."
    ].join("\n\n"),
  },
];

export function getBlogPostById(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.id === id);
}

export function getBlogPostHref(id: string): string {
  return `/blog/${id}`;
}
