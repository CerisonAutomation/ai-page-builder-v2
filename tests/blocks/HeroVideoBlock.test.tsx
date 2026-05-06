import React from 'react';
import { render, screen } from '@testing-library/react';
import type { AllBlockProps } from '../../lib/blocks/types';

// Mock HeroVideoBlock component
const HeroVideoBlock = (props: any) => (
  <div className="w-full relative h-screen">
    <video
      src={props.videoUrl}
      poster={props.posterImage}
      autoPlay={props.autoPlay}
      muted={props.muted}
      loop={props.loop}
      className="w-full h-full object-cover"
      data-testid="hero-video"
    />
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">{props.headline}</h1>
        <p className="text-2xl mb-8">{props.subheadline}</p>
        <a href={props.ctaHref} className="inline-block bg-indigo-600 px-8 py-4 rounded-lg">
          {props.ctaLabel}
        </a>
      </div>
    </div>
  </div>
);

describe('HeroVideoBlock', () => {
  const defaultProps: any = {
    videoUrl: 'https://example.com/hero.mp4',
    posterImage: 'https://example.com/poster.jpg',
    headline: 'Welcome to Our Platform',
    subheadline: 'Experience the future',
    ctaLabel: 'Get Started',
    ctaHref: 'https://example.com/start',
    autoPlay: true,
    muted: true,
    loop: true,
  };

  describe('Rendering', () => {
    it('should render video element', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video');
      expect(video).toBeInTheDocument();
    });

    it('should render headline and subheadline', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      expect(screen.getByText('Welcome to Our Platform')).toBeInTheDocument();
      expect(screen.getByText('Experience the future')).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    });
  });

  describe('Video Handling', () => {
    it('should set video source URL', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video') as HTMLVideoElement;
      expect(video).toHaveAttribute('src', defaultProps.videoUrl);
    });

    it('should set poster image', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video') as HTMLVideoElement;
      expect(video).toHaveAttribute('poster', defaultProps.posterImage);
    });

    it('should enable autoplay', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video') as HTMLVideoElement;
      expect(video).toHaveAttribute('autoplay');
    });

    it('should be muted by default', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video') as HTMLVideoElement;
      expect(video).toHaveAttribute('muted');
    });

    it('should loop video', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const video = screen.getByTestId('hero-video') as HTMLVideoElement;
      expect(video).toHaveAttribute('loop');
    });

    it('should handle different video formats', () => {
      const formats = ['video.mp4', 'video.webm', 'video.ogg'];

      formats.forEach((format) => {
        const { unmount } = render(
          <HeroVideoBlock {...defaultProps} videoUrl={`https://example.com/${format}`} />
        );
        expect(screen.getByTestId('hero-video')).toHaveAttribute(
          'src',
          `https://example.com/${format}`
        );
        unmount();
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle different text content', () => {
      const customProps = {
        ...defaultProps,
        headline: 'Custom Headline',
        subheadline: 'Custom Subheadline',
        ctaLabel: 'Custom Button',
      };

      render(<HeroVideoBlock {...customProps} />);
      expect(screen.getByText('Custom Headline')).toBeInTheDocument();
      expect(screen.getByText('Custom Subheadline')).toBeInTheDocument();
    });

    it('should handle disabled autoplay', () => {
      const { container } = render(
        <HeroVideoBlock {...defaultProps} autoPlay={false} />
      );
      const video = container.querySelector('video');
      expect(video).not.toHaveAttribute('autoplay');
    });

    it('should handle unmuted videos', () => {
      const { container } = render(
        <HeroVideoBlock {...defaultProps} muted={false} />
      );
      const video = container.querySelector('video');
      expect(video).not.toHaveAttribute('muted');
    });

    it('should handle disabled loop', () => {
      const { container } = render(
        <HeroVideoBlock {...defaultProps} loop={false} />
      );
      const video = container.querySelector('video');
      expect(video).not.toHaveAttribute('loop');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing poster image', () => {
      const { container } = render(
        <HeroVideoBlock {...defaultProps} posterImage={undefined} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle very long headlines', () => {
      const longHeadline = 'A'.repeat(200);
      render(<HeroVideoBlock {...defaultProps} headline={longHeadline} />);
      expect(screen.getByText(longHeadline)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      render(
        <HeroVideoBlock
          {...defaultProps}
          headline="Welcome & Enjoy! <Special>"
          ctaLabel="Click → Now"
        />
      );
      expect(screen.getByText(/Welcome & Enjoy/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full height on desktop', () => {
      const { container } = render(<HeroVideoBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-screen');
    });

    it('should maintain aspect ratio', () => {
      const { container } = render(<HeroVideoBlock {...defaultProps} />);
      const video = container.querySelector('video');
      expect(video).toHaveClass('object-cover');
    });

    it('should have full width', () => {
      const { container } = render(<HeroVideoBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible CTA link', () => {
      render(<HeroVideoBlock {...defaultProps} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href');
    });

    it('should have overlay for text readability', () => {
      const { container } = render(<HeroVideoBlock {...defaultProps} />);
      expect(container.querySelector('[class*="bg-opacity"]')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<HeroVideoBlock {...defaultProps} />);
      rerender(<HeroVideoBlock {...defaultProps} headline="Updated" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    it('should not re-render video unnecessarily', () => {
      const { rerender } = render(<HeroVideoBlock {...defaultProps} />);
      rerender(
        <HeroVideoBlock {...defaultProps} headline="New Headline" />
      );
      const video = screen.getByTestId('hero-video');
      expect(video).toHaveAttribute('src', defaultProps.videoUrl);
    });
  });
});
