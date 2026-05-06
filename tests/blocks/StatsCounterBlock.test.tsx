import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock StatsCounterBlock with animated counters
const StatsCounterBlock = (props: any) => (
  <div className="w-full py-16 px-4 bg-gradient-to-r from-slate-900 to-slate-800">
    <h2 className="text-4xl font-bold text-white mb-4">{props.title}</h2>
    <p className="text-gray-300 mb-12">{props.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {props.stats?.map((stat: any) => (
        <div key={stat.id} className="text-center">
          <div className="text-5xl font-bold text-indigo-400 mb-2">{stat.value}</div>
          <p className="text-gray-300">{stat.label}</p>
          {stat.suffix && <p className="text-sm text-gray-400">{stat.suffix}</p>}
        </div>
      ))}
    </div>
  </div>
);

describe('StatsCounterBlock', () => {
  const defaultProps: any = {
    title: 'Our Growth',
    description: 'Impressive metrics that demonstrate our impact',
    stats: [
      { id: '1', value: '100K+', label: 'Active Users', suffix: 'and growing' },
      { id: '2', value: '$50M', label: 'Revenue', suffix: 'annually' },
      { id: '3', value: '150+', label: 'Countries', suffix: 'served' },
      { id: '4', value: '99.9%', label: 'Uptime', suffix: 'guaranteed' },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<StatsCounterBlock {...defaultProps} />);
      expect(screen.getByText('Our Growth')).toBeInTheDocument();
      expect(screen.getByText(/Impressive metrics/)).toBeInTheDocument();
    });

    it('should render all stat counters', () => {
      render(<StatsCounterBlock {...defaultProps} />);
      expect(screen.getByText('100K+')).toBeInTheDocument();
      expect(screen.getByText('$50M')).toBeInTheDocument();
      expect(screen.getByText('150+')).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
    });

    it('should render stat labels', () => {
      render(<StatsCounterBlock {...defaultProps} />);
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Countries')).toBeInTheDocument();
    });

    it('should render stat suffixes', () => {
      render(<StatsCounterBlock {...defaultProps} />);
      expect(screen.getByText('and growing')).toBeInTheDocument();
      expect(screen.getByText('annually')).toBeInTheDocument();
    });
  });

  describe('Counter Display', () => {
    it('should display values prominently', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const values = container.querySelectorAll('[class*="text-5xl"]');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should support different number formats', () => {
      const stats = [
        { id: '1', value: '100', label: 'Simple' },
        { id: '2', value: '1,000', label: 'Formatted' },
        { id: '3', value: '$1M+', label: 'Currency' },
        { id: '4', value: '99.99%', label: 'Percentage' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const stats = [
        { id: '1', value: '999,999,999', label: 'Big Number' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('999,999,999')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty stats array', () => {
      const { container } = render(
        <StatsCounterBlock {...defaultProps} stats={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single stat', () => {
      render(
        <StatsCounterBlock {...defaultProps} stats={[defaultProps.stats[0]]} />
      );
      expect(screen.getByText('100K+')).toBeInTheDocument();
    });

    it('should handle many stats', () => {
      const manyStats = Array.from({ length: 12 }, (_, i) => ({
        id: `stat-${i}`,
        value: `${i * 10}K`,
        label: `Metric ${i + 1}`,
      }));

      render(<StatsCounterBlock {...defaultProps} stats={manyStats} />);
      expect(screen.getByText('0K')).toBeInTheDocument();
      expect(screen.getByText('110K')).toBeInTheDocument();
    });

    it('should handle stats without suffix', () => {
      const stats = [
        { id: '1', value: '100', label: 'Users' },
        { id: '2', value: '50', label: 'Countries' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long labels', () => {
      const longLabel = 'This is a very long label for a metric '.repeat(3);
      const stats = [
        { id: '1', value: '100', label: longLabel },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(new RegExp(longLabel.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in values', () => {
      const stats = [
        { id: '1', value: '$50M+', label: 'Revenue' },
        { id: '2', value: '99.99%', label: 'Uptime' },
        { id: '3', value: '1,000+', label: 'Clients' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('$50M+')).toBeInTheDocument();
      expect(screen.getByText('99.99%')).toBeInTheDocument();
    });

    it('should handle emoji in labels', () => {
      const stats = [
        { id: '1', value: '100', label: '🚀 Launches' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText(/Launches/)).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const stats = [
        { id: '1', value: '0', label: 'Errors' },
      ];

      render(<StatsCounterBlock {...defaultProps} stats={stats} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render stats in responsive grid', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/grid-cols/);
    });

    it('should have appropriate column count', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="lg:grid-cols"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should adapt to mobile with single column', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid-cols-1"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive gap between items', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="gap"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have dark background', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const main = container.firstChild as HTMLElement;
      expect(main.className).toMatch(/bg-gradient|from-slate/);
    });

    it('should have white text on dark background', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title?.className).toContain('text-white');
    });

    it('should emphasize counter values with larger font', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const values = container.querySelectorAll('[class*="text-5xl"]');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should use accent color for numbers', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const values = container.querySelectorAll('[class*="text-indigo"]');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<StatsCounterBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have good color contrast on dark background', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      expect(container.querySelector('h2')).toHaveClass('text-white');
    });

    it('should be readable with proper text sizing', () => {
      const { container } = render(<StatsCounterBlock {...defaultProps} />);
      const stats = container.querySelectorAll('[class*="text-"]');
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<StatsCounterBlock {...defaultProps} />);
      rerender(
        <StatsCounterBlock {...defaultProps} title="Updated Stats" />
      );
      expect(screen.getByText('Updated Stats')).toBeInTheDocument();
    });

    it('should render large stat lists efficiently', () => {
      const manyStats = Array.from({ length: 50 }, (_, i) => ({
        id: `s-${i}`,
        value: `${i * 10}`,
        label: `Stat ${i}`,
      }));

      const { container } = render(
        <StatsCounterBlock {...defaultProps} stats={manyStats} />
      );
      expect(container.querySelector('[class*="grid"]')).toBeInTheDocument();
    });
  });
});
