import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suraga Elzibaer | Learning Assistant in Dubai",
  description:
    "Suraga Elzibaer is a bilingual Learning Assistant and AI Literacy Assistant Teacher in Dubai specializing in inclusive education, differentiated learning, and Arabic and Islamic support for international schools.",
  keywords: [
    "Suraga website",
    "Suraga Elzibaer website",
    "Suraga Elzibaer",
    "Learning Assistant Dubai",
    "Teaching Assistant Dubai",
    "AI Literacy Assistant Teacher Dubai",
    "SEN support UAE",
    "Inclusive Education Specialist Dubai",
    "Arabic Islamic support teacher",
    "Bilingual Arabic English educator",
  ],
  authors: [{ name: "Suraga Elzibaer" }],
  themeColor: "#0d9488",
  openGraph: {
    title: "Suraga Elzibaer | Learning Assistant in Dubai",
    description:
      "Professional Learning Assistant and AI Literacy Assistant Teacher in Dubai with expertise in inclusive education and bilingual support",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_AE",
    url: "https://suraga-website.vercel.app/suraga-3d/",
    siteName: "Suraga Elzibaer",
    images: [
      {
        url: "https://suraga-website.vercel.app/assets/images/suraga-headshot.jpg",
        alt: "Suraga Elzibaer | Learning Assistant in Dubai",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suraga Elzibaer | Learning Assistant in Dubai",
    description:
      "Professional Learning Assistant and AI Literacy Assistant Teacher in Dubai with expertise in inclusive education and bilingual support",
    images: ["https://suraga-website.vercel.app/assets/images/suraga-headshot.jpg"],
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://suraga-website.vercel.app/suraga-3d/",
    languages: {
      ar: "https://suraga-website.vercel.app/suraga-3d/ar/",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/assets/images/suraga-headshot.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Suraga Elzibaer",
                alternateName: ["Suraga Website", "Suraga Elzibaer Website", "Suraqa Website"],
                url: "https://suraga-website.vercel.app/suraga-3d/",
                inLanguage: "en",
              },
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Suraga Elzibaer",
                jobTitle: "Learning Assistant, AI Literacy Assistant Teacher & Inclusive Education Specialist",
                email: "suragaelzibaer@gmail.com",
                telephone: "+971557177083",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dubai",
                  addressCountry: "AE",
                },
                knowsLanguage: ["Arabic", "English"],
                sameAs: ["https://linkedin.com/in/suraga-elzibaer"],
                url: "https://suraga-website.vercel.app/suraga-3d/",
                image: "https://suraga-website.vercel.app/assets/images/suraga-headshot.jpg",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebPage",
                url: "https://suraga-website.vercel.app/suraga-3d/",
                name: "Suraga Elzibaer | Learning Assistant in Dubai",
                description:
                  "Suraga Elzibaer is a bilingual Learning Assistant and AI Literacy Assistant Teacher in Dubai specializing in inclusive education, differentiated learning, and Arabic and Islamic support for international schools.",
                inLanguage: "en",
              },
            ]),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
