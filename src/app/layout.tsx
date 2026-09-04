import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

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
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Noto Serif Bengali সহ সকল ফন্টের সম্পূর্ণ লিঙ্ক */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}