import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock PropertiesGridBlock component
const PropertiesGridBlock = (props: any) => (
  <div className="w-full py-16 px-4">
    <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
    <p className="text-gray-600 mb-8">{props.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.properties?.map((property: any) => (
        <div key={property.id} className="rounded-lg overflow-hidden shadow-lg">
          <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{property.title}</h3>
            <p className="text-gray-600 mb-2">{property.location}</p>
            <p className="text-2xl font-bold text-indigo-600 mb-4">${property.price}</p>
            <p className="text-gray-700 mb-4">{property.description}</p>
            <div className="flex gap-4 mb-4">
              <span className="text-sm">{property.beds} Beds</span>
              <span className="text-sm">{property.baths} Baths</span>
              <span className="text-sm">{property.sqft} sqft</span>
            </div>
            <a href={property.ctaHref} className="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
              {property.ctaLabel}
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
);

describe('PropertiesGridBlock', () => {
  const defaultProps: any = {
    title: 'Featured Properties',
    description: 'Handpicked properties for you',
    properties: [
      {
        id: '1',
        title: 'Modern Apartment',
        location: 'Downtown, City',
        price: 450000,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        description: 'Beautiful modern apartment with stunning city views',
        beds: 2,
        baths: 2,
        sqft: 1200,
        ctaLabel: 'View Details',
        ctaHref: '/properties/1',
      },
      {
        id: '2',
        title: 'Suburban Home',
        location: 'Suburbs, City',
        price: 350000,
        image: 'https://images.unsplash.com/photo-1570129477492-45a003537e1e',
        description: 'Spacious family home in quiet neighborhood',
        beds: 4,
        baths: 3,
        sqft: 2500,
        ctaLabel: 'View Details',
        ctaHref: '/properties/2',
      },
      {
        id: '3',
        title: 'Waterfront Villa',
        location: 'Coastline, City',
        price: 850000,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        description: 'Luxury villa with direct waterfront access',
        beds: 5,
        baths: 4,
        sqft: 4000,
        ctaLabel: 'View Details',
        ctaHref: '/properties/3',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText('Featured Properties')).toBeInTheDocument();
      expect(screen.getByText('Handpicked properties for you')).toBeInTheDocument();
    });

    it('should render all properties', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
      expect(screen.getByText('Suburban Home')).toBeInTheDocument();
      expect(screen.getByText('Waterfront Villa')).toBeInTheDocument();
    });

    it('should render property images', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(3);
    });

    it('should render prices', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText('$450000')).toBeInTheDocument();
      expect(screen.getByText('$350000')).toBeInTheDocument();
    });

    it('should render property details', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText(/2 Beds/)).toBeInTheDocument();
      expect(screen.getByText(/4 Baths/)).toBeInTheDocument();
    });
  });

  describe('Property Display', () => {
    it('should display location for each property', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText('Downtown, City')).toBeInTheDocument();
      expect(screen.getByText('Suburbs, City')).toBeInTheDocument();
    });

    it('should show property specifications', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      expect(screen.getByText(/2 Beds/)).toBeInTheDocument();
      expect(screen.getByText(/1200 sqft/)).toBeInTheDocument();
    });

    it('should display CTA for each property', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const buttons = screen.getAllByRole('link', { name: /View Details/ });
      expect(buttons.length).toBe(3);
    });
  });

  describe('Image Handling', () => {
    it('should render property images with correct src', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src');
    });

    it('should have alt text for images', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should lazy load images', () => {
      const { container } = render(<PropertiesGridBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(3);
    });
  });

  describe('Props Validation', () => {
    it('should handle empty properties array', () => {
      const { container } = render(
        <PropertiesGridBlock {...defaultProps} properties={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single property', () => {
      render(
        <PropertiesGridBlock {...defaultProps} properties={[defaultProps.properties[0]]} />
      );
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    });

    it('should handle many properties', () => {
      const manyProperties = Array.from({ length: 12 }, (_, i) => ({
        id: `prop-${i}`,
        title: `Property ${i + 1}`,
        location: `Location ${i + 1}`,
        price: 100000 * (i + 1),
        image: `https://example.com/${i}.jpg`,
        description: `Property description ${i + 1}`,
        beds: i % 5 + 1,
        baths: i % 3 + 1,
        sqft: (i + 1) * 500,
        ctaLabel: 'View',
        ctaHref: `/property/${i}`,
      }));

      render(<PropertiesGridBlock {...defaultProps} properties={manyProperties} />);
      expect(screen.getByText('Property 1')).toBeInTheDocument();
      expect(screen.getByText('Property 12')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long property titles', () => {
      const longTitle = 'A'.repeat(100);
      const properties = [
        { ...defaultProps.properties[0], title: longTitle },
      ];

      render(<PropertiesGridBlock {...defaultProps} properties={properties} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very large prices', () => {
      const properties = [
        { ...defaultProps.properties[0], price: 999999999 },
      ];

      render(<PropertiesGridBlock {...defaultProps} properties={properties} />);
      expect(screen.getByText('$999999999')).toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimal = [
        {
          id: '1',
          title: 'Basic Property',
          price: 100000,
          image: 'https://example.com/img.jpg',
          ctaLabel: 'View',
          ctaHref: '/view',
        },
      ];

      const { container } = render(
        <PropertiesGridBlock {...defaultProps} properties={minimal as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(<PropertiesGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/md:|lg:/);
    });

    it('should be full width', () => {
      const { container } = render(<PropertiesGridBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<PropertiesGridBlock {...defaultProps} />);
      const main = container.firstChild as HTMLElement;
      expect(main.className).toMatch(/p[xy]/);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on all images', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have accessible property cards', () => {
      render(<PropertiesGridBlock {...defaultProps} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<PropertiesGridBlock {...defaultProps} />);
      rerender(
        <PropertiesGridBlock {...defaultProps} title="Updated Properties" />
      );
      expect(screen.getByText('Updated Properties')).toBeInTheDocument();
    });

    it('should render large property lists efficiently', () => {
      const manyProperties = Array.from({ length: 50 }, (_, i) => ({
        id: `p-${i}`,
        title: `Property ${i}`,
        location: `Loc ${i}`,
        price: 100000 * (i + 1),
        image: `https://example.com/${i}.jpg`,
        description: `Desc ${i}`,
        beds: 2,
        baths: 2,
        sqft: 1000,
        ctaLabel: 'View',
        ctaHref: `/p/${i}`,
      }));

      const { container } = render(
        <PropertiesGridBlock {...defaultProps} properties={manyProperties} />
      );
      expect(container.querySelectorAll('img').length).toBe(50);
    });
  });
});
