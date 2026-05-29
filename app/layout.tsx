import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/store/CartProvider";
import { CustomerAuthProvider } from "@/components/store/CustomerAuthProvider";
import { ScrollToTop } from "@/components/store/ScrollToTop";
import { VercelAnalytics } from "@/components/analytics/VercelAnalytics";
import { AnalyticsTracker } from "@/components/store/AnalyticsTracker";
import { ToastProvider } from "@/components/store/ToastProvider";
import "@/styles/globals.css";

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <ToastProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <AnalyticsTracker />
              <VercelAnalytics />
              <ScrollToTop />
              {children}
            </CartProvider>
          </CustomerAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
