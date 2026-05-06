/**
 * Block Registry — aggregates all block modules into a single map.
 * Import block components and field definitions from here.
 */

export type { AllBlockProps } from "./types";

// Hero
export { HeroBlock, heroBlockFields, heroBlockDefaultProps } from "./hero";

// Card Grid
export {
  CardGridBlock,
  cardGridFields,
  cardGridDefaultProps,
} from "./card-grid";

// Feature List
export {
  FeatureListBlock,
  featureListFields,
  featureListDefaultProps,
} from "./feature-list";

// Stats
export { StatsBlock, statsFields, statsDefaultProps } from "./stats";

// CTA
export { CTABlock, ctaFields, ctaDefaultProps } from "./cta";

// FAQ
export { FAQBlock, faqFields, faqDefaultProps } from "./faq";

// Pricing
export { PricingBlock, pricingFields, pricingDefaultProps } from "./pricing";

// Testimonial
export {
  TestimonialBlock,
  testimonialFields,
  testimonialDefaultProps,
} from "./testimonial";

// Timeline
export { TimelineBlock, timelineFields, timelineDefaultProps } from "./timeline";

// Gallery
export { GalleryBlock, galleryFields, galleryDefaultProps } from "./gallery";
