import type { AllBlockProps } from "../types";

export const headerBlockFields = {
  logo: { type: "text", label: "Logo Image URL" },
  logoAlt: { type: "text", label: "Logo Alt Text" },
  navItems: {
    type: "array",
    label: "Navigation Items",
    arrayFields: {
      label: { type: "text", label: "Label" },
      href: { type: "text", label: "Link URL" },
      isExternal: { type: "select", label: "External Link?", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
    },
  },
  ctaLabel: { type: "text", label: "CTA Button Text" },
  ctaHref: { type: "text", label: "CTA Link URL" },
  sticky: { type: "select", label: "Sticky on Scroll", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  transparentBg: { type: "select", label: "Transparent Background", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  mobileBreakpoint: { type: "number", label: "Mobile Menu Breakpoint (px)", min: 320, max: 1280 },
};

export const headerBlockDefaultProps: AllBlockProps["HeaderBlock"] = {
  navItems: [
    { label: "Home", href: "/", isExternal: false },
    { label: "About", href: "/about", isExternal: false },
    { label: "Contact", href: "/contact", isExternal: false },
  ],
  ctaLabel: "Get Started",
  ctaHref: "/",
  sticky: false,
  transparentBg: false,
  mobileBreakpoint: 768,
};
