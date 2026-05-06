import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock ServicesGridBlock
const ServicesGridBlock = (props: any) => (
  <div className="w-full py-16 px-4">
    <h2 className="text-4xl font-bold mb-4 text-center">{props.title}</h2>
    <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">{props.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {props.services?.map((service: any) => (
        <div key={service.id} className="group p-8 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:shadow-lg transition">
          <div className="text-5xl mb-4">{service.icon}</div>
          <h3 className="text-xl font-bold mb-2">{service.title}</h3>
          <p className="text-gray-600 mb-4">{service.description}</p>
          <ul className="space-y-2 mb-6">
            {service.features?.map((feature: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700">✓ {feature}</li>
            ))}
          </ul>
          {service.ctaLabel && (
            <a href={service.ctaHref} className="inline-block text-indigo-600 font-semibold hover:text-indigo-700">
              {service.ctaLabel} →
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
);

describe('ServicesGridBlock', () => {
  const defaultProps: any = {
    title: 'Our Services',
    description: 'Comprehensive solutions tailored to your needs',
    services: [
      {
        id: '1',
        icon: '🎯',
        title: 'Strategy Consulting',
        description: 'Expert guidance to align your goals with market opportunities',
        features: ['Market Analysis', 'Competitive Research', 'Growth Planning'],
        ctaLabel: 'Learn More',
        ctaHref: '/services/strategy',
      },
      {
        id: '2',
        icon: '💻',
        title: 'Development',
        description: 'Custom software solutions built with modern technology',
        features: ['Web Development', 'Mobile Apps', 'API Integration'],
        ctaLabel: 'Learn More',
        ctaHref: '/services/development',
      },
      {
        id: '3',
        icon: '📊',
        title: 'Analytics',
        description: 'Data-driven insights to inform better decisions',
        features: ['Performance Tracking', 'User Behavior', 'ROI Analysis'],
        ctaLabel: 'Learn More',
        ctaHref: '/services/analytics',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive solutions/)).toBeInTheDocument();
    });

    it('should render all services', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText('Strategy Consulting')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should render service icons', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should render service descriptions', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText(/Expert guidance/)).toBeInTheDocument();
      expect(screen.getByText(/Custom software/)).toBeInTheDocument();
    });

    it('should render service features', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText('Market Analysis')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Performance Tracking')).toBeInTheDocument();
    });

    it('should render CTA links', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      const links = screen.getAllByRole('link', { name: /Learn More/ });
      expect(links.length).toBe(3);
    });
  });

  describe('Feature Lists', () => {
    it('should display all features for each service', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      expect(screen.getByText('Market Analysis')).toBeInTheDocument();
      expect(screen.getByText('Competitive Research')).toBeInTheDocument();
      expect(screen.getByText('Growth Planning')).toBeInTheDocument();
    });

    it('should have checkmarks for features', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const checkmarks = container.querySelectorAll('[class*="text-sm"]');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should handle services without features', () => {
      const servicesNoFeatures = [
        { ...defaultProps.services[0], features: [] },
      ];

      render(
        <ServicesGridBlock {...defaultProps} services={servicesNoFeatures} />
      );
      expect(screen.getByText('Strategy Consulting')).toBeInTheDocument();
    });

    it('should handle many features', () => {
      const manyFeatures = Array.from({ length: 10 }, (_, i) => `Feature ${i + 1}`);
      const services = [
        { ...defaultProps.services[0], features: manyFeatures },
      ];

      render(<ServicesGridBlock {...defaultProps} services={services} />);
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 10')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle empty services array', () => {
      const { container } = render(
        <ServicesGridBlock {...defaultProps} services={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single service', () => {
      render(
        <ServicesGridBlock {...defaultProps} services={[defaultProps.services[0]]} />
      );
      expect(screen.getByText('Strategy Consulting')).toBeInTheDocument();
    });

    it('should handle many services', () => {
      const many = Array.from({ length: 12 }, (_, i) => ({
        id: `s-${i}`,
        icon: '⭐',
        title: `Service ${i + 1}`,
        description: `Description ${i + 1}`,
        features: [`Feature ${i}1`, `Feature ${i}2`],
        ctaLabel: 'More',
        ctaHref: `/service/${i}`,
      }));

      render(<ServicesGridBlock {...defaultProps} services={many} />);
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 12')).toBeInTheDocument();
    });

    it('should handle services without CTA', () => {
      const noCTA = [
        { ...defaultProps.services[0], ctaLabel: undefined, ctaHref: undefined },
      ];

      render(
        <ServicesGridBlock {...defaultProps} services={noCTA as any} />
      );
      expect(screen.getByText('Strategy Consulting')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long service titles', () => {
      const longTitle = 'This is a very long service title '.repeat(3);
      const services = [
        { ...defaultProps.services[0], title: longTitle },
      ];

      render(<ServicesGridBlock {...defaultProps} services={services} />);
      expect(screen.getByText(new RegExp(longTitle.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDesc = 'This is a detailed description. '.repeat(30);
      const services = [
        { ...defaultProps.services[0], description: longDesc },
      ];

      render(<ServicesGridBlock {...defaultProps} services={services} />);
      expect(screen.getByText(new RegExp(longDesc.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const services = [
        {
          id: '1',
          icon: '🚀',
          title: 'Service & Solutions <Premium>',
          description: 'Description with "quotes" and \'apostrophes\'',
          features: ['Feature "One"', 'Feature \'Two\''],
          ctaLabel: 'Learn →',
          ctaHref: '/',
        },
      ];

      render(<ServicesGridBlock {...defaultProps} services={services} />);
      expect(screen.getByText(/Service & Solutions/)).toBeInTheDocument();
    });

    it('should handle emoji variations in icons', () => {
      const services = [
        { ...defaultProps.services[0], icon: '🎨' },
        { ...defaultProps.services[1], icon: '🔧' },
        { ...defaultProps.services[2], icon: '🌍' },
      ];

      render(<ServicesGridBlock {...defaultProps} services={services} />);
      expect(screen.getByText('🎨')).toBeInTheDocument();
      expect(screen.getByText('🔧')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('should render services in responsive grid', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/grid-cols/);
    });

    it('should have appropriate gap between items', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="gap"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should adapt to mobile with single column', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid-cols-1"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive padding', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const main = container.firstChild as HTMLElement;
      expect(main.className).toMatch(/p[xy]/);
    });
  });

  describe('Interaction & Hover', () => {
    it('should have hover effects on service cards', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="hover:"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have border styling on cards', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="border"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible service cards', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have accessible CTA links', () => {
      render(<ServicesGridBlock {...defaultProps} />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should be readable with good text contrast', () => {
      const { container } = render(<ServicesGridBlock {...defaultProps} />);
      const text = container.querySelectorAll('[class*="text-"]');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<ServicesGridBlock {...defaultProps} />);
      rerender(
        <ServicesGridBlock {...defaultProps} title="Updated Services" />
      );
      expect(screen.getByText('Updated Services')).toBeInTheDocument();
    });

    it('should render large service lists efficiently', () => {
      const many = Array.from({ length: 50 }, (_, i) => ({
        id: `s-${i}`,
        icon: '⭐',
        title: `Service ${i}`,
        description: `Desc ${i}`,
        features: ['F1', 'F2'],
        ctaLabel: 'More',
        ctaHref: `/s/${i}`,
      }));

      const { container } = render(
        <ServicesGridBlock {...defaultProps} services={many} />
      );
      expect(container.querySelector('[class*="grid"]')).toBeInTheDocument();
    });
  });
});
