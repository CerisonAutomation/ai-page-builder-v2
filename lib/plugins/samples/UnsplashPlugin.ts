/**
 * Unsplash Plugin - Add beautiful free images from Unsplash
 */

import { Plugin, PluginCategory, PluginContext } from '../types';
import { createPlugin, createBlock, createIntegration, validators } from '../sdk/PluginSDK';

/**
 * Unsplash Image Block Component (placeholder - actual React component would be needed)
 */
const UnsplashImageBlockRender = (props: any) => {
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <img
        src={props.imageUrl || 'https://via.placeholder.com/600x400'}
        alt={props.alt || 'Unsplash image'}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: props.borderRadius || '0',
        }}
      />
      {props.showCredit && (
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Photo by {props.photographer} on{' '}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
            Unsplash
          </a>
        </p>
      )}
    </div>
  );
};

export const unsplashPlugin: Plugin = {
  manifest: {
    id: '@apb-plugins/unsplash-images',
    name: 'Unsplash Images',
    version: '1.0.0',
    description:
      'Add beautiful free images from Unsplash to your pages with easy search and integration',
    author: 'AI Page Builder',
    license: 'MIT',
    homepage: 'https://github.com/ai-page-builder/unsplash-plugin',
    repository: 'https://github.com/ai-page-builder/unsplash-plugin',
    keywords: ['images', 'media', 'unsplash', 'stock-photos', 'photography'],
    category: PluginCategory.MEDIA,
    requiredPeerVersions: {
      'ai-page-builder': '>=1.0.0',
    },
    dependencies: {},
  },

  blocks: {
    unsplash_image: {
      name: 'unsplash_image',
      label: 'Unsplash Image',
      description: 'Display an image from Unsplash',
      icon: 'image',
      defaultProps: {
        imageUrl: '',
        alt: 'Unsplash image',
        borderRadius: '0',
        showCredit: true,
        photographer: 'Unknown',
      },
      fields: {
        imageUrl: {
          type: 'text',
          label: 'Image URL',
          description: 'URL of the image (search in Unsplash panel)',
        },
        alt: {
          type: 'text',
          label: 'Alt Text',
          description: 'Alternative text for accessibility',
        },
        photographer: {
          type: 'text',
          label: 'Photographer Name',
          description: 'Name of the photographer to credit',
        },
        borderRadius: {
          type: 'number',
          label: 'Border Radius (px)',
          description: 'Rounded corners',
        },
        showCredit: {
          type: 'checkbox',
          label: 'Show Credit',
          description: 'Display photographer credit',
        },
      },
      render: UnsplashImageBlockRender,
      example: {
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        alt: 'Mountain landscape',
        photographer: 'John Doe',
        borderRadius: 8,
        showCredit: true,
      },
    },
  },

  integrations: {
    unsplash_api: {
      id: 'unsplash_api',
      name: 'Unsplash API',
      baseUrl: 'https://api.unsplash.com',
      call: async (method: string, params: Record<string, any>) => {
        const apiKey = params.apiKey;
        if (!apiKey) {
          throw new Error('Unsplash API key not configured');
        }

        const query = params.query || '';
        const perPage = params.perPage || 20;
        const page = params.page || 1;

        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            query
          )}&per_page=${perPage}&page=${page}&client_id=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch from Unsplash API');
        }

        return response.json();
      },
    },
  },

  settings: {
    api_key: {
      name: 'api_key',
      label: 'Unsplash API Key',
      description: 'Get your free API key from https://unsplash.com/developers',
      type: 'string',
      required: true,
      placeholder: 'Your Unsplash API key',
      validation: validators.isRequired,
    },
    default_search: {
      name: 'default_search',
      label: 'Default Search Query',
      description: 'Default search term when opening image picker',
      type: 'string',
      default: 'nature',
    },
  },

  onLoad: async (context: PluginContext) => {
    context.logger.info('Unsplash plugin loaded');

    // Register event listeners
    context.on('page:created', () => {
      context.logger.debug('Page created event');
    });
  },

  onActivate: async () => {

  },

  onDeactivate: async () => {

  },

  onUnload: async () => {

  },
};

/**
 * Alternative plugin creation using builder API
 */
export function createUnsplashPluginWithBuilder(): Plugin {
  return createPlugin()
    .setId('@apb-plugins/unsplash-images')
    .setName('Unsplash Images')
    .setVersion('1.0.0')
    .setDescription('Add beautiful free images from Unsplash to your pages')
    .setAuthor('AI Page Builder')
    .setLicense('MIT')
    .setCategory(PluginCategory.MEDIA)
    .setKeywords(['images', 'media', 'unsplash', 'stock-photos'])
    .setHomepage('https://github.com/ai-page-builder/unsplash-plugin')
    .setRepository('https://github.com/ai-page-builder/unsplash-plugin')
    .addBlock('unsplash_image', {
      name: 'unsplash_image',
      label: 'Unsplash Image',
      description: 'Display an image from Unsplash',
      icon: 'image',
      defaultProps: {
        imageUrl: '',
        alt: 'Unsplash image',
        borderRadius: '0',
        showCredit: true,
      },
      fields: {
        imageUrl: {
          type: 'text',
          label: 'Image URL',
        },
        alt: {
          type: 'text',
          label: 'Alt Text',
        },
        borderRadius: {
          type: 'number',
          label: 'Border Radius',
        },
      },
      render: UnsplashImageBlockRender,
    })
    .addIntegration('unsplash_api', {
      id: 'unsplash_api',
      name: 'Unsplash API',
      baseUrl: 'https://api.unsplash.com',
    })
    .addSetting('api_key', {
      name: 'api_key',
      label: 'API Key',
      type: 'string',
      required: true,
    })
    .build();
}
