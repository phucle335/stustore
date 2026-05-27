import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/store/CartProvider";
import { CustomerAuthProvider } from "@/components/store/CustomerAuthProvider";
import { ScrollToTop } from "@/components/store/ScrollToTop";
import { ToastProvider } from "@/components/store/ToastProvider";
import "./globals.css";
import "./brand.css";
import "./motto.css";
import "./store-customer.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stusport",
  description:
    "Stusport — Giày sneaker, quần áo, nước hoa, đồng hồ và phụ kiện thể thao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <ToastProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <ScrollToTop />
              {children}
            </CartProvider>
          </CustomerAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
