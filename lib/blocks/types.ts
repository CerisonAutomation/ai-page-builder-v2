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
  HeaderBlock: {
    logo?: string;
    logoAlt?: string;
    navItems: Array<{ label: string; href: string; isExternal?: boolean }>;
    ctaLabel?: string;
    ctaHref?: string;
    sticky?: boolean;
    transparentBg?: boolean;
    mobileBreakpoint?: number;
  };
  FooterBlock: {
    logo?: string;
    logoAlt?: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    copyright?: string;
    socialLinks: Array<{ platform: string; url: string }>;
    newsletterCta?: boolean;
    newsletterPlaceholder?: string;
  };
  CTAWithImageBlock: {
    headline: string;
    subheadline?: string;
    image?: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta?: string;
    secondaryHref?: string;
    imagePosition?: "left" | "right";
    bgColor?: string;
  };
  HeroVideoBlock: {
    videoUrl: string;
    fallbackImage?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    headline?: string;
    subheadline?: string;
  };
  LogoGalleryBlock: {
    logos: Array<{ image: string; alt: string; href?: string }>;
    columns?: number;
    grayscale?: boolean;
    carouselMode?: boolean;
  };
  StatsCounterBlock: {
    stats: Array<{
      value: number;
      label: string;
      icon?: string;
      prefix?: string;
      suffix?: string;
    }>;
    animated?: boolean;
    columns?: number;
    bgColor?: string;
  };
  TestimonialsCarouselBlock: {
    testimonials: Array<{
      text: string;
      author: string;
      role?: string;
      avatar?: string;
      rating?: number;
    }>;
    autoplay?: boolean;
    layout?: "card" | "minimal" | "full";
    showRating?: boolean;
  };
  PropertiesGridBlock: {
    properties: Array<{
      image?: string;
      title: string;
      price: string;
      beds?: number;
      baths?: number;
      sqft?: number;
      location?: string;
    }>;
    columns?: number;
    showDetails?: boolean;
    cardVariant?: "standard" | "compact";
  };
  ServicesGridBlock: {
    services: Array<{
      icon?: string;
      title: string;
      description: string;
      image?: string;
      href?: string;
    }>;
    columns?: number;
    layout?: "card" | "list";
    iconColor?: string;
  };
};
