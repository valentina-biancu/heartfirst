import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeartFirst Clarify — Bring clarity to heart risk",
  description:
    "Gather what is known about heart risk, identify what remains unclear, prepare for a health team conversation, and record what happens next — for yourself or someone you love.",
  keywords: [
    "heart risk",
    "heart health",
    "health preparation",
    "medical appointment",
    "cardiovascular",
    "HeartFirst",
    "Clarify",
  ],
  authors: [{ name: "HeartFirst by Shyntesy" }],
  openGraph: {
    title: "HeartFirst Clarify",
    description:
      "Bring clarity to heart risk. Gather information, identify gaps, prepare for conversations, and record decisions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}