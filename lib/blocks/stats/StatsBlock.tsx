import type { AllBlockProps } from "../types";

export function StatsBlock(props: AllBlockProps["StatsBlock"]) {
  return (
    <div className="w-full bg-slate-50 py-16 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {props.stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {s.value}
              {s.unit}
            </div>
            <p className="text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
