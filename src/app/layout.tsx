import type { Metadata } from "next";
import { Fraunces, Hind_Siliguri, Inter, Noto_Serif_Bengali, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--next-font-fraunces",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--next-font-hind-siliguri",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--next-font-inter",
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--next-font-noto-serif-bengali",
  display: "swap",
});

const tiroBangla = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--next-font-tiro-bangla",
  display: "swap",
});

const title = "উত্তোলন | Uttolon Learning System";
const description =
  "শুধু পড়ানো নয়, শেখার একটি সম্পূর্ণ ব্যবস্থা। Concept, Practice, Assessment, Recovery ও Result-ভিত্তিক শিক্ষা ব্যবস্থা — উত্তোলন।";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s",
  },
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Uttolon",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${fraunces.variable} ${hindSiliguri.variable} ${inter.variable} ${notoSerifBengali.variable} ${tiroBangla.variable}`}
    >
      <body className="antialiased">
        <GoogleAnalytics />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
