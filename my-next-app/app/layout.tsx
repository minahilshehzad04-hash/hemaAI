import type { Metadata } from "next";
import "./globals.css";
import LayoutContent from "./LayoutContent";

export const metadata: Metadata = {
  title: "HemaAI",
  description: "AI-powered healthcare & blood cancer detection system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-[var(--color-background)] text-[var(--color-foreground)] font-sans"
      >
          <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
