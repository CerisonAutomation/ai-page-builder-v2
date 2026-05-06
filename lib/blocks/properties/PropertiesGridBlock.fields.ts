import type { AllBlockProps } from "../types";

export const propertiesGridBlockFields = {
  properties: {
    type: "array",
    label: "Properties",
    arrayFields: {
      image: { type: "text", label: "Property Image URL" },
      title: { type: "text", label: "Title" },
      price: { type: "text", label: "Price" },
      beds: { type: "number", label: "Bedrooms" },
      baths: { type: "number", label: "Bathrooms" },
      sqft: { type: "number", label: "Square Feet" },
      location: { type: "text", label: "Location" },
    },
  },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  showDetails: { type: "select", label: "Show Details (Beds/Baths/Sqft)", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  cardVariant: {
    type: "select",
    label: "Card Variant",
    options: [
      { label: "Standard", value: "standard" },
      { label: "Compact", value: "compact" },
    ],
  },
};

export const propertiesGridBlockDefaultProps: AllBlockProps["PropertiesGridBlock"] = {
  properties: [
    { title: "Modern Villa", price: "$1,200,000", beds: 4, baths: 3, sqft: 2800, location: "Beverly Hills, CA", image: "/placeholders/property-placeholder.svg" },
    { title: "City Apartment", price: "$450,000", beds: 2, baths: 1, sqft: 1200, location: "Downtown, NY", image: "/placeholders/property-placeholder.svg" },
    { title: "Suburban House", price: "$750,000", beds: 3, baths: 2, sqft: 2000, location: "Austin, TX", image: "/placeholders/property-placeholder.svg" },
  ],
  columns: 3,
  showDetails: true,
  cardVariant: "standard",
};
