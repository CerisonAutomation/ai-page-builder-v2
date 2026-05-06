import type { AllBlockProps } from "../types";

export function StatsBlock(props: AllBlockProps["StatsBlock"]) {
  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: 'var(--color-background, #f8fafc)' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {props.stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary, #6366f1)' }}>
              {s.value}
              {s.unit}
            </div>
            <p style={{ color: 'var(--color-muted, #64748b)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
