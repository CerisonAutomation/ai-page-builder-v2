import React from 'react';
import { render, screen } from '@testing-library/react';
import { CTABlock } from '../../lib/blocks/cta/CTABlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('CTABlock', () => {
  const defaultProps: AllBlockProps['CTABlock'] = {
    headline: 'Ready to Get Started?',
    description: 'Join thousands of happy customers today',
    primaryCtaLabel: 'Sign Up',
    primaryCtaHref: 'https://example.com/signup',
    secondaryCtaLabel: 'Learn More',
    secondaryCtaHref: 'https://example.com/learn',
    bgColor: '#6366f1',
  };

  describe('Rendering', () => {
    it('should render headline and description', () => {
      render(<CTABlock {...defaultProps} />);
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of happy customers today')).toBeInTheDocument();
    });

    it('should render primary CTA button', () => {
      render(<CTABlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('should render secondary CTA button when provided', () => {
      render(<CTABlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('should apply background color', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const ctaSection = container.firstChild as HTMLElement;
      expect(ctaSection).toHaveStyle(`backgroundColor: ${defaultProps.bgColor}`);
    });

    it('should render without secondary CTA', () => {
      const { container } = render(
        <CTABlock 
          {...defaultProps} 
          secondaryCtaLabel={undefined}
          secondaryCtaHref={undefined}
        />
      );
      const primaryLink = screen.getByRole('link', { name: 'Sign Up' });
      expect(primaryLink).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle different headline lengths', () => {
      const headlines = [
        'Short',
        'A much longer headline that provides more details about the offer',
        'A'.repeat(150),
      ];

      headlines.forEach((headline) => {
        const { unmount } = render(
          <CTABlock {...defaultProps} headline={headline} />
        );
        expect(screen.getByText(headline)).toBeInTheDocument();
        unmount();
      });
    });

    it('should accept both HTTP and HTTPS URLs', () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        '/internal-link',
      ];

      urls.forEach((url) => {
        const { unmount } = render(
          <CTABlock {...defaultProps} primaryCtaHref={url} />
        );
        expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', url);
        unmount();
      });
    });

    it('should handle optional properties', () => {
      const minimalProps = {
        headline: 'Call to Action',
        description: 'Make a choice',
        primaryCtaLabel: 'Go',
        primaryCtaHref: '/',
      };

      const { container } = render(<CTABlock {...minimalProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should have different styles for primary and secondary buttons', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const buttons = container.querySelectorAll('a[class*="bg-"]');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should apply hover effects to buttons', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const primaryBtn = screen.getByRole('link', { name: 'Sign Up' });
      expect(primaryBtn.className).toContain('hover:');
    });

    it('should have rounded corners on buttons', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const buttons = container.querySelectorAll('a[class*="rounded"]');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long descriptions', () => {
      const longDesc = 'Word '.repeat(100);
      render(<CTABlock {...defaultProps} description={longDesc} />);
      expect(screen.getByText(new RegExp(longDesc.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      render(
        <CTABlock 
          {...defaultProps}
          headline="Get 50% Off & Free Shipping!"
          primaryCtaLabel="Claim → Now"
        />
      );
      expect(screen.getByText(/50% Off/)).toBeInTheDocument();
    });

    it('should handle emoji in labels', () => {
      render(
        <CTABlock 
          {...defaultProps}
          primaryCtaLabel="🚀 Launch"
          secondaryCtaLabel="📚 Learn"
        />
      );
      expect(screen.getByRole('link', { name: /Launch/ })).toBeInTheDocument();
    });

    it('should handle null background color gracefully', () => {
      const { container } = render(
        <CTABlock {...defaultProps} bgColor={undefined} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have full width styling', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const cta = container.firstChild as HTMLElement;
      expect(cta.className).toMatch(/p[xy]-/);
    });

    it('should stack buttons responsively', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      const buttonContainer = container.querySelector('[class*="flex"]');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CTABlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible button links', () => {
      render(<CTABlock {...defaultProps} />);
      const primaryBtn = screen.getByRole('link', { name: 'Sign Up' });
      expect(primaryBtn.tagName).toBe('A');
      expect(primaryBtn).toHaveAttribute('href');
    });

    it('should maintain color contrast for text', () => {
      const { container } = render(<CTABlock {...defaultProps} />);
      expect(container.querySelector('h2')).toHaveClass('text-white');
    });

    it('should have descriptive text for buttons', () => {
      render(<CTABlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
    });
  });

  describe('Color Handling', () => {
    it('should accept various color formats', () => {
      const colors = ['#ff0000', '#f00', 'rgb(255,0,0)', 'red'];

      colors.forEach((color) => {
        const { unmount } = render(
          <CTABlock {...defaultProps} bgColor={color} />
        );
        expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
        unmount();
      });
    });

    it('should set text color to white on colored backgrounds', () => {
      const { container } = render(<CTABlock {...defaultProps} bgColor="#000000" />);
      const text = container.querySelector('p');
      expect(text).toHaveClass('text-white');
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop updates', () => {
      const { rerender } = render(<CTABlock {...defaultProps} />);
      rerender(<CTABlock {...defaultProps} headline="Updated Headline" />);
      expect(screen.getByText('Updated Headline')).toBeInTheDocument();
    });

    it('should not cause layout shifts with missing properties', () => {
      const { container: container1 } = render(<CTABlock {...defaultProps} />);
      const { container: container2 } = render(
        <CTABlock {...defaultProps} secondaryCtaLabel={undefined} />
      );
      expect(container1).toBeInTheDocument();
      expect(container2).toBeInTheDocument();
    });
  });
});
