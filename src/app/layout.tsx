import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thetalkofthomas.com"),
  title: {
    default: "The Talk of Thomas — Chiến lược, Tư duy & Kỷ luật",
    template: "%s | The Talk of Thomas",
  },
  description:
    "Một tạp văn biên tập tối giản của Thomas Nguyen về tư duy chiến lược, sự nghiệp, các cuộc đàm phán quan trọng và kỷ luật tự thân trong kỷ nguyên số.",
  authors: [{ name: "Thomas Nguyen", url: "https://thetalkofthomas.com" }],
  creator: "Thomas Nguyen",
  publisher: "The Talk of Thomas",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://thetalkofthomas.com",
    siteName: "The Talk of Thomas",
    title: "The Talk of Thomas — Chiến lược, Tư duy & Kỷ luật",
    description:
      "Một tạp văn biên tập tối giản của Thomas Nguyen về tư duy chiến lược, sự nghiệp và kỷ luật tự thân.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Talk of Thomas — Chiến lược, Tư duy & Kỷ luật",
    description:
      "Một tạp văn biên tập tối giản của Thomas Nguyen về tư duy chiến lược, sự nghiệp và kỷ luật tự thân.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth light">
      <body
        className={`${cormorant.variable} ${inter.variable} antialiased min-h-screen flex flex-col justify-between`}
      >
        {children}
      </body>
    </html>
  );
}
