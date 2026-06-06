import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "WaitingTheLongest.com — Every Day Counts",
    template: "%s | WaitingTheLongest.com",
  },
  description:
    "Find shelter dogs who have been waiting the longest for adoption. Every day counts — give a long-waiting dog a second chance.",
  keywords: [
    "dog adoption",
    "shelter dogs",
    "longest waiting dogs",
    "adopt don't shop",
    "rescue dogs",
    "animal shelter",
  ],
  openGraph: {
    title: "WaitingTheLongest.com — Every Day Counts",
    description:
      "Find shelter dogs who have been waiting the longest for adoption.",
    type: "website",
    url: "https://waitingthelongest.com",
    siteName: "WaitingTheLongest.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaitingTheLongest.com — Every Day Counts",
    description:
      "Find shelter dogs who have been waiting the longest for adoption.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
