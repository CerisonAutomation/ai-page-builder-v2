"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";
import { Mail } from "lucide-react";

export function FooterBlock(props: AllBlockProps["FooterBlock"]) {
  return (
    <footer className="w-full bg-[var(--color-background,#f8fafc)] border-t py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            {props.logo ? (
              <Image
                src={props.logo}
                alt={props.logoAlt || "Logo"}
                width={120}
                height={40}
                className="object-contain mb-4"
              />
            ) : (
              <Image
                src="/placeholders/logo-placeholder.svg"
                alt="Logo"
                width={120}
                height={40}
                className="object-contain mb-4"
              />
            )}
          </div>
          {props.columns.map((col, i) => (
            <div key={i}>
              <h3 className="font-semibold text-[var(--color-foreground,#1e293b)] mb-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-muted,#64748b)] hover:text-[var(--color-primary,#6366f1)] transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-4">
          <p className="text-sm text-[var(--color-muted,#64748b)]">
            {props.copyright || `© ${new Date().getFullYear()} All rights reserved.`}
          </p>
          <div className="flex gap-4">
            {props.socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-muted,#64748b)] hover:text-[var(--color-primary,#6366f1)] transition"
                aria-label={link.platform}
              >
                {link.platform}
              </a>
            ))}
          </div>
          {props.newsletterCta && (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={props.newsletterPlaceholder || "Enter your email"}
                className="px-3 py-2 border rounded-lg text-sm bg-[var(--color-background,#fff)]"
              />
              <button className="bg-[var(--color-primary,#6366f1)] text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
