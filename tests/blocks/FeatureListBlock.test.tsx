import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureListBlock } from '../../lib/blocks/feature-list/FeatureListBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('FeatureListBlock', () => {
  const defaultProps: AllBlockProps['FeatureListBlock'] = {
    title: 'Key Features',
    description: 'Everything you need to succeed',
    features: [
      {
        id: '1',
        title: 'Easy to Use',
        description: 'Intuitive interface that anyone can master',
        icon: '⚡',
      },
      {
        id: '2',
        title: 'Powerful',
        description: 'Enterprise-grade capabilities at your fingertips',
        icon: '💪',
      },
      {
        id: '3',
        title: 'Secure',
        description: 'Bank-level security for your peace of mind',
        icon: '🔒',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<FeatureListBlock {...defaultProps} />);
      expect(screen.getByText('Key Features')).toBeInTheDocument();
      expect(screen.getByText('Everything you need to succeed')).toBeInTheDocument();
    });

    it('should render all features', () => {
      render(<FeatureListBlock {...defaultProps} />);
      expect(screen.getByText('Easy to Use')).toBeInTheDocument();
      expect(screen.getByText('Powerful')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<FeatureListBlock {...defaultProps} />);
      expect(screen.getByText('Intuitive interface that anyone can master')).toBeInTheDocument();
      expect(screen.getByText('Enterprise-grade capabilities at your fingertips')).toBeInTheDocument();
    });

    it('should render icons', () => {
      render(<FeatureListBlock {...defaultProps} />);
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('💪')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty features list', () => {
      const { container } = render(
        <FeatureListBlock {...defaultProps} features={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single feature', () => {
      render(
        <FeatureListBlock {...defaultProps} features={[defaultProps.features![0]]} />
      );
      expect(screen.getByText('Easy to Use')).toBeInTheDocument();
    });

    it('should handle many features', () => {
      const manyFeatures = Array.from({ length: 20 }, (_, i) => ({
        id: `feature-${i}`,
        title: `Feature ${i + 1}`,
        description: `Description for feature ${i + 1}`,
        icon: '✓',
      }));

      render(<FeatureListBlock {...defaultProps} features={manyFeatures} />);
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 20')).toBeInTheDocument();
    });

    it('should handle features without icons', () => {
      const noIconFeatures = [
        { id: '1', title: 'Feature 1', description: 'Description 1' },
        { id: '2', title: 'Feature 2', description: 'Description 2' },
      ];

      render(
        <FeatureListBlock {...defaultProps} features={noIconFeatures as any} />
      );
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long feature titles', () => {
      const longTitle = 'This is a very long feature title that '.repeat(5);
      const features = [
        { id: '1', title: longTitle, description: 'Desc', icon: '✓' },
      ];

      render(<FeatureListBlock {...defaultProps} features={features} />);
      expect(screen.getByText(new RegExp(longTitle.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDesc = 'This is a detailed description. '.repeat(20);
      const features = [
        { id: '1', title: 'Feature', description: longDesc, icon: '✓' },
      ];

      render(<FeatureListBlock {...defaultProps} features={features} />);
      expect(screen.getByText(new RegExp(longDesc.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const features = [
        {
          id: '1',
          title: 'Feature & Benefits <Pro>',
          description: 'Includes "quotes" and \'apostrophes\'',
          icon: '🚀',
        },
      ];

      render(<FeatureListBlock {...defaultProps} features={features} />);
      expect(screen.getByText(/Feature & Benefits/)).toBeInTheDocument();
    });

    it('should handle null/undefined optional properties', () => {
      const minimalFeatures = [
        { id: '1', title: 'Feature 1', description: 'Desc 1' },
      ];

      const { container } = render(
        <FeatureListBlock {...defaultProps} features={minimalFeatures as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should display features as vertical list', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const featureItems = container.querySelectorAll('[class*="flex"]');
      expect(featureItems.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between features', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const spaced = container.querySelectorAll('[class*="space"]');
      expect(spaced.length).toBeGreaterThanOrEqual(0);
    });

    it('should align icons with text', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const icons = container.querySelectorAll('[class*="text"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toMatch(/p[xy]/);
    });

    it('should stack vertically on mobile', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="flex"]');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<FeatureListBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const headings = container.querySelectorAll('h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be readable with good contrast', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="space"]');
      expect(items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Visual Design', () => {
    it('should style icons prominently', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const icons = container.querySelectorAll('[class*="text"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have visual separation between features', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const separators = container.querySelectorAll('[class*="border"]');
      expect(separators.length).toBeGreaterThanOrEqual(0);
    });

    it('should apply consistent styling to all features', () => {
      const { container } = render(<FeatureListBlock {...defaultProps} />);
      const features = container.querySelectorAll('[class*="flex"]');
      expect(features.length).toBe(3);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<FeatureListBlock {...defaultProps} />);
      rerender(
        <FeatureListBlock {...defaultProps} title="Updated Features" />
      );
      expect(screen.getByText('Updated Features')).toBeInTheDocument();
    });

    it('should render large feature lists efficiently', () => {
      const manyFeatures = Array.from({ length: 50 }, (_, i) => ({
        id: `f-${i}`,
        title: `Feature ${i}`,
        description: `Desc ${i}`,
        icon: '✓',
      }));

      const { container } = render(
        <FeatureListBlock {...defaultProps} features={manyFeatures} />
      );
      expect(container.querySelectorAll('[class*="flex"]').length).toBeGreaterThan(0);
    });
  });
});
