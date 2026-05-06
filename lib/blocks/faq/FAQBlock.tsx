import type { AllBlockProps } from "../types";

export function FAQBlock(props: AllBlockProps["FAQBlock"]) {
  return (
    <div className="w-full py-16 px-4 max-w-3xl mx-auto">
      {props.title && (
        <h2 className="text-3xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.title}</h2>
      )}
      <div className="space-y-4">
        {props.items.map((item, i) => (
          <details key={i} className="border rounded-lg p-4 cursor-pointer group" style={{ borderColor: 'var(--color-border, #e5e7eb)', borderRadius: 'var(--border-radius, 0.5rem)' }}>
            <summary className="font-semibold" style={{ color: 'var(--color-foreground, #1e293b)' }}>
              {item.question}
            </summary>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted, #64748b)' }}>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
