import type { Config, Data } from "@measured/puck";
import {
  type AllBlockProps,
  HeroBlock,
  heroBlockFields,
  heroBlockDefaultProps,
  CardGridBlock,
  cardGridFields,
  cardGridDefaultProps,
  FeatureListBlock,
  featureListFields,
  featureListDefaultProps,
  StatsBlock,
  statsFields,
  statsDefaultProps,
  CTABlock,
  ctaFields,
  ctaDefaultProps,
  FAQBlock,
  faqFields,
  faqDefaultProps,
  PricingBlock,
  pricingFields,
  pricingDefaultProps,
  TestimonialBlock,
  testimonialFields,
  testimonialDefaultProps,
  TimelineBlock,
  timelineFields,
  timelineDefaultProps,
  GalleryBlock,
  galleryFields,
  galleryDefaultProps,
} from "@/lib/blocks";

// Re-export AllBlockProps for backwards compatibility
export type { AllBlockProps };

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
      defaultProps: heroBlockDefaultProps,
      render: HeroBlock,
    },
    CardGridBlock: {
      label: "Card Grid",
      fields: cardGridFields,
      defaultProps: cardGridDefaultProps,
      render: CardGridBlock,
    },
    FeatureListBlock: {
      label: "Feature List",
      fields: featureListFields,
      defaultProps: featureListDefaultProps,
      render: FeatureListBlock,
    },
    StatsBlock: {
      label: "Stats",
      fields: statsFields,
      defaultProps: statsDefaultProps,
      render: StatsBlock,
    },
    CTABlock: {
      label: "Call to Action",
      fields: ctaFields,
      defaultProps: ctaDefaultProps,
      render: CTABlock,
    },
    FAQBlock: {
      label: "FAQ",
      fields: faqFields,
      defaultProps: faqDefaultProps,
      render: FAQBlock,
    },
    PricingBlock: {
      label: "Pricing",
      fields: pricingFields,
      defaultProps: pricingDefaultProps,
      render: PricingBlock,
    },
    TestimonialBlock: {
      label: "Testimonials",
      fields: testimonialFields,
      defaultProps: testimonialDefaultProps,
      render: TestimonialBlock,
    },
    TimelineBlock: {
      label: "Timeline",
      fields: timelineFields,
      defaultProps: timelineDefaultProps,
      render: TimelineBlock,
    },
    GalleryBlock: {
      label: "Gallery",
      fields: galleryFields,
      defaultProps: galleryDefaultProps,
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
  zones: {},
};

// ✅ BLOCK NAMES (for validation)
export const AVAILABLE_BLOCKS = Object.keys(puckConfig.components) as Array<
  keyof typeof puckConfig.components
>;
