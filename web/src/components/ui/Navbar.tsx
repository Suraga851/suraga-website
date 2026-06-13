"use client";

import { useState } from "react";
import Link from "next/link";

export interface NavbarProps {
  locale: "en" | "ar";
  nav: Record<string, string>;
  navIds: string[];
  logoText: string;
  langSwitchLabel: string;
  langSwitchHref: string;
}

export default function Navbar({
  locale,
  nav,
  navIds,
  logoText,
  langSwitchLabel,
  langSwitchHref,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const isRtl = locale === "ar";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="relative group">
            <a href="#home" className="text-xl font-bold tracking-tight text-white inline-block">
              <span className="text-brand-400">{logoText}</span>
            </a>
            <div className="absolute top-full left-0 mt-2 min-w-[150px] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-2 rtl:left-auto rtl:right-0">
              <Link
                href={isRtl ? "/ar.html" : "/"}
                className="block px-4 py-2 text-sm font-medium text-gray-200 hover:text-brand-400 hover:bg-white/5 rounded-md transition-colors"
              >
                {isRtl ? "الموقع الرئيسي" : "Main Website"}
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navIds.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm text-gray-300 hover:text-brand-300 transition-colors"
              >
                {nav[id]}
              </a>
            ))}
            <Link
              href={langSwitchHref}
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              {langSwitchLabel}
            </Link>
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-black/80 backdrop-blur-lg border-b border-white/5">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navIds.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="block px-3 py-2 text-base text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
                onClick={() => setOpen(false)}
              >
                {nav[id]}
              </a>
            ))}
            <Link
              href={langSwitchHref}
              className="block px-3 py-2 text-base text-brand-400 hover:text-brand-300"
              onClick={() => setOpen(false)}
            >
              {langSwitchLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
