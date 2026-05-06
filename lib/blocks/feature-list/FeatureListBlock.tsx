import type { AllBlockProps } from "../types";

export function FeatureListBlock(props: AllBlockProps["FeatureListBlock"]) {
  return (
    <div className="w-full py-16 px-4">
      <div className="space-y-8">
        {props.features.map((f, i) => (
          <div key={i} className="flex gap-4">
            <div className="text-2xl">{f.icon}</div>
            <div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-muted, #64748b)' }}>{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
