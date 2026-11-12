import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: "RE:VINTAGE Analogue Collective",
  description: "Analogue vinyl records and vintage apparel from independent shops.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-parchment font-mono text-vinylBlack antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
