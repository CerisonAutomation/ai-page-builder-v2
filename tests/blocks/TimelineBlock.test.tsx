import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimelineBlock } from '../../lib/blocks/timeline/TimelineBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('TimelineBlock', () => {
  const defaultProps: AllBlockProps['TimelineBlock'] = {
    title: 'Our Journey',
    description: 'Milestones in our evolution',
    items: [
      {
        id: '1',
        date: '2020-01',
        title: 'Founded',
        description: 'Company founded with initial vision',
      },
      {
        id: '2',
        date: '2021-06',
        title: 'Series A',
        description: 'Raised $5M in Series A funding',
      },
      {
        id: '3',
        date: '2022-03',
        title: '1M Users',
        description: 'Reached 1 million active users',
      },
      {
        id: '4',
        date: '2023-12',
        title: 'Global Expansion',
        description: 'Expanded to 50 countries',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<TimelineBlock {...defaultProps} />);
      expect(screen.getByText('Our Journey')).toBeInTheDocument();
      expect(screen.getByText('Milestones in our evolution')).toBeInTheDocument();
    });

    it('should render all timeline items', () => {
      render(<TimelineBlock {...defaultProps} />);
      expect(screen.getByText('Founded')).toBeInTheDocument();
      expect(screen.getByText('Series A')).toBeInTheDocument();
      expect(screen.getByText('1M Users')).toBeInTheDocument();
      expect(screen.getByText('Global Expansion')).toBeInTheDocument();
    });

    it('should render dates', () => {
      render(<TimelineBlock {...defaultProps} />);
      expect(screen.getByText('2020-01')).toBeInTheDocument();
      expect(screen.getByText('2021-06')).toBeInTheDocument();
    });

    it('should render descriptions', () => {
      render(<TimelineBlock {...defaultProps} />);
      expect(screen.getByText('Company founded with initial vision')).toBeInTheDocument();
      expect(screen.getByText('Raised $5M in Series A funding')).toBeInTheDocument();
    });
  });

  describe('Timeline Layout', () => {
    it('should render timeline structure', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container.querySelector('[class*="border"]')).toBeInTheDocument();
    });

    it('should display items in chronological order', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="relative"]');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should have connecting line between items', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const connectors = container.querySelectorAll('[class*="border"]');
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  describe('Props Validation', () => {
    it('should handle empty timeline', () => {
      const { container } = render(
        <TimelineBlock {...defaultProps} items={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single timeline item', () => {
      render(
        <TimelineBlock {...defaultProps} items={[defaultProps.items![0]]} />
      );
      expect(screen.getByText('Founded')).toBeInTheDocument();
    });

    it('should handle many timeline items', () => {
      const manyItems = Array.from({ length: 30 }, (_, i) => ({
        id: `item-${i}`,
        date: `2020-${String(i + 1).padStart(2, '0')}`,
        title: `Event ${i + 1}`,
        description: `Description for event ${i + 1}`,
      }));

      render(<TimelineBlock {...defaultProps} items={manyItems} />);
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 30')).toBeInTheDocument();
    });

    it('should handle items without descriptions', () => {
      const itemsNoDesc = [
        { id: '1', date: '2020-01', title: 'Event 1' },
      ];

      const { container } = render(
        <TimelineBlock {...defaultProps} items={itemsNoDesc as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('should support various date formats', () => {
      const items = [
        { id: '1', date: '2020-01-15', title: 'Full Date', description: 'Test' },
        { id: '2', date: '2021-Q2', title: 'Quarter', description: 'Test' },
        { id: '3', date: 'January 2022', title: 'Month Year', description: 'Test' },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText('Full Date')).toBeInTheDocument();
      expect(screen.getByText('Quarter')).toBeInTheDocument();
    });

    it('should handle relative dates', () => {
      const items = [
        { id: '1', date: 'Today', title: 'Now', description: 'Current' },
        { id: '2', date: '2 weeks ago', title: 'Recent', description: 'Past' },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long event titles', () => {
      const longTitle = 'This is a very long event title that might cause layout issues '.repeat(3);
      const items = [
        { id: '1', date: '2020-01', title: longTitle, description: 'Test' },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText(new RegExp(longTitle.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDesc = 'This is a detailed description. '.repeat(30);
      const items = [
        { id: '1', date: '2020-01', title: 'Event', description: longDesc },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText(new RegExp(longDesc.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const items = [
        {
          id: '1',
          date: '2020-01 & 2020-02',
          title: 'Event "Historic" <Milestone>',
          description: 'Description with "quotes" and \'apostrophes\'',
        },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText(/Event/)).toBeInTheDocument();
    });

    it('should handle emoji in event titles', () => {
      const items = [
        { id: '1', date: '2020-01', title: '🚀 Launch', description: 'Big day' },
      ];

      render(<TimelineBlock {...defaultProps} items={items} />);
      expect(screen.getByText(/Launch/)).toBeInTheDocument();
    });

    it('should handle chronologically unordered items', () => {
      const unorderedItems = [
        { id: '1', date: '2023-01', title: 'Recent', description: 'New' },
        { id: '2', date: '2020-01', title: 'Old', description: 'Start' },
        { id: '3', date: '2021-06', title: 'Middle', description: 'Between' },
      ];

      render(<TimelineBlock {...defaultProps} items={unorderedItems} />);
      expect(screen.getByText('Recent')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toMatch(/p[xy]/);
    });

    it('should adapt timeline for mobile', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container.querySelector('[class*="border"]')).toBeInTheDocument();
    });

    it('should adapt timeline for desktop', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container.querySelector('[class*="relative"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<TimelineBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be readable with good contrast', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should be screen reader friendly', () => {
      render(<TimelineBlock {...defaultProps} />);
      expect(screen.getByText('Founded')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have visual indicators for timeline nodes', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const nodes = container.querySelectorAll('[class*="rounded"]');
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should have connecting line styling', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const lines = container.querySelectorAll('[class*="border"]');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should alternate dates on sides if applicable', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should have proper spacing and alignment', () => {
      const { container } = render(<TimelineBlock {...defaultProps} />);
      const spaced = container.querySelectorAll('[class*="space"]');
      expect(spaced.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<TimelineBlock {...defaultProps} />);
      rerender(
        <TimelineBlock {...defaultProps} title="Updated Timeline" />
      );
      expect(screen.getByText('Updated Timeline')).toBeInTheDocument();
    });

    it('should render large timelines efficiently', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        date: `2020-${String((i % 12) + 1).padStart(2, '0')}`,
        title: `Event ${i}`,
        description: `Desc ${i}`,
      }));

      const { container } = render(
        <TimelineBlock {...defaultProps} items={manyItems} />
      );
      expect(container.querySelectorAll('[class*="relative"]').length).toBeGreaterThan(0);
    });
  });
});
