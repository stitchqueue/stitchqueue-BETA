import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StitchQueue - Business Management for Longarm Quilters",
  description: "The only business management platform built exclusively for professional longarm quilters. From estimate to delivery, StitchQueue keeps you organized and profitable.",
  keywords: "longarm quilting, quilting business, business management, quilting software, longarm quilter",
  authors: [{ name: "StitchQueue" }],
  openGraph: {
    title: "StitchQueue - Business Management for Longarm Quilters",
    description: "Run your longarm quilting business like a pro. Launching April 2026.",
    type: "website",
    url: "https://stitchqueue.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
