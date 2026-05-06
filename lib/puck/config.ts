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
  CTAWithImageBlock,
  ctaWithImageBlockFields,
  ctaWithImageBlockDefaultProps,
  FAQBlock,
  faqFields,
  faqDefaultProps,
  PricingBlock,
  pricingFields,
  pricingDefaultProps,
  TestimonialBlock,
  testimonialFields,
  testimonialDefaultProps,
  TestimonialsCarouselBlock,
  testimonialsCarouselBlockFields,
  testimonialsCarouselBlockDefaultProps,
  TimelineBlock,
  timelineFields,
  timelineDefaultProps,
  GalleryBlock,
  galleryFields,
  galleryDefaultProps,
  LogoGalleryBlock,
  logoGalleryBlockFields,
  logoGalleryBlockDefaultProps,
  HeaderBlock,
  headerBlockFields,
  headerBlockDefaultProps,
  FooterBlock,
  footerBlockFields,
  footerBlockDefaultProps,
  HeroVideoBlock,
  heroVideoBlockFields,
  heroVideoBlockDefaultProps,
  StatsCounterBlock,
  statsCounterBlockFields,
  statsCounterBlockDefaultProps,
  PropertiesGridBlock,
  propertiesGridBlockFields,
  propertiesGridBlockDefaultProps,
  ServicesGridBlock,
  servicesGridBlockFields,
  servicesGridBlockDefaultProps,
} from "@/lib/blocks";

// Custom field resolver to use ImagePickerField for image fields
// Note: Puck doesn't support JSX in field definitions directly
// We'll use a simpler approach - just export the fields as-is
// The ImagePickerField can be used manually in custom components
function resolveFields(fields: any) {
  return fields;
}

// Re-export AllBlockProps for backwards compatibility
export type { AllBlockProps };

// ✅ PUCK CONFIG
export const puckConfig: Config<AllBlockProps> = {
  categories: {
    "Page Sections": {
      components: ["HeroBlock", "HeaderBlock", "FooterBlock", "HeroVideoBlock"],
    },
    "Call to Action": {
      components: ["CTABlock", "CTAWithImageBlock"],
    },
    Content: {
      components: ["CardGridBlock", "FeatureListBlock", "FAQBlock", "TimelineBlock", "ServicesGridBlock"],
    },
    "Social Proof": {
      components: ["StatsBlock", "StatsCounterBlock", "TestimonialBlock", "TestimonialsCarouselBlock", "LogoGalleryBlock"],
    },
    Commerce: {
      components: ["PricingBlock", "PropertiesGridBlock"],
    },
    Media: {
      components: ["GalleryBlock"],
    },
  },
  components: {
    HeroBlock: {
      label: "Hero",
      fields: resolveFields(heroBlockFields),
      defaultProps: heroBlockDefaultProps,
      render: HeroBlock,
    },
    HeaderBlock: {
      label: "Header",
      fields: resolveFields(headerBlockFields),
      defaultProps: headerBlockDefaultProps,
      render: HeaderBlock,
    },
    FooterBlock: {
      label: "Footer",
      fields: resolveFields(footerBlockFields),
      defaultProps: footerBlockDefaultProps,
      render: FooterBlock,
    },
    HeroVideoBlock: {
      label: "Hero Video",
      fields: heroVideoBlockFields,
      defaultProps: heroVideoBlockDefaultProps,
      render: HeroVideoBlock,
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
    StatsCounterBlock: {
      label: "Stats Counter",
      fields: statsCounterBlockFields,
      defaultProps: statsCounterBlockDefaultProps,
      render: StatsCounterBlock,
    },
    CTABlock: {
      label: "Call to Action",
      fields: ctaFields,
      defaultProps: ctaDefaultProps,
      render: CTABlock,
    },
    CTAWithImageBlock: {
      label: "CTA with Image",
      fields: resolveFields(ctaWithImageBlockFields),
      defaultProps: ctaWithImageBlockDefaultProps,
      render: CTAWithImageBlock,
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
    TestimonialsCarouselBlock: {
      label: "Testimonials Carousel",
      fields: testimonialsCarouselBlockFields,
      defaultProps: testimonialsCarouselBlockDefaultProps,
      render: TestimonialsCarouselBlock,
    },
    TimelineBlock: {
      label: "Timeline",
      fields: timelineFields,
      defaultProps: timelineDefaultProps,
      render: TimelineBlock,
    },
    GalleryBlock: {
      label: "Gallery",
      fields: resolveFields(galleryFields),
      defaultProps: galleryDefaultProps,
      render: GalleryBlock,
    },
    LogoGalleryBlock: {
      label: "Logo Gallery",
      fields: resolveFields(logoGalleryBlockFields),
      defaultProps: logoGalleryBlockDefaultProps,
      render: LogoGalleryBlock,
    },
    PropertiesGridBlock: {
      label: "Properties Grid",
      fields: propertiesGridBlockFields,
      defaultProps: propertiesGridBlockDefaultProps,
      render: PropertiesGridBlock,
    },
    ServicesGridBlock: {
      label: "Services Grid",
      fields: servicesGridBlockFields,
      defaultProps: servicesGridBlockDefaultProps,
      render: ServicesGridBlock,
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
