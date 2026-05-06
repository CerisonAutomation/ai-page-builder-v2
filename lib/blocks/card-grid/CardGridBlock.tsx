import type { AllBlockProps } from "../types";

const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

export function CardGridBlock(props: AllBlockProps["CardGridBlock"]) {
  const colsClass =
    gridColsMap[Math.min(props.columns ?? 3, 4) as keyof typeof gridColsMap] ||
    "grid-cols-3";

  return (
    <div className="w-full py-16 px-4">
      <h2 className="text-3xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)' }}>{props.title}</h2>
      <div className={`grid ${colsClass} gap-8`}>
        {props.cards.map((card, i) => (
          <a key={i} href={card.href} className="group">
            <div className="p-6 border rounded-lg transition" style={{ borderColor: 'var(--color-border, #e5e7eb)', borderRadius: 'var(--border-radius, 0.5rem)' }}>
              <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-heading, Montserrat, sans-serif)', color: 'var(--color-foreground, #1e293b)' }}>
                {card.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted, #64748b)' }}>{card.body}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
