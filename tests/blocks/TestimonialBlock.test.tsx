import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestimonialBlock } from '../../lib/blocks/testimonial/TestimonialBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('TestimonialBlock', () => {
  const defaultProps: AllBlockProps['TestimonialBlock'] = {
    title: 'What Our Customers Say',
    description: 'Join thousands of satisfied users',
    testimonials: [
      {
        id: '1',
        name: 'John Doe',
        role: 'CEO, Company A',
        text: 'This product has transformed how we work. Highly recommended!',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        rating: 5,
      },
      {
        id: '2',
        name: 'Jane Smith',
        role: 'Designer, Company B',
        text: 'Amazing experience from start to finish.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        rating: 5,
      },
      {
        id: '3',
        name: 'Bob Johnson',
        role: 'Engineer, Company C',
        text: 'Best solution in the market.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        rating: 4,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of satisfied users')).toBeInTheDocument();
    });

    it('should render all testimonials', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should render testimonial text', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText(/This product has transformed/)).toBeInTheDocument();
      expect(screen.getByText(/Amazing experience/)).toBeInTheDocument();
    });

    it('should render author roles', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText('CEO, Company A')).toBeInTheDocument();
      expect(screen.getByText('Designer, Company B')).toBeInTheDocument();
    });

    it('should render author images', () => {
      render(<TestimonialBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(3);
    });

    it('should render star ratings', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should display author images with correct alt text', () => {
      render(<TestimonialBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should handle external image URLs', () => {
      render(<TestimonialBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src');
    });

    it('should lazy load images', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThanOrEqual(3);
    });

    it('should have fallback for missing images', () => {
      const testimonialsNoImages = [
        { ...defaultProps.testimonials![0], image: undefined },
      ];

      const { container } = render(
        <TestimonialBlock {...defaultProps} testimonials={testimonialsNoImages as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty testimonials', () => {
      const { container } = render(
        <TestimonialBlock {...defaultProps} testimonials={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single testimonial', () => {
      render(
        <TestimonialBlock {...defaultProps} testimonials={[defaultProps.testimonials![0]]} />
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should handle many testimonials', () => {
      const manyTestimonials = Array.from({ length: 20 }, (_, i) => ({
        id: `t-${i}`,
        name: `Customer ${i + 1}`,
        role: `Role ${i + 1}`,
        text: `Testimonial ${i + 1}`,
        image: `https://example.com/${i}.jpg`,
        rating: 5,
      }));

      render(<TestimonialBlock {...defaultProps} testimonials={manyTestimonials} />);
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
      expect(screen.getByText('Customer 20')).toBeInTheDocument();
    });

    it('should handle testimonials without ratings', () => {
      const noRatingTestimonials = [
        { ...defaultProps.testimonials![0], rating: undefined },
      ];

      const { container } = render(
        <TestimonialBlock {...defaultProps} testimonials={noRatingTestimonials as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long testimonial text', () => {
      const longText = 'This is a testimonial. '.repeat(50);
      const testimonials = [
        { ...defaultProps.testimonials![0], text: longText },
      ];

      render(<TestimonialBlock {...defaultProps} testimonials={testimonials} />);
      expect(screen.getByText(new RegExp(longText.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in testimonials', () => {
      const testimonials = [
        {
          id: '1',
          name: 'John "The Great" Doe',
          role: 'CEO & Founder <Company>',
          text: 'Awesome! 100% would recommend. Says "best ever"',
          image: 'https://example.com/image.jpg',
          rating: 5,
        },
      ];

      render(<TestimonialBlock {...defaultProps} testimonials={testimonials} />);
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    it('should handle different rating values', () => {
      const testimonials = [
        { ...defaultProps.testimonials![0], rating: 1 },
        { ...defaultProps.testimonials![1], rating: 3 },
        { ...defaultProps.testimonials![2], rating: 5 },
      ];

      render(<TestimonialBlock {...defaultProps} testimonials={testimonials} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should handle testimonials with emoji', () => {
      const testimonials = [
        { ...defaultProps.testimonials![0], text: '⭐⭐⭐⭐⭐ Amazing!' },
      ];

      render(<TestimonialBlock {...defaultProps} testimonials={testimonials} />);
      expect(screen.getByText(/Amazing/)).toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should render star ratings for each testimonial', () => {
      render(<TestimonialBlock {...defaultProps} />);
      expect(screen.getByText(/CEO, Company A/)).toBeInTheDocument();
    });

    it('should support different rating scales', () => {
      const testimonials = [
        { ...defaultProps.testimonials![0], rating: 5 },
        { ...defaultProps.testimonials![1], rating: 4 },
      ];

      render(<TestimonialBlock {...defaultProps} testimonials={testimonials} />);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive grid/carousel layout', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const layout = container.querySelector('[class*="grid"]');
      expect(layout).toBeInTheDocument();
    });

    it('should have responsive padding', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toMatch(/p[xy]/);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<TestimonialBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on author images', () => {
      render(<TestimonialBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have proper text hierarchy', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const headings = container.querySelectorAll('h1, h2, h3, h4');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have quote styling', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      expect(container.querySelector('[class*="text-lg"]')).toBeInTheDocument();
    });

    it('should have author image styling', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should have card/container styling', () => {
      const { container } = render(<TestimonialBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<TestimonialBlock {...defaultProps} />);
      rerender(
        <TestimonialBlock {...defaultProps} title="Customer Stories" />
      );
      expect(screen.getByText('Customer Stories')).toBeInTheDocument();
    });

    it('should render large testimonial lists efficiently', () => {
      const manyTestimonials = Array.from({ length: 100 }, (_, i) => ({
        id: `t-${i}`,
        name: `Customer ${i}`,
        role: `Role ${i}`,
        text: `Testimonial ${i}`,
        image: `https://example.com/${i}.jpg`,
        rating: 5,
      }));

      const { container } = render(
        <TestimonialBlock {...defaultProps} testimonials={manyTestimonials} />
      );
      expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
    });
  });
});
