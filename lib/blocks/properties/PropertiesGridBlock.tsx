"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";
import { Bed, Bath, Square } from "lucide-react";

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};

export function PropertiesGridBlock(props: AllBlockProps["PropertiesGridBlock"]) {
  const cols = Math.min(props.columns || 3, 6);
  const colsClass = gridColsMap[cols] || "grid-cols-3";
  const variant = props.cardVariant || "standard";

  return (
    <div className="w-full py-12 px-4">
      <div className={`grid ${colsClass} gap-6`}>
        {props.properties.map((prop, i) => (
          <div key={i} className={`rounded-xl overflow-hidden shadow-lg ${variant === "compact" ? "text-sm" : ""}`} style={{ backgroundColor: 'var(--color-bg, #ffffff)', borderRadius: 'var(--border-radius, 0.5rem)' }}>
            <div className={`relative ${variant === "compact" ? "h-40" : "h-56"}`}>
              {prop.image ? (
                <Image
                  src={prop.image}
                  alt={prop.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/placeholders/property-placeholder.svg"
                  alt={prop.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-[var(--color-foreground,#1e293b)]">{prop.title}</h3>
              {prop.location && (
                <p className="text-sm text-[var(--color-muted,#64748b)] mb-2">{prop.location}</p>
              )}
              <p className="text-xl font-bold text-[var(--color-primary,#6366f1)] mb-3">{prop.price}</p>
              {props.showDetails !== false && (
                <div className="flex gap-4 text-sm text-[var(--color-muted,#64748b)]">
                  {prop.beds !== undefined && (
                    <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {prop.beds}</span>
                  )}
                  {prop.baths !== undefined && (
                    <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {prop.baths}</span>
                  )}
                  {prop.sqft !== undefined && (
                    <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {prop.sqft} sqft</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
