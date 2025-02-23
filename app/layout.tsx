import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"], 
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Swifty Quill",
  description: "SwiftyQuill is a fast, intuitive note-taking app that helps you capture ideas, organize tasks, and stay productive. With smart search, easy tagging, and seamless syncing across devices, it keeps your notes accessible and clutter-free. Whether brainstorming or planning, SwiftyQuill makes writing effortless.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
