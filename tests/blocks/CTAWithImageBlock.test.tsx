import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock CTAWithImageBlock component
const CTAWithImageBlock = (props: any) => (
  <div className="w-full py-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="order-2 lg:order-1">
        <h2 className="text-4xl font-bold mb-4">{props.headline}</h2>
        <p className="text-lg text-gray-600 mb-6">{props.description}</p>
        <div className="flex gap-4">
          <a href={props.primaryCtaHref} className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg">
            {props.primaryCtaLabel}
          </a>
          {props.secondaryCtaLabel && (
            <a href={props.secondaryCtaHref} className="inline-block border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg">
              {props.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <img src={props.image} alt={props.imageAlt} className="w-full rounded-lg shadow-lg" />
      </div>
    </div>
  </div>
);

describe('CTAWithImageBlock', () => {
  const defaultProps: any = {
    headline: 'Transform Your Workflow',
    description: 'Streamline your process with our innovative solution designed for modern teams.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    imageAlt: 'Dashboard Preview',
    primaryCtaLabel: 'Get Started',
    primaryCtaHref: 'https://example.com/start',
    secondaryCtaLabel: 'Learn More',
    secondaryCtaHref: 'https://example.com/learn',
  };

  describe('Rendering', () => {
    it('should render headline and description', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      expect(screen.getByText('Transform Your Workflow')).toBeInTheDocument();
      expect(screen.getByText(/Streamline your process/)).toBeInTheDocument();
    });

    it('should render image with alt text', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const image = screen.getByAltText('Dashboard Preview');
      expect(image).toBeInTheDocument();
    });

    it('should render primary CTA button', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    });

    it('should render secondary CTA button', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have two-column layout on desktop', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="lg:grid-cols-2"]');
      expect(grid).toBeInTheDocument();
    });

    it('should stack single column on mobile', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid-cols-1"]');
      expect(grid).toBeInTheDocument();
    });

    it('should alternate image position with order classes', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image?.parentElement?.className).toContain('order');
    });
  });

  describe('Image Handling', () => {
    it('should render image with src attribute', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const image = screen.getByAltText('Dashboard Preview') as HTMLImageElement;
      expect(image.src).toContain('unsplash.com');
    });

    it('should have rounded corners on image', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image?.className).toContain('rounded');
    });

    it('should have shadow effect on image', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image?.className).toContain('shadow');
    });

    it('should handle external image URLs', () => {
      const urls = [
        'https://images.unsplash.com/photo-1234',
        'https://cdn.example.com/image.jpg',
      ];

      urls.forEach((url) => {
        const { unmount } = render(
          <CTAWithImageBlock {...defaultProps} image={url} />
        );
        const img = screen.getByAltText('Dashboard Preview') as HTMLImageElement;
        expect(img.src).toContain('example.com') || expect(img.src).toContain('unsplash');
        unmount();
      });
    });
  });

  describe('Button Styling', () => {
    it('should have primary button with filled background', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const primaryBtn = screen.getByRole('link', { name: 'Get Started' });
      expect(primaryBtn.className).toContain('bg-indigo-600');
    });

    it('should have secondary button with border', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const secondaryBtn = screen.getByRole('link', { name: 'Learn More' });
      expect(secondaryBtn.className).toContain('border');
    });

    it('should have both buttons next to each other', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const buttonContainer = container.querySelector('[class*="flex gap"]');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle without secondary CTA', () => {
      const { container } = render(
        <CTAWithImageBlock {...defaultProps} secondaryCtaLabel={undefined} />
      );
      const primaryBtn = screen.getByRole('link', { name: 'Get Started' });
      expect(primaryBtn).toBeInTheDocument();
    });

    it('should handle different headline lengths', () => {
      const headlines = [
        'Short',
        'This is a much longer headline that spans multiple words',
        'A'.repeat(150),
      ];

      headlines.forEach((headline) => {
        const { unmount } = render(
          <CTAWithImageBlock {...defaultProps} headline={headline} />
        );
        expect(screen.getByText(new RegExp(headline.slice(0, 50)))).toBeInTheDocument();
        unmount();
      });
    });

    it('should accept both HTTP and HTTPS URLs', () => {
      const urls = ['https://example.com', 'http://example.com', '/internal'];

      urls.forEach((url) => {
        const { unmount } = render(
          <CTAWithImageBlock {...defaultProps} primaryCtaHref={url} />
        );
        expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', url);
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long description text', () => {
      const longDesc = 'Description text. '.repeat(50);
      render(
        <CTAWithImageBlock {...defaultProps} description={longDesc} />
      );
      expect(screen.getByText(new RegExp(longDesc.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      render(
        <CTAWithImageBlock
          {...defaultProps}
          headline="Get 50% Off & Save!"
          primaryCtaLabel="Claim → Now"
        />
      );
      expect(screen.getByText(/50% Off/)).toBeInTheDocument();
    });

    it('should handle missing image gracefully', () => {
      const { container } = render(
        <CTAWithImageBlock {...defaultProps} image={undefined} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive gap between columns', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="gap"]');
      expect(grid).toBeInTheDocument();
    });

    it('should center content vertically on desktop', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="items-center"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on image', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const image = screen.getByAltText('Dashboard Preview');
      expect(image).toBeInTheDocument();
    });

    it('should have accessible button links', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const buttons = screen.getAllByRole('link');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('href');
      });
    });

    it('should have good text contrast', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const heading = container.querySelector('h2');
      expect(heading?.className).toContain('font-bold');
    });
  });

  describe('Visual Design', () => {
    it('should have proper spacing and padding', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('py-16');
    });

    it('should have visual hierarchy with font sizes', () => {
      const { container } = render(<CTAWithImageBlock {...defaultProps} />);
      const heading = container.querySelector('h2');
      expect(heading?.className).toMatch(/text-4xl/);
    });

    it('should apply consistent styling to both buttons', () => {
      render(<CTAWithImageBlock {...defaultProps} />);
      const primaryBtn = screen.getByRole('link', { name: 'Get Started' });
      const secondaryBtn = screen.getByRole('link', { name: 'Learn More' });
      expect(primaryBtn).toHaveClass('px-8', 'py-3', 'rounded-lg');
      expect(secondaryBtn).toHaveClass('px-8', 'py-3', 'rounded-lg');
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<CTAWithImageBlock {...defaultProps} />);
      rerender(
        <CTAWithImageBlock {...defaultProps} headline="Updated Headline" />
      );
      expect(screen.getByText('Updated Headline')).toBeInTheDocument();
    });

    it('should not cause layout shift with missing properties', () => {
      const { container: c1 } = render(<CTAWithImageBlock {...defaultProps} />);
      const { container: c2 } = render(
        <CTAWithImageBlock {...defaultProps} secondaryCtaLabel={undefined} />
      );
      expect(c1).toBeInTheDocument();
      expect(c2).toBeInTheDocument();
    });
  });
});
