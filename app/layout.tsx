import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Novel Architect",
  description: "Créez et planifiez vos romans assistés par intelligence artificielle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
