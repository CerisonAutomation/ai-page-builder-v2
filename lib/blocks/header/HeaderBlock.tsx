"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";
import { useState, useEffect } from "react";

export function HeaderBlock(props: AllBlockProps["HeaderBlock"]) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!props.sticky) return;
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [props.sticky]);

  const headerClass = [
    "w-full z-50",
    props.sticky ? "fixed top-0 left-0" : "relative",
    props.transparentBg && !isScrolled ? "bg-transparent" : "bg-[var(--color-background,#fff)]",
    isScrolled && props.sticky ? "shadow-md" : "",
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {props.logo ? (
            <Image
              src={props.logo}
              alt={props.logoAlt || "Logo"}
              width={120}
              height={40}
              className="object-contain"
            />
          ) : (
            <Image
              src="/placeholders/logo-placeholder.svg"
              alt="Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          )}
          <nav className="hidden md:flex gap-6">
            {props.navItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="text-sm font-medium text-[var(--color-foreground,#1e293b)] hover:text-[var(--color-primary,#6366f1)] transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {props.ctaLabel && (
            <a
              href={props.ctaHref || "#"}
              className="hidden md:inline-flex bg-[var(--color-primary,#6366f1)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              {props.ctaLabel}
            </a>
          )}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-[var(--color-foreground,#1e293b)] mb-1" />
            <div className="w-5 h-0.5 bg-[var(--color-foreground,#1e293b)] mb-1" />
            <div className="w-5 h-0.5 bg-[var(--color-foreground,#1e293b)]" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-background,#fff)] border-t px-4 py-4 space-y-3">
          {props.navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noopener noreferrer" : undefined}
              className="block text-sm font-medium text-[var(--color-foreground,#1e293b)] hover:text-[var(--color-primary,#6366f1)]"
            >
              {item.label}
            </a>
          ))}
          {props.ctaLabel && (
            <a
              href={props.ctaHref || "#"}
              className="block bg-[var(--color-primary,#6366f1)] text-white px-4 py-2 rounded-lg text-sm font-medium text-center"
            >
              {props.ctaLabel}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
