import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartProvider } from "@/components/store/CartProvider";
import { ScrollToTop } from "@/components/store/ScrollToTop";
import { ToastProvider } from "@/components/store/ToastProvider";
import "./globals.css";
import "./stusport.css";

export const metadata: Metadata = {
  title: "Stusport",
  description: "Stusport — Giày sneaker, quần áo, nước hoa, đồng hồ và phụ kiện thể thao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <ToastProvider>
          <CartProvider>
            <ScrollToTop />
            {children}
            <SiteFooter />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
