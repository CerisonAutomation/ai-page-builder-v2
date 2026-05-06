"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";

export function CTAWithImageBlock(props: AllBlockProps["CTAWithImageBlock"]) {
  const imagePosition = props.imagePosition || "right";
  const bgColor = props.bgColor || "var(--color-background, #f8fafc)";

  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {imagePosition === "left" && (
          <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-xl overflow-hidden">
            {props.image ? (
              <Image
                src={props.image}
                alt="CTA"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <Image
                src="/placeholders/hero-placeholder.svg"
                alt="CTA"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
        )}
        <div className={`w-full ${imagePosition === "left" ? "md:w-1/2" : "md:w-1/2"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground,#1e293b)] mb-4">
            {props.headline}
          </h2>
          {props.subheadline && (
            <p className="text-lg text-[var(--color-muted,#64748b)] mb-8">
              {props.subheadline}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <a
              href={props.primaryHref}
              className="bg-[var(--color-primary,#6366f1)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {props.primaryCta}
            </a>
            {props.secondaryCta && (
              <a
                href={props.secondaryHref || "#"}
                className="border border-[var(--color-primary,#6366f1)] text-[var(--color-primary,#6366f1)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary,#6366f1)] hover:text-white transition"
              >
                {props.secondaryCta}
              </a>
            )}
          </div>
        </div>
        {imagePosition === "right" && (
          <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-xl overflow-hidden">
            {props.image ? (
              <Image
                src={props.image}
                alt="CTA"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <Image
                src="/placeholders/hero-placeholder.svg"
                alt="CTA"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
