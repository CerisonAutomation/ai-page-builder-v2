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
export { CTAWithImageBlock, ctaWithImageBlockFields, ctaWithImageBlockDefaultProps } from "./cta";

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

// Header
export { HeaderBlock, headerBlockFields, headerBlockDefaultProps } from "./header";

// Footer
export { FooterBlock, footerBlockFields, footerBlockDefaultProps } from "./footer";

// Hero Video
export { HeroVideoBlock, heroVideoBlockFields, heroVideoBlockDefaultProps } from "./image";

// Logo Gallery
export { LogoGalleryBlock, logoGalleryBlockFields, logoGalleryBlockDefaultProps } from "./logo";

// Stats Counter
export { StatsCounterBlock, statsCounterBlockFields, statsCounterBlockDefaultProps } from "./stats-counter";

// Testimonials Carousel
export { TestimonialsCarouselBlock, testimonialsCarouselBlockFields, testimonialsCarouselBlockDefaultProps } from "./testimonials-carousel";

// Properties Grid
export { PropertiesGridBlock, propertiesGridBlockFields, propertiesGridBlockDefaultProps } from "./properties";

// Services Grid
export { ServicesGridBlock, servicesGridBlockFields, servicesGridBlockDefaultProps } from "./services";
