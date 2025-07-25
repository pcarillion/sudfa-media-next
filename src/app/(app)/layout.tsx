import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "../globals.css";
import { Api } from "@/lib/api";

const playfair = Playfair_Display({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const api = await Api();
  // const pres = await api.getPresentation();

  const baseUrl = process.env.BASE_URL || "https://sudfa-media.com";
  return {
    metadataBase: new URL(baseUrl),
    title: "Sudfa Media",
    alternates: {
      canonical: "/",
    },
    // description: pres?.shortVersion_html || 'Sudfa Media',
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      images: "/mainlogo.png",
    },
  };
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.className}`}>{children}</body>
    </html>
  );
}
