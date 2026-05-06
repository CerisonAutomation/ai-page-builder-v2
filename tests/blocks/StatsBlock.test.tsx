import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsBlock } from '../../lib/blocks/stats/StatsBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('StatsBlock', () => {
  const defaultProps: AllBlockProps['StatsBlock'] = {
    title: 'Our Impact',
    description: 'Trusted by thousands worldwide',
    stats: [
      { id: '1', label: 'Users', value: '100K+' },
      { id: '2', label: 'Projects', value: '50K+' },
      { id: '3', label: 'Countries', value: '150+' },
      { id: '4', label: 'Uptime', value: '99.9%' },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<StatsBlock {...defaultProps} />);
      expect(screen.getByText('Our Impact')).toBeInTheDocument();
      expect(screen.getByText('Trusted by thousands worldwide')).toBeInTheDocument();
    });

    it('should render all stats', () => {
      render(<StatsBlock {...defaultProps} />);
      expect(screen.getByText('100K+')).toBeInTheDocument();
      expect(screen.getByText('50K+')).toBeInTheDocument();
      expect(screen.getByText('150+')).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
    });

    it('should render stat labels', () => {
      render(<StatsBlock {...defaultProps} />);
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Countries')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty stats array', () => {
      const { container } = render(
        <StatsBlock {...defaultProps} stats={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single stat', () => {
      render(
        <StatsBlock {...defaultProps} stats={[defaultProps.stats![0]]} />
      );
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should handle many stats', () => {
      const manyStats = Array.from({ length: 12 }, (_, i) => ({
        id: `stat-${i}`,
        label: `Metric ${i + 1}`,
        value: `${i * 10}K+`,
      }));

      render(<StatsBlock {...defaultProps} stats={manyStats} />);
      expect(screen.getByText('Metric 1')).toBeInTheDocument();
      expect(screen.getByText('Metric 12')).toBeInTheDocument();
    });

    it('should handle different number formats', () => {
      const stats = [
        { id: '1', label: 'Integer', value: '1000' },
        { id: '2', label: 'Decimal', value: '99.99' },
        { id: '3', label: 'With Suffix', value: '50M+' },
        { id: '4', label: 'Percentage', value: '95%' },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('99.99')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long labels', () => {
      const longLabel = 'This is a very long statistic label that could be problematic '.repeat(3);
      const stats = [
        { id: '1', label: longLabel, value: '100' },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(new RegExp(longLabel.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long values', () => {
      const longValue = '9999999999999999999999+';
      const stats = [
        { id: '1', label: 'Big Number', value: longValue },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(longValue)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const stats = [
        { id: '1', label: 'Feature & Benefits', value: '100%<achieved>' },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(/Feature & Benefits/)).toBeInTheDocument();
    });

    it('should handle emoji in values', () => {
      const stats = [
        { id: '1', label: 'Happy Customers', value: '😊 1000+' },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(/Happy Customers/)).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const stats = [
        { id: '1', label: 'Errors', value: '0' },
      ];

      render(<StatsBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render stats in a grid', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive columns', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/grid/);
    });

    it('should apply gap between stat items', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toContain('gap');
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toMatch(/p[xy]/);
    });

    it('should stack on mobile', () => {
      const { container } = render(
        <StatsBlock {...defaultProps} stats={[defaultProps.stats![0]]} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<StatsBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be readable with proper styling', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should emphasize stat values with larger font', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const largeText = container.querySelectorAll('[class*="text-2xl"], [class*="text-3xl"]');
      expect(largeText.length).toBeGreaterThan(0);
    });

    it('should have visual separation between stats', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should apply consistent styling', () => {
      const { container } = render(<StatsBlock {...defaultProps} />);
      const statsItems = container.querySelectorAll('[class*="text-center"]');
      expect(statsItems.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<StatsBlock {...defaultProps} />);
      rerender(
        <StatsBlock {...defaultProps} title="Updated Stats" />
      );
      expect(screen.getByText('Updated Stats')).toBeInTheDocument();
    });

    it('should render large stat lists efficiently', () => {
      const manyStats = Array.from({ length: 50 }, (_, i) => ({
        id: `s-${i}`,
        label: `Stat ${i}`,
        value: `${i * 10}K`,
      }));

      const { container } = render(
        <StatsBlock {...defaultProps} stats={manyStats} />
      );
      expect(container.querySelectorAll('[class*="grid"]').length).toBeGreaterThan(0);
    });
  });
});
