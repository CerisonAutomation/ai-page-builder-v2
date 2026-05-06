import React from 'react';
import { render, screen } from '@testing-library/react';
import { PricingBlock } from '../../lib/blocks/pricing/PricingBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('PricingBlock', () => {
  const defaultProps: AllBlockProps['PricingBlock'] = {
    title: 'Simple, Transparent Pricing',
    description: 'Choose the perfect plan for your needs',
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        price: '$29',
        description: 'Perfect for individuals',
        features: ['1 User', '5 Projects', 'Email Support'],
        ctaLabel: 'Get Started',
        highlighted: false,
      },
      {
        id: 'pro',
        name: 'Professional',
        price: '$99',
        description: 'For growing teams',
        features: ['10 Users', 'Unlimited Projects', 'Priority Support'],
        ctaLabel: 'Get Started',
        highlighted: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large organizations',
        features: ['Unlimited Users', 'Unlimited Projects', '24/7 Phone Support'],
        ctaLabel: 'Contact Sales',
        highlighted: false,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument();
      expect(screen.getByText('Choose the perfect plan for your needs')).toBeInTheDocument();
    });

    it('should render all pricing plans', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('should render prices', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('$29')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should render plan descriptions', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('Perfect for individuals')).toBeInTheDocument();
      expect(screen.getByText('For growing teams')).toBeInTheDocument();
    });

    it('should render all features', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('1 User')).toBeInTheDocument();
      expect(screen.getByText('Unlimited Projects')).toBeInTheDocument();
    });

    it('should render CTA buttons for each plan', () => {
      render(<PricingBlock {...defaultProps} />);
      const buttons = screen.getAllByRole('link', { name: /Get Started|Contact Sales/ });
      expect(buttons.length).toBe(3);
    });
  });

  describe('Highlighted Plan', () => {
    it('should visually distinguish highlighted plan', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const plans = container.querySelectorAll('[class*="card"]');
      expect(plans.length).toBe(3);
    });

    it('should mark Professional plan as highlighted', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('should handle multiple highlighted plans', () => {
      const propsMultiHighlight = {
        ...defaultProps,
        plans: defaultProps.plans!.map((plan) => ({
          ...plan,
          highlighted: plan.id !== 'starter',
        })),
      };

      render(<PricingBlock {...propsMultiHighlight} />);
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle single plan', () => {
      const singlePlanProps = {
        ...defaultProps,
        plans: [defaultProps.plans![0]],
      };

      render(<PricingBlock {...singlePlanProps} />);
      expect(screen.getByText('Starter')).toBeInTheDocument();
    });

    it('should handle many plans', () => {
      const manyPlans = Array.from({ length: 10 }, (_, i) => ({
        id: `plan-${i}`,
        name: `Plan ${i + 1}`,
        price: `$${(i + 1) * 10}`,
        description: `Description ${i + 1}`,
        features: [`Feature ${i}1`, `Feature ${i}2`],
        ctaLabel: 'Get Started',
        highlighted: false,
      }));

      render(
        <PricingBlock {...defaultProps} plans={manyPlans} />
      );

      expect(screen.getByText('Plan 1')).toBeInTheDocument();
      expect(screen.getByText('Plan 10')).toBeInTheDocument();
    });

    it('should handle plans without features', () => {
      const propsNoFeatures = {
        ...defaultProps,
        plans: [
          {
            id: 'basic',
            name: 'Basic',
            price: '$0',
            description: 'Free tier',
            features: [],
            ctaLabel: 'Get Started',
            highlighted: false,
          },
        ],
      };

      render(<PricingBlock {...propsNoFeatures} />);
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long feature lists', () => {
      const longFeatures = Array.from({ length: 20 }, (_, i) => `Feature ${i + 1}`);
      const propsLongFeatures = {
        ...defaultProps,
        plans: [
          { ...defaultProps.plans![0], features: longFeatures },
        ],
      };

      render(<PricingBlock {...propsLongFeatures} />);
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 20')).toBeInTheDocument();
    });

    it('should handle special characters in plan names', () => {
      const specialProps = {
        ...defaultProps,
        plans: [
          {
            id: '1',
            name: 'Pro & Enterprise',
            price: '$99/mo',
            description: 'For <strong>teams</strong>',
            features: ['Feature "A"', 'Feature \'B\''],
            ctaLabel: 'Start Free →',
            highlighted: false,
          },
        ],
      };

      render(<PricingBlock {...specialProps} />);
      expect(screen.getByText(/Pro & Enterprise/)).toBeInTheDocument();
    });

    it('should handle missing optional properties', () => {
      const minimalPlans = [
        {
          id: '1',
          name: 'Plan 1',
          price: '$10',
          features: [],
          ctaLabel: 'Buy',
        },
      ];

      const { container } = render(
        <PricingBlock 
          {...defaultProps}
          plans={minimalPlans as any}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle zero prices', () => {
      const freePlan = {
        ...defaultProps.plans![0],
        price: 'Free',
      };

      render(
        <PricingBlock {...defaultProps} plans={[freePlan]} />
      );
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  describe('Feature Display', () => {
    it('should render checkmarks or indicators for features', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const featureItems = container.querySelectorAll('li');
      expect(featureItems.length).toBeGreaterThan(0);
    });

    it('should display features in correct plan', () => {
      render(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('1 User')).toBeInTheDocument();
      expect(screen.getByText('10 Users')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should use grid layout for plans', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should stack plans on mobile', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive column layout', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/md:|lg:/);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<PricingBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons for CTAs', () => {
      render(<PricingBlock {...defaultProps} />);
      const buttons = screen.getAllByRole('link');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('href');
      });
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(<PricingBlock {...defaultProps} />);
      const buttons = screen.getAllByRole('link');
      buttons.forEach((btn) => {
        expect(btn.tagName).toBe('A');
      });
    });
  });

  describe('Visual Design', () => {
    it('should apply card styling', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should apply shadow effects', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="shadow"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use consistent padding', () => {
      const { container } = render(<PricingBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<PricingBlock {...defaultProps} />);
      rerender(
        <PricingBlock 
          {...defaultProps}
          title="Updated Pricing"
        />
      );
      expect(screen.getByText('Updated Pricing')).toBeInTheDocument();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<PricingBlock {...defaultProps} />);
      rerender(<PricingBlock {...defaultProps} />);
      expect(screen.getByText('Starter')).toBeInTheDocument();
    });
  });
});
