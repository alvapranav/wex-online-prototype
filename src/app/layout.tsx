import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WEX Online",
  description: "A demo agent for WEX",
  icons: {
    icon: '/wex_logo_nobg.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
