/**
 * Footer Component
 * 
 * Site-wide footer with legal links and copyright.
 * Appears on all pages except auth and legal pages.
 * Hidden when printing.
 * 
 * @module components/Footer
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on auth pages, legal pages, and other standalone pages
  const hideOnRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/terms",
    "/privacy",
  ];

  const shouldHide = hideOnRoutes.some((route) => pathname?.startsWith(route));

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="bg-plum/5 border-t border-line mt-auto print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted">
            © {currentYear} StitchQueue by{" "}
            <a
              href="https://stitchedbysusan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              Stitched By Susan
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/terms"
              className="text-muted hover:text-plum transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-muted hover:text-plum transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:beta@stitchqueue.com"
              className="text-muted hover:text-plum transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="mt-4 pt-4 border-t border-line/50 text-center">
          <span className="text-xs text-muted">
            🚧 Beta Version — Send feedback to{" "}
            <a
              href="mailto:beta@stitchqueue.com"
              className="text-plum hover:underline"
            >
              beta@stitchqueue.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}