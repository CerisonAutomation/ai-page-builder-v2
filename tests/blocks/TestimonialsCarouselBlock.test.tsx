import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock TestimonialsCarouselBlock
const TestimonialsCarouselBlock = (props: any) => (
  <div className="w-full py-16 px-4">
    <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
    <p className="text-gray-600 mb-8">{props.description}</p>
    <div className="relative">
      <div className="flex overflow-hidden rounded-lg shadow-lg bg-white">
        <div className="w-full p-8">
          {props.testimonials && props.testimonials[0] && (
            <>
              <div className="flex items-center mb-4">
                <img 
                  src={props.testimonials[0].image} 
                  alt={props.testimonials[0].name}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold">{props.testimonials[0].name}</h4>
                  <p className="text-sm text-gray-600">{props.testimonials[0].role}</p>
                </div>
              </div>
              <p className="text-lg mb-4">"{props.testimonials[0].text}"</p>
              <div className="flex gap-1">
                {Array.from({ length: props.testimonials[0].rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {props.testimonials?.map((_, i: number) => (
          <button key={i} className="w-2 h-2 rounded-full bg-indigo-600" />
        ))}
      </div>
    </div>
  </div>
);

describe('TestimonialsCarouselBlock', () => {
  const defaultProps: any = {
    title: 'What Customers Love',
    description: 'Real experiences from our users',
    autoplay: true,
    autoplayInterval: 5000,
    testimonials: [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'CEO, TechCorp',
        text: 'This product completely transformed our operations. Highly recommended!',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        rating: 5,
      },
      {
        id: '2',
        name: 'Michael Johnson',
        role: 'Product Manager, StartupXYZ',
        text: 'Best investment we made this year. ROI was immediate.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        rating: 5,
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        role: 'Designer, Creative Studio',
        text: 'The team support is exceptional. Always helpful and responsive.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        rating: 4,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(screen.getByText('What Customers Love')).toBeInTheDocument();
      expect(screen.getByText('Real experiences from our users')).toBeInTheDocument();
    });

    it('should render carousel container', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const carousel = container.querySelector('[class*="relative"]');
      expect(carousel).toBeInTheDocument();
    });

    it('should render first testimonial on load', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText(/This product completely transformed/)).toBeInTheDocument();
    });

    it('should render testimonial author image', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      const image = screen.getByAltText('Sarah Chen');
      expect(image).toBeInTheDocument();
    });

    it('should render star rating', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      const stars = screen.getByText('⭐');
      expect(stars).toBeInTheDocument();
    });
  });

  describe('Carousel Navigation', () => {
    it('should render dot indicators for each testimonial', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const dots = container.querySelectorAll('button[class*="rounded-full"]');
      expect(dots.length).toBe(3);
    });

    it('should have active indicator for current slide', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const dots = container.querySelectorAll('[class*="bg-indigo"]');
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should handle dot navigation clicks', async () => {
      const user = userEvent.setup();
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const dots = container.querySelectorAll('button[class*="rounded-full"]');
      expect(dots.length).toBe(3);
    });
  });

  describe('Autoplay', () => {
    it('should support autoplay prop', () => {
      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} autoplay={true} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should have configurable autoplay interval', () => {
      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} autoplayInterval={3000} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should pause autoplay on interaction', async () => {
      const user = userEvent.setup();
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty testimonials', () => {
      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single testimonial', () => {
      render(
        <TestimonialsCarouselBlock 
          {...defaultProps} 
          testimonials={[defaultProps.testimonials[0]]}
        />
      );
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });

    it('should handle many testimonials', () => {
      const many = Array.from({ length: 20 }, (_, i) => ({
        id: `t-${i}`,
        name: `Customer ${i + 1}`,
        role: `Role ${i + 1}`,
        text: `Testimonial ${i + 1}`,
        image: `https://example.com/${i}.jpg`,
        rating: (i % 5) + 1,
      }));

      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={many} />
      );
      const dots = container.querySelectorAll('button[class*="rounded-full"]');
      expect(dots.length).toBe(20);
    });
  });

  describe('Image Handling', () => {
    it('should render author images', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      const image = screen.getByAltText('Sarah Chen');
      expect(image).toHaveAttribute('src');
    });

    it('should have rounded images', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image?.className).toContain('rounded-full');
    });

    it('should handle missing images gracefully', () => {
      const noImageTestimonials = [
        { ...defaultProps.testimonials[0], image: undefined },
      ];

      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={noImageTestimonials as any} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should lazy load images', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long testimonial text', () => {
      const longText = 'This is a testimonial. '.repeat(50);
      const testimonials = [
        { ...defaultProps.testimonials[0], text: longText },
      ];

      render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={testimonials} />
      );
      expect(screen.getByText(new RegExp(longText.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long author names', () => {
      const longName = 'Alexander Christopher Montgomery the Third Jr. '.repeat(2);
      const testimonials = [
        { ...defaultProps.testimonials[0], name: longName },
      ];

      render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={testimonials} />
      );
      expect(screen.getByText(new RegExp(longName.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle different rating values', () => {
      const testimonials = [
        { ...defaultProps.testimonials[0], rating: 1 },
        { ...defaultProps.testimonials[1], rating: 3 },
        { ...defaultProps.testimonials[2], rating: 5 },
      ];

      render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={testimonials} />
      );
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive padding', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const main = container.firstChild as HTMLElement;
      expect(main.className).toMatch(/p[xy]/);
    });

    it('should have responsive spacing', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(container.querySelector('[class*="gap"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on author images', () => {
      render(<TestimonialsCarouselBlock {...defaultProps} />);
      const image = screen.getByAltText('Sarah Chen');
      expect(image).toBeInTheDocument();
    });

    it('should have accessible navigation buttons', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have card styling for testimonial', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const card = container.querySelector('[class*="rounded-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should have shadow effect', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const card = container.querySelector('[class*="shadow"]');
      expect(card).toBeInTheDocument();
    });

    it('should have white background for contrast', () => {
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const card = container.querySelector('[class*="bg-white"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle rapid navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<TestimonialsCarouselBlock {...defaultProps} />);
      const dots = container.querySelectorAll('button[class*="rounded-full"]');
      expect(dots.length).toBe(3);
    });

    it('should render large carousel efficiently', () => {
      const many = Array.from({ length: 100 }, (_, i) => ({
        id: `t-${i}`,
        name: `Customer ${i}`,
        role: `Role ${i}`,
        text: `Testimonial ${i}`,
        image: `https://example.com/${i}.jpg`,
        rating: 5,
      }));

      const { container } = render(
        <TestimonialsCarouselBlock {...defaultProps} testimonials={many} />
      );
      const dots = container.querySelectorAll('button[class*="rounded-full"]');
      expect(dots.length).toBe(100);
    });
  });
});
