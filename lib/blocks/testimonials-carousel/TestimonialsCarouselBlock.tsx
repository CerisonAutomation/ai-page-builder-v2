"use client";

import Image from "next/image";
import type { AllBlockProps } from "../types";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export function TestimonialsCarouselBlock(props: AllBlockProps["TestimonialsCarouselBlock"]) {
  const [current, setCurrent] = useState(0);
  const testimonials = props.testimonials;

  useEffect(() => {
    if (!props.autoplay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [props.autoplay, testimonials.length]);

  const layout = props.layout || "card";

  return (
    <div className="w-full py-16 px-4 bg-[var(--color-background,#f8fafc)]">
      <div className="max-w-4xl mx-auto">
        {layout === "card" && (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex gap-1 mb-4">
              {props.showRating !== false && [...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < (testimonials[current].rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-lg md:text-xl text-[var(--color-foreground,#1e293b)] mb-6 italic">
              &ldquo;{testimonials[current].text}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              {testimonials[current].avatar ? (
                <Image
                  src={testimonials[current].avatar}
                  alt={testimonials[current].author}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <Image
                  src="/placeholders/avatar-placeholder.svg"
                  alt={testimonials[current].author}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-[var(--color-foreground,#1e293b)]">{testimonials[current].author}</p>
                {testimonials[current].role && (
                  <p className="text-sm text-[var(--color-muted,#64748b)]">{testimonials[current].role}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {layout === "minimal" && (
          <div className="text-center">
            <p className="text-xl md:text-2xl text-[var(--color-foreground,#1e293b)] mb-6 italic">
              &ldquo;{testimonials[current].text}&rdquo;
            </p>
            <p className="font-semibold">{testimonials[current].author}</p>
          </div>
        )}
        {layout === "full" && (
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow">
                <p className="mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={t.avatar || "/placeholders/avatar-placeholder.svg"}
                    alt={t.author}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{t.author}</p>
                    {t.role && <p className="text-sm text-[var(--color-muted,#64748b)]">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {layout !== "full" && testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full ${i === current ? "bg-[var(--color-primary,#6366f1)]" : "bg-gray-300"}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
