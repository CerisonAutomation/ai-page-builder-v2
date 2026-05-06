import type { AllBlockProps } from "../types";

export function TestimonialBlock(props: AllBlockProps["TestimonialBlock"]) {
  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: 'var(--color-background, #f8fafc)' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {props.quotes.map((q, i) => (
          <div key={i} className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-bg, #ffffff)', borderRadius: 'var(--border-radius, 0.5rem)' }}>
            <p className="italic mb-4" style={{ color: 'var(--color-muted, #64748b)' }}>"{q.text}"</p>
            <div className="flex items-center gap-3">
              {q.avatar && (
                <img
                  src={q.avatar}
                  alt={q.author}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground, #1e293b)' }}>{q.author}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted, #64748b)' }}>{q.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
