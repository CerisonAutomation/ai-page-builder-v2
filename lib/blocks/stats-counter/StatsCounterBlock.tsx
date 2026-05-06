"use client";

import type { AllBlockProps } from "../types";
import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

function AnimatedNumber({ value, prefix, suffix, animated }: { value: number; prefix?: string; suffix?: string; animated?: boolean }) {
  const [count, setCount] = useState(animated ? 0 : value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animated) return;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, animated]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};

export function StatsCounterBlock(props: AllBlockProps["StatsCounterBlock"]) {
  const cols = Math.min(props.columns || 4, 6);
  const colsClass = gridColsMap[cols] || "grid-cols-4";

  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: props.bgColor || "var(--color-background, #f8fafc)" }}>
      <div className={`max-w-6xl mx-auto grid ${colsClass} gap-8`}>
        {props.stats.map((stat, i) => (
          <div key={i} className="text-center">
            {stat.icon && <div className="mb-3 text-[var(--color-primary,#6366f1)]"><TrendingUp className="w-8 h-8 mx-auto" /></div>}
            <div className="text-4xl md:text-5xl font-bold text-[var(--color-foreground,#1e293b)] mb-2">
              <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} animated={props.animated} />
            </div>
            <p className="text-[var(--color-muted,#64748b)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
