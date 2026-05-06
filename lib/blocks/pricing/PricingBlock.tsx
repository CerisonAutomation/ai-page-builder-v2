import type { AllBlockProps } from "../types";

export function PricingBlock(props: AllBlockProps["PricingBlock"]) {
  return (
    <div className="w-full py-16 px-4">
      {props.title && (
        <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>
      )}
      <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
        {props.plans.map((plan, i) => (
          <div
            key={i}
            className={`p-8 border rounded-lg ${
              plan.highlighted ? "border-indigo-600 shadow-lg scale-105" : ""
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              {plan.price}
            </div>
            <ul className="space-y-2 mb-6 text-sm text-slate-600">
              {plan.features.map((f, j) => (
                <li key={j}>✓ {f}</li>
              ))}
            </ul>
            <a
              href={plan.ctaHref}
              className="block text-center bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700"
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
