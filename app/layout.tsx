import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SecureAudit",
  description: "AI-Powered Compliance Auditor for Startups & SMBs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"><body className={`${inter.className} bg-gray-900 text-gray-100 antialiased`}>
        {children}
      </body></html>
  );
}