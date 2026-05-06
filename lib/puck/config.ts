import type { Config, Data, FieldDef } from "@measured/puck";

// ✅ TYPE-SAFE BLOCK PROPS
export type AllBlockProps = {
  HeroBlock: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaHref: string;
    bgImage?: string;
    bgColor?: string;
  };
  CardGridBlock: {
    title: string;
    cards: Array<{
      title: string;
      body: string;
      icon: string;
      href: string;
    }>;
    columns?: number;
  };
  FeatureListBlock: {
    features: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  StatsBlock: {
    stats: Array<{
      label: string;
      value: string;
      unit?: string;
    }>;
  };
  CTABlock: {
    headline: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta?: string;
    secondaryHref?: string;
  };
  FAQBlock: {
    title?: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  PricingBlock: {
    title?: string;
    plans: Array<{
      name: string;
      price: string;
      features: string[];
      cta: string;
      ctaHref: string;
      highlighted?: boolean;
    }>;
  };
  TestimonialBlock: {
    quotes: Array<{
      text: string;
      author: string;
      role: string;
      avatar?: string;
    }>;
  };
  TimelineBlock: {
    events: Array<{
      date: string;
      title: string;
      body: string;
    }>;
  };
  GalleryBlock: {
    images: string[];
    columns?: number;
    gap?: number;
  };
};

// ✅ FIELD DEFINITIONS (no repeat)
const heroBlockFields: FieldDef = {
  headline: { type: "text", label: "Headline" },
  subheadline: { type: "textarea", label: "Subheadline" },
  ctaLabel: { type: "text", label: "CTA Button Text" },
  ctaHref: { type: "text", label: "CTA Link" },
  bgImage: { type: "text", label: "Background Image URL (optional)" },
  bgColor: { type: "text", label: "Background Color" },
};

const cardGridFields: FieldDef = {
  title: { type: "text", label: "Section Title" },
  columns: { type: "number", label: "Columns", min: 1, max: 4 },
  cards: {
    type: "array",
    label: "Cards",
    arrayFields: {
      title: { type: "text", label: "Title" },
      body: { type: "textarea", label: "Description" },
      icon: { type: "text", label: "Icon (lucide name)" },
      href: { type: "text", label: "Link" },
    },
  },
};

const featureListFields: FieldDef = {
  features: {
    type: "array",
    label: "Features",
    arrayFields: {
      icon: { type: "text", label: "Icon (lucide name)" },
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    },
  },
};

const statsFields: FieldDef = {
  stats: {
    type: "array",
    label: "Statistics",
    arrayFields: {
      value: { type: "text", label: "Number/Value" },
      label: { type: "text", label: "Label" },
      unit: { type: "text", label: "Unit (e.g., %, M, K)" },
    },
  },
};

const ctaFields: FieldDef = {
  headline: { type: "text", label: "Headline" },
  body: { type: "textarea", label: "Body" },
  primaryCta: { type: "text", label: "Primary Button Text" },
  primaryHref: { type: "text", label: "Primary Button Link" },
  secondaryCta: { type: "text", label: "Secondary Button Text (optional)" },
  secondaryHref: { type: "text", label: "Secondary Button Link" },
};

const faqFields: FieldDef = {
  title: { type: "text", label: "Section Title (optional)" },
  items: {
    type: "array",
    label: "FAQ Items",
    arrayFields: {
      question: { type: "text", label: "Question" },
      answer: { type: "textarea", label: "Answer" },
    },
  },
};

const pricingFields: FieldDef = {
  title: { type: "text", label: "Section Title" },
  plans: {
    type: "array",
    label: "Pricing Plans",
    arrayFields: {
      name: { type: "text", label: "Plan Name" },
      price: { type: "text", label: "Price (e.g., $29/mo)" },
      features: {
        type: "array",
        label: "Features",
        arrayFields: { feature: { type: "text", label: "Feature" } },
      },
      cta: { type: "text", label: "Button Text" },
      ctaHref: { type: "text", label: "Button Link" },
      highlighted: { type: "select", options: ["true", "false"], label: "Featured Plan?" },
    },
  },
};

const testimonialFields: FieldDef = {
  quotes: {
    type: "array",
    label: "Testimonials",
    arrayFields: {
      text: { type: "textarea", label: "Quote" },
      author: { type: "text", label: "Author Name" },
      role: { type: "text", label: "Author Role/Company" },
      avatar: { type: "text", label: "Avatar URL (optional)" },
    },
  },
};

const timelineFields: FieldDef = {
  events: {
    type: "array",
    label: "Events",
    arrayFields: {
      date: { type: "text", label: "Date" },
      title: { type: "text", label: "Title" },
      body: { type: "textarea", label: "Description" },
    },
  },
};

const galleryFields: FieldDef = {
  images: {
    type: "array",
    label: "Images",
    arrayFields: { image: { type: "text", label: "Image URL" } },
  },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  gap: { type: "number", label: "Gap (px)", min: 0, max: 16 },
};

// ✅ LOOKUP MAPS FOR DYNAMIC CLASSES (Tailwind will see these at build time)
const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

const gapMap = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
  16: "gap-16",
} as const;

// ✅ STUB RENDERS (import actual components)
const HeroBlock = (props: AllBlockProps["HeroBlock"]) => (
  <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24 px-4">
    <h1 className="text-4xl font-bold mb-2">{props.headline}</h1>
    <p className="text-xl text-slate-300 mb-6">{props.subheadline}</p>
    <a
      href={props.ctaHref}
      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
    >
      {props.ctaLabel}
    </a>
  </div>
);

const CardGridBlock = (props: AllBlockProps["CardGridBlock"]) => {
  const colsClass = gridColsMap[Math.min(props.columns ?? 3, 4) as keyof typeof gridColsMap] || "grid-cols-3";
  
  return (
    <div className="w-full py-16 px-4">
      <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>
      <div className={`grid ${colsClass} gap-8`}>
        {props.cards.map((card, i) => (
          <a key={i} href={card.href} className="group">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold mb-2 group-hover:text-indigo-600">{card.title}</h3>
              <p className="text-slate-600 text-sm">{card.body}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const FeatureListBlock = (props: AllBlockProps["FeatureListBlock"]) => (
  <div className="w-full py-16 px-4">
    <div className="space-y-8">
      {props.features.map((f, i) => (
        <div key={i} className="flex gap-4">
          <div className="text-2xl">{f.icon}</div>
          <div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-slate-600">{f.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsBlock = (props: AllBlockProps["StatsBlock"]) => (
  <div className="w-full bg-slate-50 py-16 px-4">
    <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
      {props.stats.map((s, i) => (
        <div key={i} className="text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">
            {s.value}{s.unit}
          </div>
          <p className="text-slate-600">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const CTABlock = (props: AllBlockProps["CTABlock"]) => (
  <div className="w-full bg-indigo-600 text-white py-16 px-4 text-center">
    <h2 className="text-3xl font-bold mb-4">{props.headline}</h2>
    <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">{props.body}</p>
    <div className="flex gap-4 justify-center">
      <a href={props.primaryHref} className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50">
        {props.primaryCta}
      </a>
    </div>
  </div>
);

const FAQBlock = (props: AllBlockProps["FAQBlock"]) => (
  <div className="w-full py-16 px-4 max-w-3xl mx-auto">
    {props.title && <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>}
    <div className="space-y-4">
      {props.items.map((item, i) => (
        <details key={i} className="border rounded-lg p-4 cursor-pointer group">
          <summary className="font-semibold group-open:text-indigo-600">{item.question}</summary>
          <p className="mt-2 text-slate-600 text-sm">{item.answer}</p>
        </details>
      ))}
    </div>
  </div>
);

const PricingBlock = (props: AllBlockProps["PricingBlock"]) => (
  <div className="w-full py-16 px-4">
    {props.title && <h2 className="text-3xl font-bold mb-12 text-center">{props.title}</h2>}
    <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      {props.plans.map((plan, i) => (
        <div key={i} className={`p-8 border rounded-lg ${plan.highlighted ? "border-indigo-600 shadow-lg scale-105" : ""}`}>
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-4">{plan.price}</div>
          <ul className="space-y-2 mb-6 text-sm text-slate-600">
            {plan.features.map((f, j) => (
              <li key={j}>✓ {typeof f === "string" ? f : f}</li>
            ))}
          </ul>
          <a href={plan.ctaHref} className="block text-center bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700">
            {plan.cta}
          </a>
        </div>
      ))}
    </div>
  </div>
);

const TestimonialBlock = (props: AllBlockProps["TestimonialBlock"]) => (
  <div className="w-full py-16 px-4 bg-slate-50">
    <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      {props.quotes.map((q, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
          <p className="italic text-slate-600 mb-4">"{q.text}"</p>
          <div className="flex items-center gap-3">
            {q.avatar && <img src={q.avatar} alt={q.author} className="w-10 h-10 rounded-full" />}
            <div>
              <p className="font-semibold text-sm">{q.author}</p>
              <p className="text-xs text-slate-500">{q.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineBlock = (props: AllBlockProps["TimelineBlock"]) => (
  <div className="w-full py-16 px-4 max-w-3xl mx-auto">
    {props.events.map((evt, i) => (
      <div key={i} className="mb-8 flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 bg-indigo-600 rounded-full" />
          {i < props.events.length - 1 && <div className="w-0.5 h-16 bg-indigo-200" />}
        </div>
        <div>
          <p className="font-semibold text-indigo-600">{evt.date}</p>
          <h3 className="font-bold">{evt.title}</h3>
          <p className="text-slate-600 text-sm">{evt.body}</p>
        </div>
      </div>
    ))}
  </div>
);

const GalleryBlock = (props: AllBlockProps["GalleryBlock"]) => {
  const colsClass = gridColsMap[Math.min(props.columns ?? 3, 6) as keyof typeof gridColsMap] || "grid-cols-3";
  const gapClass = gapMap[Math.min(props.gap ?? 4, 16) as keyof typeof gapMap] || "gap-4";
  
  return (
    <div className="w-full py-16 px-4">
      <div className={`grid ${colsClass} ${gapClass}`}>
        {props.images.map((img, i) => (
          <img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-lg" />
        ))}
      </div>
    </div>
  );
};

// ✅ PUCK CONFIG
export const puckConfig: Config<AllBlockProps> = {
  categories: {
    "Page Sections": {
      components: ["HeroBlock", "CTABlock"],
    },
    Content: {
      components: ["CardGridBlock", "FeatureListBlock", "FAQBlock", "TimelineBlock"],
    },
    "Social Proof": {
      components: ["StatsBlock", "TestimonialBlock"],
    },
    Commerce: {
      components: ["PricingBlock"],
    },
    Media: {
      components: ["GalleryBlock"],
    },
  },
  components: {
    HeroBlock: {
      label: "Hero",
      fields: heroBlockFields,
      defaultProps: {
        headline: "Your Headline Here",
        subheadline: "Supporting subheadline",
        ctaLabel: "Get Started",
        ctaHref: "/",
        bgColor: "#1e293b",
      },
      render: HeroBlock,
    },
    CardGridBlock: {
      label: "Card Grid",
      fields: cardGridFields,
      defaultProps: {
        title: "Features",
        columns: 3,
        cards: [
          { title: "Feature 1", body: "Description", icon: "✨", href: "/" },
          { title: "Feature 2", body: "Description", icon: "⚡", href: "/" },
          { title: "Feature 3", body: "Description", icon: "🎯", href: "/" },
        ],
      },
      render: CardGridBlock,
    },
    FeatureListBlock: {
      label: "Feature List",
      fields: featureListFields,
      defaultProps: {
        features: [
          { icon: "✓", title: "Feature", description: "Description" },
        ],
      },
      render: FeatureListBlock,
    },
    StatsBlock: {
      label: "Stats",
      fields: statsFields,
      defaultProps: {
        stats: [
          { value: "100", label: "Users", unit: "K" },
          { value: "99.9", label: "Uptime", unit: "%" },
        ],
      },
      render: StatsBlock,
    },
    CTABlock: {
      label: "Call to Action",
      fields: ctaFields,
      defaultProps: {
        headline: "Ready to get started?",
        body: "Description",
        primaryCta: "Start Free",
        primaryHref: "/signup",
      },
      render: CTABlock,
    },
    FAQBlock: {
      label: "FAQ",
      fields: faqFields,
      defaultProps: {
        title: "Frequently Asked Questions",
        items: [{ question: "Q?", answer: "A." }],
      },
      render: FAQBlock,
    },
    PricingBlock: {
      label: "Pricing",
      fields: pricingFields,
      defaultProps: {
        title: "Simple, Transparent Pricing",
        plans: [
          {
            name: "Starter",
            price: "$29",
            features: ["Feature 1", "Feature 2"],
            cta: "Get Started",
            ctaHref: "/signup",
          },
        ],
      },
      render: PricingBlock,
    },
    TestimonialBlock: {
      label: "Testimonials",
      fields: testimonialFields,
      defaultProps: {
        quotes: [
          { text: "Great product!", author: "John", role: "CEO" },
        ],
      },
      render: TestimonialBlock,
    },
    TimelineBlock: {
      label: "Timeline",
      fields: timelineFields,
      defaultProps: {
        events: [{ date: "2024", title: "Launch", body: "Big launch" }],
      },
      render: TimelineBlock,
    },
    GalleryBlock: {
      label: "Gallery",
      fields: galleryFields,
      defaultProps: {
        images: [],
        columns: 3,
        gap: 4,
      },
      render: GalleryBlock,
    },
  },
  root: {
    fields: {
      title: { type: "text", label: "Page Title" },
      description: { type: "textarea", label: "Meta Description" },
    },
  },
};

// ✅ EMPTY PAGE SKELETON
export const emptyPage: Data = {
  content: [],
  root: { props: { title: "New Page", description: "" } },
};

// ✅ BLOCK NAMES (for validation)
export const AVAILABLE_BLOCKS = Object.keys(puckConfig.components) as Array<
  keyof typeof puckConfig.components
>;
