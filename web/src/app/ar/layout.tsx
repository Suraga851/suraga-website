import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "سراجا الزبير - مساعد تعليم | دبي",
  description:
    "سراجا الزبير - مساعد تعليم ومعلم محو الأمية في الذكاء الاصطناعي في دبي متخصص في التعليم الشامل، التدريس المختلف، والدعم العربي/الإسلامي للمدارس الدولية",
  keywords: [
    "مساعد تعليم دبي",
    "معلم محو الأمية في الذكاء الاصطناعي دبي",
    "دعم ذوي الاحتياجات الخاصة الإمارات",
    "معلم ثنائي اللغة",
    "دعم عربي إسلامي",
    "التدريس المتمايز",
    "التعليم الشامل",
  ],
  authors: [{ name: "سراجا الزبير" }],
  themeColor: "#0d9488",
  openGraph: {
    title: "سراجا الزبير - مساعد تعليم | دبي",
    description: "مساعد تعليم محترف ومعلم محو الأمية في الذكاء الاصطناعي في دبي متخصص في التعليم الشامل والدعم ثنائي اللغة",
    type: "website",
    locale: "ar_AE",
    alternateLocale: "en_US",
    url: "https://suraga-website.vercel.app/suraga-3d/ar/",
    siteName: "سراجا الزبير",
    images: [
      {
        url: "https://suraga-website.vercel.app/assets/images/suraga-headshot.jpg",
        alt: "سراجا الزبير - مساعد تعليم | دبي",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سراجا الزبير - مساعد تعليم | دبي",
    description: "مساعد تعليم محترف ومعلم محو الأمية في الذكاء الاصطناعي في دبي متخصص في التعليم الشامل والدعم ثنائي اللغة",
    images: ["https://suraga-website.vercel.app/assets/images/suraga-headshot.jpg"],
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://suraga-website.vercel.app/suraga-3d/ar/",
    languages: {
      en: "https://suraga-website.vercel.app/suraga-3d/",
    },
  },
};

export default function ArLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
