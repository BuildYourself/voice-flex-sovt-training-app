import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Flex",
  description: "Not just a straw. A complete voice training system."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
