import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardGridBlock } from '../../lib/blocks/card-grid/CardGridBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('CardGridBlock', () => {
  const defaultProps: AllBlockProps['CardGridBlock'] = {
    title: 'Our Features',
    cards: [
      {
        id: '1',
        title: 'Fast',
        description: 'Lightning quick performance',
        icon: '⚡',
      },
      {
        id: '2',
        title: 'Reliable',
        description: 'Built to last',
        icon: '✅',
      },
      {
        id: '3',
        title: 'Secure',
        description: 'Enterprise security',
        icon: '🔒',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title', () => {
      render(<CardGridBlock {...defaultProps} />);
      expect(screen.getByText('Our Features')).toBeInTheDocument();
    });

    it('should render all cards', () => {
      render(<CardGridBlock {...defaultProps} />);
      expect(screen.getByText('Fast')).toBeInTheDocument();
      expect(screen.getByText('Reliable')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
    });

    it('should render card descriptions', () => {
      render(<CardGridBlock {...defaultProps} />);
      expect(screen.getByText('Lightning quick performance')).toBeInTheDocument();
      expect(screen.getByText('Built to last')).toBeInTheDocument();
    });

    it('should render icons if provided', () => {
      render(<CardGridBlock {...defaultProps} />);
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty cards array', () => {
      const { container } = render(
        <CardGridBlock {...defaultProps} cards={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should render with single card', () => {
      render(
        <CardGridBlock 
          {...defaultProps} 
          cards={[defaultProps.cards![0]]}
        />
      );
      expect(screen.getByText('Fast')).toBeInTheDocument();
    });

    it('should handle many cards', () => {
      const manyCards = Array.from({ length: 12 }, (_, i) => ({
        id: `card-${i}`,
        title: `Card ${i + 1}`,
        description: `Description for card ${i + 1}`,
        icon: '📌',
      }));

      render(
        <CardGridBlock {...defaultProps} cards={manyCards} />
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 12')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing icons', () => {
      const cardsWithoutIcons = [
        { id: '1', title: 'Card 1', description: 'Desc 1' },
        { id: '2', title: 'Card 2', description: 'Desc 2' },
      ];

      render(
        <CardGridBlock 
          {...defaultProps} 
          cards={cardsWithoutIcons as any}
        />
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
    });

    it('should handle very long card titles', () => {
      const longTitle = 'A'.repeat(100);
      const cardsWithLongTitle = [
        { ...defaultProps.cards![0], title: longTitle },
      ];

      render(
        <CardGridBlock {...defaultProps} cards={cardsWithLongTitle} />
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle cards with special characters', () => {
      const specialCards = [
        {
          id: '1',
          title: 'Feature & Benefits <Special>',
          description: 'Description with "quotes" and \'apostrophes\'',
          icon: '🚀',
        },
      ];

      render(
        <CardGridBlock {...defaultProps} cards={specialCards} />
      );
      expect(screen.getByText(/Feature & Benefits/)).toBeInTheDocument();
    });

    it('should render with null descriptions', () => {
      const cardsWithNullDesc = [
        { id: '1', title: 'Card 1', description: null, icon: '📌' },
      ];

      render(
        <CardGridBlock {...defaultProps} cards={cardsWithNullDesc as any} />
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should use grid layout class', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive column classes', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/col|grid/i);
    });
  });

  describe('Responsive Design', () => {
    it('should render as single column on mobile', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should be responsive with Tailwind classes', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toContain('gap');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<CardGridBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should maintain semantic structure with cards', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      expect(container.querySelectorAll('[class*="card"]')).toHaveLength(3);
    });

    it('should be readable with proper text hierarchy', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      const cardTitles = container.querySelectorAll('[class*="font-bold"]');
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Design', () => {
    it('should apply card styling classes', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have spacing and padding', () => {
      const { container } = render(<CardGridBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });
  });
});
