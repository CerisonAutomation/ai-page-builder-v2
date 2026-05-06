import type { AllBlockProps } from "../types";

export function PricingBlock(props: AllBlockProps["PricingBlock"]) {
  return (
    <div className="w-full py-16 px-4">
      {props.title && (
        <h2 className="text-3xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {props.plans.map((plan, i) => (
          <div
            key={i}
            className="p-8 border rounded-lg"
            style={{
              borderColor: plan.highlighted ? 'var(--color-primary, #6366f1)' : 'var(--color-border, #e5e7eb)',
              boxShadow: plan.highlighted ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
              transform: plan.highlighted ? 'scale(1.05)' : 'none',
              borderRadius: 'var(--border-radius, 0.5rem)',
            }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{plan.name}</h3>
            <div className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary, #6366f1)' }}>
              {plan.price}
            </div>
            <ul className="space-y-2 mb-6 text-sm" style={{ color: 'var(--color-muted, #64748b)' }}>
              {plan.features.map((f, j) => (
                <li key={j}>✓ {f}</li>
              ))}
            </ul>
            <a
              href={plan.ctaHref}
              className="block text-center font-bold py-2 rounded"
              style={{
                backgroundColor: 'var(--color-primary, #6366f1)',
                color: 'var(--color-bg, #ffffff)',
                borderRadius: 'var(--border-radius, 0.5rem)',
              }}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
