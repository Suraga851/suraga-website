import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura-Ed Platform MVP",
  description: "Bilingual adaptive learning MVP for UAE schools"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
