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
      <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>
      <div className={`grid ${colsClass} gap-8`}>
        {props.cards.map((card, i) => (
          <a key={i} href={card.href} className="group">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold mb-2 group-hover:text-indigo-600">
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm">{card.body}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
