"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";
import { ArrowRight } from "lucide-react";

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};

export function ServicesGridBlock(props: AllBlockProps["ServicesGridBlock"]) {
  const cols = Math.min(props.columns || 3, 6);
  const colsClass = gridColsMap[cols] || "grid-cols-3";
  const iconColor = props.iconColor || "var(--color-primary, #6366f1)";

  if (props.layout === "list") {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {props.services.map((service, i) => (
            <a key={i} href={service.href || "#"} className="flex gap-6 items-start p-4 rounded-lg hover:bg-[var(--color-background,#f8fafc)] transition group">
              {service.image ? (
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={service.image} alt={service.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: iconColor + "20", color: iconColor }}>
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg mb-1 text-[var(--color-foreground,#1e293b)] group-hover:text-[var(--color-primary,#6366f1)]">{service.title}</h3>
                <p className="text-[var(--color-muted,#64748b)]">{service.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-4">
      <div className={`grid ${colsClass} gap-6`}>
        {props.services.map((service, i) => (
              <a
                key={i}
                href={service.href || "#"}
                className="group p-6 rounded-xl shadow hover:shadow-lg transition text-center"
                style={{ backgroundColor: 'var(--color-bg, #ffffff)', borderRadius: 'var(--border-radius, 0.5rem)' }}
              >
            {service.image ? (
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition" />
              </div>
            ) : (
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-lg" style={{ backgroundColor: iconColor + "20", color: iconColor }}>
                <ArrowRight className="w-6 h-6" />
              </div>
            )}
            <h3 className="font-semibold text-lg mb-2 text-[var(--color-foreground,#1e293b)] group-hover:text-[var(--color-primary,#6366f1)]">{service.title}</h3>
            <p className="text-sm text-[var(--color-muted,#64748b)]">{service.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
