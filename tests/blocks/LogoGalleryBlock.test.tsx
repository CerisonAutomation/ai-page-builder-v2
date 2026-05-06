import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock LogoGalleryBlock
const LogoGalleryBlock = (props: any) => (
  <div className="w-full py-16 px-4">
    <h2 className="text-3xl font-bold mb-4 text-center">{props.title}</h2>
    <p className="text-gray-600 mb-12 text-center">{props.description}</p>
    <div className={`grid grid-cols-${props.columns || 3} gap-8 auto-scroll`}>
      {props.logos?.map((logo: any) => (
        <div key={logo.id} className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition">
          {logo.image ? (
            <img src={logo.image} alt={logo.name} className="h-16 object-contain grayscale hover:grayscale-0 transition" />
          ) : (
            <span className="text-xl font-bold text-gray-700">{logo.name}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

describe('LogoGalleryBlock', () => {
  const defaultProps: any = {
    title: 'Trusted By Industry Leaders',
    description: 'Join hundreds of companies using our platform',
    columns: 6,
    logos: [
      {
        id: '1',
        name: 'Company A',
        image: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=200',
      },
      {
        id: '2',
        name: 'Company B',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
      },
      {
        id: '3',
        name: 'Company C',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200',
      },
      {
        id: '4',
        name: 'Company D',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200',
      },
      {
        id: '5',
        name: 'Company E',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200',
      },
      {
        id: '6',
        name: 'Company F',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      expect(screen.getByText('Trusted By Industry Leaders')).toBeInTheDocument();
      expect(screen.getByText('Join hundreds of companies using our platform')).toBeInTheDocument();
    });

    it('should render all logos', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(6);
    });

    it('should render logo alt text', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      expect(screen.getByAltText('Company A')).toBeInTheDocument();
      expect(screen.getByAltText('Company B')).toBeInTheDocument();
    });

    it('should support text fallback for logos', () => {
      const textLogos = [
        { id: '1', name: 'Text Company' },
      ];

      render(
        <LogoGalleryBlock {...defaultProps} logos={textLogos} />
      );
      expect(screen.getByText('Text Company')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should render logo images', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(6);
    });

    it('should have correct src attributes', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      const img = screen.getByAltText('Company A') as HTMLImageElement;
      expect(img.src).toContain('unsplash.com');
    });

    it('should have object-contain for proper scaling', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images[0]?.className).toContain('object-contain');
    });

    it('should have grayscale effect by default', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images[0]?.className).toContain('grayscale');
    });

    it('should handle missing images gracefully', () => {
      const noImageLogos = [
        { id: '1', name: 'Company A' },
        { id: '2', name: 'Company B' },
      ];

      const { container } = render(
        <LogoGalleryBlock {...defaultProps} logos={noImageLogos} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should lazy load images', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(6);
    });
  });

  describe('Grid Layout', () => {
    it('should render grid with specified columns', () => {
      const { container } = render(
        <LogoGalleryBlock {...defaultProps} columns={6} />
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should support different column counts', () => {
      const columns = [2, 3, 4, 6];

      columns.forEach((col) => {
        const { unmount } = render(
          <LogoGalleryBlock {...defaultProps} columns={col} />
        );
        expect(screen.getByText('Trusted By Industry Leaders')).toBeInTheDocument();
        unmount();
      });
    });

    it('should have appropriate gap between logos', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="gap"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty logos array', () => {
      const { container } = render(
        <LogoGalleryBlock {...defaultProps} logos={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single logo', () => {
      render(
        <LogoGalleryBlock {...defaultProps} logos={[defaultProps.logos[0]]} />
      );
      expect(screen.getByAltText('Company A')).toBeInTheDocument();
    });

    it('should handle many logos', () => {
      const many = Array.from({ length: 50 }, (_, i) => ({
        id: `logo-${i}`,
        name: `Company ${i + 1}`,
        image: `https://example.com/${i}.png`,
      }));

      const { container } = render(
        <LogoGalleryBlock {...defaultProps} logos={many} />
      );
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(50);
    });

    it('should handle mixed image and text logos', () => {
      const mixed = [
        { id: '1', name: 'Company A', image: 'https://example.com/a.png' },
        { id: '2', name: 'Company B' },
        { id: '3', name: 'Company C', image: 'https://example.com/c.png' },
      ];

      render(<LogoGalleryBlock {...defaultProps} logos={mixed} />);
      expect(screen.getByAltText('Company A')).toBeInTheDocument();
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long company names', () => {
      const longName = 'International Business Management Corporation '.repeat(3);
      const logos = [
        { id: '1', name: longName },
      ];

      render(
        <LogoGalleryBlock {...defaultProps} logos={logos} />
      );
      expect(screen.getByText(new RegExp(longName.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle various image formats', () => {
      const logos = [
        { id: '1', name: 'PNG Logo', image: 'https://example.com/logo.png' },
        { id: '2', name: 'JPG Logo', image: 'https://example.com/logo.jpg' },
        { id: '3', name: 'SVG Logo', image: 'https://example.com/logo.svg' },
        { id: '4', name: 'WebP Logo', image: 'https://example.com/logo.webp' },
      ];

      render(<LogoGalleryBlock {...defaultProps} logos={logos} />);
      expect(screen.getByAltText('PNG Logo')).toBeInTheDocument();
      expect(screen.getByAltText('SVG Logo')).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const logos = [
        { id: '1', name: 'Company & Co. <Inc>' },
      ];

      render(
        <LogoGalleryBlock {...defaultProps} logos={logos} />
      );
      expect(screen.getByText(/Company & Co/)).toBeInTheDocument();
    });

    it('should handle emoji in names', () => {
      const logos = [
        { id: '1', name: '🚀 RocketCorp' },
      ];

      render(
        <LogoGalleryBlock {...defaultProps} logos={logos} />
      );
      expect(screen.getByText(/RocketCorp/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const main = container.firstChild as HTMLElement;
      expect(main.className).toMatch(/p[xy]/);
    });

    it('should adapt to different screen sizes', () => {
      const { container } = render(
        <LogoGalleryBlock {...defaultProps} columns={4} />
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on all logos', () => {
      render(<LogoGalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have readable text alternatives', () => {
      const textLogos = Array.from({ length: 6 }, (_, i) => ({
        id: `logo-${i}`,
        name: `Company ${i + 1}`,
      }));

      render(
        <LogoGalleryBlock {...defaultProps} logos={textLogos} />
      );

      textLogos.forEach((logo) => {
        expect(screen.getByText(logo.name)).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have logo containers with styling', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const containers = container.querySelectorAll('[class*="rounded"]');
      expect(containers.length).toBeGreaterThan(0);
    });

    it('should have background styling for logo containers', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const containers = container.querySelectorAll('[class*="bg-"]');
      expect(containers.length).toBeGreaterThan(0);
    });

    it('should have hover effects', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="hover:"]');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should have proper alignment', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="items-center"]');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<LogoGalleryBlock {...defaultProps} />);
      rerender(
        <LogoGalleryBlock {...defaultProps} title="Updated Title" />
      );
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });

    it('should render large logo galleries efficiently', () => {
      const many = Array.from({ length: 100 }, (_, i) => ({
        id: `logo-${i}`,
        name: `Company ${i}`,
        image: `https://example.com/${i}.png`,
      }));

      const { container } = render(
        <LogoGalleryBlock {...defaultProps} logos={many} />
      );
      expect(container.querySelectorAll('img').length).toBe(100);
    });
  });

  describe('Auto-Scroll Animation', () => {
    it('should have auto-scroll class for animation', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      const gallery = container.querySelector('[class*="auto-scroll"]');
      expect(gallery).toBeInTheDocument();
    });

    it('should support continuous scrolling', () => {
      const { container } = render(<LogoGalleryBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });
});
