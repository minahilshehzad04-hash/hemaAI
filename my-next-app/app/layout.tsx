import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "./LayoutContent";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "HemaAI",
  description: "AI-powered healthcare & blood cancer detection system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-[var(--color-background)] text-[var(--color-foreground)]`}
      >
          <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
