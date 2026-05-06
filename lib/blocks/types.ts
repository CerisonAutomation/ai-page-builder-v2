/**
 * Shared block prop types — imported by each block module and by puck/config.ts
 */
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
