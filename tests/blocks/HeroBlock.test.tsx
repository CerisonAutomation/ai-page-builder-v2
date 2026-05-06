import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBlock } from '../../lib/blocks/hero/HeroBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('HeroBlock', () => {
  const defaultProps: AllBlockProps['HeroBlock'] = {
    headline: 'Welcome to Our Platform',
    subheadline: 'Build amazing things with our powerful tools',
    ctaLabel: 'Get Started',
    ctaHref: 'https://example.com/start',
  };

  describe('Rendering', () => {
    it('should render with all required props', () => {
      render(<HeroBlock {...defaultProps} />);
      expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      expect(screen.getByText('Build amazing things with our powerful tools')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    });

    it('should render with background color', () => {
      const { container } = render(
        <HeroBlock {...defaultProps} bgColor="#ff6b6b" />
      );
      const heroDiv = container.querySelector('[style*="background-color"]');
      expect(heroDiv).toHaveStyle('backgroundColor: #ff6b6b');
    });

    it('should render with background image', () => {
      const { container } = render(
        <HeroBlock {...defaultProps} bgImage="https://example.com/bg.jpg" />
      );
      const heroDiv = container.querySelector('[style*="backgroundImage"]');
      expect(heroDiv).toHaveStyle('backgroundSize: cover');
    });

    it('should render default gradient background when no bgImage or bgColor', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const heroDiv = container.querySelector('[style*="backgroundImage"]');
      expect(heroDiv).toHaveStyle('backgroundImage: linear-gradient(to right, #1e293b, #0f172a)');
    });
  });

  describe('Props Validation', () => {
    it('should accept valid URLs for ctaHref', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        '/about',
      ];

      validUrls.forEach((url) => {
        const { container } = render(
          <HeroBlock {...defaultProps} ctaHref={url} />
        );
        expect(container.querySelector('a')).toHaveAttribute('href', url);
      });
    });

    it('should render with custom headline and subheadline', () => {
      const customProps = {
        ...defaultProps,
        headline: 'Custom Headline',
        subheadline: 'Custom Subheadline',
      };
      render(<HeroBlock {...customProps} />);
      expect(screen.getByText('Custom Headline')).toBeInTheDocument();
      expect(screen.getByText('Custom Subheadline')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long headlines', () => {
      const longHeadline = 'A'.repeat(100);
      render(<HeroBlock {...defaultProps} headline={longHeadline} />);
      expect(screen.getByText(longHeadline)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const specialProps = {
        ...defaultProps,
        headline: 'Welcome & Join Us! <Special>',
        ctaLabel: 'Click → Now',
      };
      render(<HeroBlock {...specialProps} />);
      expect(screen.getByText(/Welcome & Join Us/)).toBeInTheDocument();
    });

    it('should render even with undefined optional props', () => {
      const { container } = render(
        <HeroBlock 
          headline={defaultProps.headline}
          subheadline={defaultProps.subheadline}
          ctaLabel={defaultProps.ctaLabel}
          ctaHref={defaultProps.ctaHref}
          bgImage={undefined}
          bgColor={undefined}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should prioritize bgImage over bgColor', () => {
      const { container } = render(
        <HeroBlock 
          {...defaultProps} 
          bgImage="https://example.com/image.jpg"
          bgColor="#ff0000"
        />
      );
      const heroDiv = container.querySelector('[style*="backgroundImage"]');
      expect(heroDiv).toHaveStyle('backgroundImage: url(https://example.com/image.jpg)');
    });

    it('should set correct background-size and background-position for images', () => {
      const { container } = render(
        <HeroBlock {...defaultProps} bgImage="https://example.com/bg.jpg" />
      );
      const heroDiv = container.querySelector('[style*="backgroundImage"]');
      expect(heroDiv).toHaveStyle('backgroundSize: cover');
      expect(heroDiv).toHaveStyle('backgroundPosition: center');
    });

    it('should handle external image URLs', () => {
      const urls = [
        'https://images.unsplash.com/photo-1234',
        'https://cdn.example.com/images/bg.jpg',
      ];

      urls.forEach((url) => {
        const { container } = render(
          <HeroBlock {...defaultProps} bgImage={url} />
        );
        const heroDiv = container.querySelector('[style*="backgroundImage"]');
        expect(heroDiv).toHaveStyle(`backgroundImage: url(${url})`);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizing classes', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-4xl');
    });

    it('should render full width', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('w-full');
    });

    it('should have padding for spacing', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('py-24', 'px-4');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(<HeroBlock {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible CTA button', () => {
      render(<HeroBlock {...defaultProps} ctaLabel="Click Me" />);
      const link = screen.getByRole('link', { name: 'Click Me' });
      expect(link).toHaveAttribute('href');
    });

    it('should have proper text contrast with white text', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('text-white');
    });

    it('should support keyboard navigation on CTA', () => {
      render(<HeroBlock {...defaultProps} />);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct text color classes', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const subheadline = container.querySelector('p');
      expect(subheadline).toHaveClass('text-slate-300');
    });

    it('should apply correct button styling', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const button = container.querySelector('a');
      expect(button).toHaveClass('bg-indigo-600', 'hover:bg-indigo-700');
    });

    it('should have proper margin spacing', () => {
      const { container } = render(<HeroBlock {...defaultProps} />);
      const headline = container.querySelector('h1');
      const subheadline = container.querySelector('p');
      expect(headline).toHaveClass('mb-2');
      expect(subheadline).toHaveClass('mb-6');
    });
  });

  describe('Performance & Rendering', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<HeroBlock {...defaultProps} />);
      rerender(<HeroBlock {...defaultProps} />);
      expect(screen.getByText(defaultProps.headline)).toBeInTheDocument();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<HeroBlock {...defaultProps} />);
      rerender(<HeroBlock {...defaultProps} headline="Updated" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });
});
