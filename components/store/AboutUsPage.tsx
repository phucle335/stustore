"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  BadgePercent,
  ShieldCheck,
  ScanSearch,
  Users,
  Zap,
  Package,
} from "lucide-react";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.3em] text-[#CCCCCC]/70 uppercase">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}

export function AboutUsPage() {
  return (
    <div className="w-full min-h-screen bg-[#111111] text-white flex flex-col pt-10">
      {/* HERO */}
      <section className="w-full">
        <div className="w-full px-4 md:px-8 2xl:px-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111111] px-5 sm:px-8 lg:px-10 py-10 sm:py-12">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#f24e35]/16 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#f24e35]/10 blur-3xl" />
            </div>

            <div className="relative">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-white/85">
                  <Zap className="h-4 w-4 text-[#f24e35]" />
                  Giới thiệu STUSPORT
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="mt-5 max-w-5xl text-[2rem] leading-[1.06] sm:text-[2.9rem] lg:text-[3.4rem] font-extrabold tracking-tight">
                  STUSPORT —{" "}
                  <span className="text-[#f24e35]">
                    Nền tảng định hình phong cách thể thao và văn hóa đường phố
                  </span>{" "}
                  chính hãng.
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-4 max-w-3xl text-[15px] sm:text-lg leading-relaxed text-[#CCCCCC]">
                  Dark. Bold. Hypebeast. Tối giản nhưng mạnh mẽ, tập trung vào trải
                  nghiệm mua sắm rõ ràng và đáng tin cậy.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/sneakers"
                    className="inline-flex items-center justify-center rounded-full bg-[#f24e35] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_18px_50px_rgba(242,78,53,0.2)] ring-1 ring-[#f24e35]/40 hover:brightness-110 transition"
                  >
                    Khám phá sản phẩm
                  </Link>
                  <Link
                    href="/ho-tro"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 hover:border-[#f24e35]/50 hover:text-white transition"
                  >
                    Xem chính sách hỗ trợ
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="w-full mt-12 sm:mt-14">
        <div className="w-full px-4 md:px-8 2xl:px-24">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="w-full">
              <Reveal>
                <SectionTitle eyebrow="Our story" title="Câu chuyện của chúng tôi" />
              </Reveal>
              <Reveal delay={0.06}>
                <p className="mt-4 text-[15px] sm:text-[17px] leading-relaxed text-[#CCCCCC]">
                  STUSPORT được hình thành bởi một đội ngũ những người trẻ có sự
                  am hiểu sâu sắc về văn hóa sneaker và streetwear. Chúng tôi
                  nhận ra một “nghịch lý thị trường” tại Việt Nam: người tiêu
                  dùng luôn nơm nớp lo sợ trước vấn nạn hàng giả tràn lan trên
                  các sàn thương mại điện tử. Trong khi đó, các cửa hàng phân
                  phối chính hãng lại có mức giá quá cao. STUSPORT ra đời như một
                  nền tảng thương mại điện tử chuyên biệt, cam kết 100% giày thể
                  thao, quần áo và phụ kiện chính hãng nhằm xóa bỏ hoàn toàn rào
                  cản đó.
                </p>
              </Reveal>
            </div>

            <div className="w-full">
              <Reveal>
                <div className="relative overflow-hidden rounded-3xl border border-[#f24e35]/45 bg-[#1A1A1A]">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(242,78,53,0.18),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.06),transparent_60%)]" />
                  <div className="relative p-6 sm:p-8">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70">
                      Placeholder image
                    </p>
                    <p className="mt-3 text-xl sm:text-2xl font-extrabold leading-tight">
                      “Energy meets authenticity.”
                    </p>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
                      Đây là vị trí cho ảnh lookbook / đội ngũ / cửa hàng để tăng
                      chiều sâu thương hiệu.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                      <div className="h-14 rounded-2xl border border-white/10 bg-white/5" />
                      <div className="h-14 rounded-2xl border border-white/10 bg-white/5" />
                      <div className="h-14 rounded-2xl border border-white/10 bg-white/5" />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="w-full mt-12 sm:mt-14">
        <div className="w-full px-4 md:px-8 2xl:px-24">
          <Reveal>
            <SectionTitle eyebrow="Direction" title="Sứ mệnh & Tầm nhìn" />
          </Reveal>

          <div className="w-full mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={0.04}>
              <div className="h-full rounded-3xl border border-white/10 bg-[#1A1A1A] p-5 sm:p-6">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70">
                  Sứ mệnh
                </p>
                <p className="mt-3 text-base sm:text-lg font-semibold leading-relaxed text-white">
                  Xu hướng hóa việc tiếp cận các sản phẩm giày và đồ thể thao
                  chính hãng cho giới trẻ Việt Nam. Xóa bỏ nỗi lo âu về hàng giả
                  bằng một thị trường trực tuyến minh bạch.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-3xl border border-[#f24e35]/35 bg-[#1A1A1A] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(242,78,53,0.12)]">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70">
                  Tầm nhìn
                </p>
                <p className="mt-3 text-base sm:text-lg font-semibold leading-relaxed text-white">
                  <span className="text-[#f24e35] font-extrabold">2028</span>{" "}
                  Trở thành nền tảng phân phối đồ thể thao chính hãng độc lập
                  hàng đầu tại Việt Nam.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="w-full mt-12 sm:mt-14">
        <div className="w-full px-4 md:px-8 2xl:px-24">
          <Reveal>
            <SectionTitle eyebrow="Core values" title="Giá trị cốt lõi" />
          </Reveal>

          <div className="w-full mt-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={0.02}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-[#f24e35]/35 transition">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#f24e35]" />
                  <p className="font-extrabold text-white">Authentic</p>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#CCCCCC]">
                  Chính hãng tuyệt đối — 100% sản phẩm đi kèm Chứng nhận Legit
                  Check.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-[#f24e35]/35 transition">
                <div className="flex items-center gap-3">
                  <BadgePercent className="h-5 w-5 text-[#f24e35]" />
                  <p className="font-extrabold text-white">Accessible</p>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#CCCCCC]">
                  Mức giá đột phá — phá vỡ rào cản tài chính nhờ mô hình Preorder
                  thông minh.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-[#f24e35]/35 transition">
                <div className="flex items-center gap-3">
                  <ScanSearch className="h-5 w-5 text-[#f24e35]" />
                  <p className="font-extrabold text-white">Transparent</p>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#CCCCCC]">
                  Minh bạch hoàn toàn — rõ ràng tuyệt đối về nguồn gốc, giá cả và
                  chính sách.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.11}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-[#f24e35]/35 transition">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#f24e35]" />
                  <p className="font-extrabold text-white">Community-Centric</p>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#CCCCCC]">
                  Trọng tâm cộng đồng — không chỉ là giao dịch, chúng tôi chia
                  sẻ đam mê.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="w-full mt-12 sm:mt-14 pb-14">
        <div className="w-full px-4 md:px-8 2xl:px-24">
          <Reveal>
            <SectionTitle eyebrow="Hybrid model" title="Vì sao chọn STUSPORT" />
          </Reveal>

          <div className="w-full mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={0.04}>
              <div className="group rounded-3xl border border-white/10 bg-[#1A1A1A] p-5 sm:p-6 transition hover:border-[#f24e35]/45 hover:shadow-[0_18px_60px_rgba(242,78,53,0.12)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Package className="h-5 w-5 text-[#f24e35]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-extrabold text-lg leading-tight">
                      Giao nhanh hỏa tốc (Hot Stock)
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#CCCCCC]">
                      Nhận ngay với dịch vụ giao hàng 2-4 giờ tại TP.HCM, 3 ngày
                      toàn quốc. Đối với Pre-order giao từ 7-14 ngày.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="group rounded-3xl border border-white/10 bg-[#1A1A1A] p-5 sm:p-6 transition hover:border-[#f24e35]/45 hover:shadow-[0_18px_60px_rgba(242,78,53,0.12)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <BadgePercent className="h-5 w-5 text-[#f24e35]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-extrabold text-lg leading-tight">
                      Đặt trước giá siêu tốt (Preorder)
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#CCCCCC]">
                      Săn bản giới hạn với mức giá thấp hơn 15-30% so với giá
                      bán lẻ truyền thống.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

