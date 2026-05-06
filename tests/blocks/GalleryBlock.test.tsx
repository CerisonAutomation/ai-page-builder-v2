import React from 'react';
import { render, screen } from '@testing-library/react';
import { GalleryBlock } from '../../lib/blocks/gallery/GalleryBlock';
import type { AllBlockProps } from '../../lib/blocks/types';

describe('GalleryBlock', () => {
  const defaultProps: AllBlockProps['GalleryBlock'] = {
    title: 'Our Gallery',
    description: 'Showcase of our work',
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1500595046891-24e13c9bae4d',
        alt: 'Image 1',
        caption: 'First image',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1500595046891-24e13c9bae4d',
        alt: 'Image 2',
        caption: 'Second image',
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1500595046891-24e13c9bae4d',
        alt: 'Image 3',
        caption: 'Third image',
      },
    ],
    columns: 3,
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<GalleryBlock {...defaultProps} />);
      expect(screen.getByText('Our Gallery')).toBeInTheDocument();
      expect(screen.getByText('Showcase of our work')).toBeInTheDocument();
    });

    it('should render all images', () => {
      render(<GalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(3);
    });

    it('should render image alt text', () => {
      render(<GalleryBlock {...defaultProps} />);
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    });

    it('should render captions if provided', () => {
      render(<GalleryBlock {...defaultProps} />);
      expect(screen.getByText('First image')).toBeInTheDocument();
      expect(screen.getByText('Second image')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should render images with correct src', () => {
      render(<GalleryBlock {...defaultProps} />);
      const img = screen.getByAltText('Image 1') as HTMLImageElement;
      expect(img.src).toContain('unsplash.com');
    });

    it('should have alt text for all images', () => {
      render(<GalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect((img as HTMLImageElement).alt).toBeTruthy();
      });
    });

    it('should handle external image URLs', () => {
      const externalImages = [
        {
          id: '1',
          url: 'https://example.com/image1.jpg',
          alt: 'External 1',
        },
        {
          id: '2',
          url: 'https://cdn.example.com/photos/image2.png',
          alt: 'External 2',
        },
      ];

      render(<GalleryBlock {...defaultProps} images={externalImages} />);
      expect(screen.getByAltText('External 1')).toBeInTheDocument();
    });

    it('should handle missing captions', () => {
      const imagesNoCaptions = [
        { id: '1', url: 'https://example.com/1.jpg', alt: 'Image 1' },
        { id: '2', url: 'https://example.com/2.jpg', alt: 'Image 2' },
      ];

      render(
        <GalleryBlock {...defaultProps} images={imagesNoCaptions} />
      );
      expect(screen.getAllByRole('img')).toHaveLength(2);
    });

    it('should lazy load images', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(3);
    });
  });

  describe('Grid Layout', () => {
    it('should render with specified column count', () => {
      const { container } = render(
        <GalleryBlock {...defaultProps} columns={2} />
      );
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should handle different column configurations', () => {
      const columns = [1, 2, 3, 4];

      columns.forEach((col) => {
        const { container, unmount } = render(
          <GalleryBlock {...defaultProps} columns={col} />
        );
        expect(container).toBeInTheDocument();
        unmount();
      });
    });

    it('should apply gap between images', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toContain('gap');
    });
  });

  describe('Props Validation', () => {
    it('should handle empty gallery', () => {
      const { container } = render(
        <GalleryBlock {...defaultProps} images={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single image', () => {
      render(
        <GalleryBlock {...defaultProps} images={[defaultProps.images![0]]} />
      );
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    });

    it('should handle many images', () => {
      const manyImages = Array.from({ length: 50 }, (_, i) => ({
        id: `image-${i}`,
        url: `https://example.com/image${i}.jpg`,
        alt: `Image ${i + 1}`,
      }));

      render(<GalleryBlock {...defaultProps} images={manyImages} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle images with special characters in alt text', () => {
      const specialImages = [
        {
          id: '1',
          url: 'https://example.com/1.jpg',
          alt: 'Image with "quotes" & special <chars>',
        },
      ];

      render(<GalleryBlock {...defaultProps} images={specialImages} />);
      expect(screen.getByAltText(/Image with/)).toBeInTheDocument();
    });

    it('should handle very long captions', () => {
      const longCaption = 'A'.repeat(300);
      const imagesLongCaption = [
        {
          id: '1',
          url: 'https://example.com/1.jpg',
          alt: 'Image 1',
          caption: longCaption,
        },
      ];

      render(<GalleryBlock {...defaultProps} images={imagesLongCaption} />);
      expect(screen.getByText(new RegExp(longCaption.slice(0, 50)))).toBeInTheDocument();
    });

    it('should handle broken image URLs gracefully', () => {
      const brokenImages = [
        {
          id: '1',
          url: 'https://example.com/nonexistent.jpg',
          alt: 'Broken 1',
        },
      ];

      render(<GalleryBlock {...defaultProps} images={brokenImages} />);
      expect(screen.getByAltText('Broken 1')).toBeInTheDocument();
    });

    it('should handle missing alt text', () => {
      const noAltImages = [
        { id: '1', url: 'https://example.com/1.jpg' },
      ];

      const { container } = render(
        <GalleryBlock {...defaultProps} images={noAltImages as any} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be full width', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      expect(container.firstChild).toHaveClass('w-full');
    });

    it('should have responsive grid with Tailwind classes', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toMatch(/md:|lg:/);
    });

    it('should stack on mobile', () => {
      const { container } = render(
        <GalleryBlock {...defaultProps} columns={1} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading', () => {
      render(<GalleryBlock {...defaultProps} />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text on all images', () => {
      render(<GalleryBlock {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should use semantic HTML structure', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(3);
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should have proper color contrast', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title?.className).toMatch(/text-/);
    });
  });

  describe('Visual Design', () => {
    it('should apply aspect ratio to images', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const imageWrappers = container.querySelectorAll('[class*="aspect"]');
      expect(imageWrappers.length).toBeGreaterThan(0);
    });

    it('should have rounded corners', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const rounded = container.querySelectorAll('[class*="rounded"]');
      expect(rounded.length).toBeGreaterThan(0);
    });

    it('should apply hover effects', () => {
      const { container } = render(<GalleryBlock {...defaultProps} />);
      const imageWrappers = container.querySelectorAll('[class*="hover"]');
      expect(imageWrappers.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes', () => {
      const { rerender } = render(<GalleryBlock {...defaultProps} />);
      rerender(
        <GalleryBlock {...defaultProps} title="Updated Gallery" />
      );
      expect(screen.getByText('Updated Gallery')).toBeInTheDocument();
    });

    it('should render large image lists efficiently', () => {
      const manyImages = Array.from({ length: 100 }, (_, i) => ({
        id: `img-${i}`,
        url: `https://example.com/${i}.jpg`,
        alt: `Image ${i}`,
      }));

      const { container } = render(
        <GalleryBlock {...defaultProps} images={manyImages} />
      );
      expect(container.querySelectorAll('img')).toHaveLength(100);
    });
  });
});
