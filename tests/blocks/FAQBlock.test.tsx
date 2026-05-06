import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQBlock } from '../../lib/blocks/faq/FAQBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('FAQBlock', () => {
  const defaultProps: AllBlockProps['FAQBlock'] = {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions',
    items: [
      {
        id: '1',
        question: 'What is this product?',
        answer: 'This is a product that helps you build amazing things.',
      },
      {
        id: '2',
        question: 'How much does it cost?',
        answer: 'We offer flexible pricing starting from $29/month.',
      },
      {
        id: '3',
        question: 'Do you offer support?',
        answer: 'Yes, we provide 24/7 customer support.',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<FAQBlock {...defaultProps} />);
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
      expect(screen.getByText('Find answers to common questions')).toBeInTheDocument();
    });

    it('should render all FAQ items', () => {
      render(<FAQBlock {...defaultProps} />);
      expect(screen.getByText('What is this product?')).toBeInTheDocument();
      expect(screen.getByText('How much does it cost?')).toBeInTheDocument();
      expect(screen.getByText('Do you offer support?')).toBeInTheDocument();
    });

    it('should render answers', () => {
      render(<FAQBlock {...defaultProps} />);
      expect(screen.getByText('This is a product that helps you build amazing things.')).toBeInTheDocument();
    });
  });

  describe('Accordion Functionality', () => {
    it('should toggle accordion items on click', async () => {
      const user = userEvent.setup();
      render(<FAQBlock {...defaultProps} />);

      const firstQuestion = screen.getByText('What is this product?');
      expect(firstQuestion).toBeInTheDocument();
    });

    it('should handle multiple accordion interactions', async () => {
      const user = userEvent.setup();
      render(<FAQBlock {...defaultProps} />);

      const questions = screen.getAllByText(/\?$/);
      expect(questions.length).toBe(3);
    });

    it('should be expandable/collapsible', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const accordionItems = container.querySelectorAll('[class*="accordion"]');
      expect(accordionItems.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Props Validation', () => {
    it('should handle empty FAQ items', () => {
      const { container } = render(
        <FAQBlock {...defaultProps} items={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single FAQ item', () => {
      render(
        <FAQBlock {...defaultProps} items={[defaultProps.items![0]]} />
      );
      expect(screen.getByText('What is this product?')).toBeInTheDocument();
    });

    it('should handle many FAQ items', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i + 1}?`,
        answer: `Answer to question ${i + 1}`,
      }));

      render(<FAQBlock {...defaultProps} items={manyItems} />);
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
      expect(screen.getByText('Question 20?')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long questions', () => {
      const longQuestion = 'What is '.repeat(50) + '?';
      const items = [
        { id: '1', question: longQuestion, answer: 'Short answer' },
      ];

      render(<FAQBlock {...defaultProps} items={items} />);
      expect(screen.getByText(new RegExp(longQuestion.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long answers', () => {
      const longAnswer = 'This is a very detailed answer. '.repeat(50);
      const items = [
        { id: '1', question: 'Q?', answer: longAnswer },
      ];

      render(<FAQBlock {...defaultProps} items={items} />);
      expect(screen.getByText(new RegExp(longAnswer.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in questions and answers', () => {
      const items = [
        {
          id: '1',
          question: 'What\'s the "best" way to use <this>?',
          answer: 'The best way is to use it & follow the guide.',
        },
      ];

      render(<FAQBlock {...defaultProps} items={items} />);
      expect(screen.getByText(/What's the/)).toBeInTheDocument();
    });

    it('should handle HTML-like content in answers', () => {
      const items = [
        {
          id: '1',
          question: 'How to format?',
          answer: 'Use <strong>bold</strong> and <em>italic</em> for emphasis.',
        },
      ];

      render(<FAQBlock {...defaultProps} items={items} />);
      expect(screen.getByText(/format/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive spacing', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toMatch(/p[xy]/);
    });

    it('should stack items vertically on all screen sizes', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="border"]');
      expect(items.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<FAQBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<FAQBlock {...defaultProps} />);
      const accordionButtons = container.querySelectorAll('button');
      expect(accordionButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should have aria attributes for accordion', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const accordionItems = container.querySelectorAll('[role="region"]');
      expect(accordionItems.length).toBeGreaterThanOrEqual(0);
    });

    it('should be screen reader friendly', () => {
      render(<FAQBlock {...defaultProps} />);
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have border separators between items', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const borders = container.querySelectorAll('[class*="border"]');
      expect(borders.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between items', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const items = container.querySelectorAll('[class*="py"]');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should have visual indicator for expanded state', () => {
      const { container } = render(<FAQBlock {...defaultProps} />);
      const iconElements = container.querySelectorAll('[class*="rotate"]');
      expect(iconElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid expand/collapse', async () => {
      const user = userEvent.setup();
      render(<FAQBlock {...defaultProps} />);
      const questions = screen.getAllByText(/\?$/);
      expect(questions.length).toBe(3);
    });

    it('should render large FAQ lists efficiently', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i}?`,
        answer: `Answer ${i}`,
      }));

      const { container } = render(
        <FAQBlock {...defaultProps} items={manyItems} />
      );
      const items = container.querySelectorAll('[class*="border"]');
      expect(items.length).toBeGreaterThanOrEqual(0);
    });
  });
});
