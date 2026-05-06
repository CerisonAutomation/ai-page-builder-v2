/**
 * Shopify Plugin - Display and sell products directly from Shopify
 */

import React from 'react';
import { Plugin, PluginCategory, PluginContext } from '../types';
import { createPlugin, validators } from '../sdk/PluginSDK';

const ShopifyProductBlockRender = (props: any): React.ReactElement => {
    return (
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '100%',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <img
            src={props.productImage || 'https://via.placeholder.com/300x300'}
            alt={props.productTitle}
            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
          />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{props.productTitle}</h3>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
          {props.productDescription}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>
            ${props.productPrice}
          </span>
          <button
            style={{
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

const ShopifyProductGridBlockRender = (props: any): React.ReactElement => {
    const products = props.products || [];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
          gap: '16px',
        }}
      >
        {products.map((product: any, index: number) => (
          <div key={index} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '12px' }}>
            <img
              src={product.image || 'https://via.placeholder.com/200x200'}
              alt={product.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
            />
            <h4 style={{ margin: '8px 0', fontSize: '14px' }}>{product.title}</h4>
            <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>${product.price}</p>
          </div>
        ))}
      </div>
    );
  };

export const shopifyPlugin: Plugin = {
    manifest: {
      id: '@apb-plugins/shopify-products',
      name: 'Shopify Products',
      version: '1.0.0',
      description: 'Display and sell products directly from your Shopify store',
      author: 'AI Page Builder',
      license: 'MIT',
      homepage: 'https://github.com/ai-page-builder/shopify-plugin',
      repository: 'https://github.com/ai-page-builder/shopify-plugin',
      keywords: ['shopify', 'ecommerce', 'products', 'sales', 'store'],
      category: PluginCategory.ECOMMERCE,
      requiredPeerVersions: {
        'ai-page-builder': '>=1.0.0',
      },
      dependencies: {
        'shopify-buy': '^3.2.0',
      },
    },

    blocks: {
      shopify_product: {
        name: 'shopify_product',
        label: 'Shopify Product',
        description: 'Display a single product from your Shopify store',
        icon: 'shopping-bag',
        defaultProps: {
          productId: '',
          productTitle: 'Product Title',
          productDescription: 'Product description',
          productPrice: '99.99',
          productImage: '',
        },
        fields: {
          productId: {
            type: 'text',
            label: 'Product ID',
            description: 'Shopify product ID',
          },
          productTitle: {
            type: 'text',
            label: 'Title',
          },
          productDescription: {
            type: 'textarea',
            label: 'Description',
          },
          productPrice: {
            type: 'number',
            label: 'Price',
          },
          productImage: {
            type: 'text',
            label: 'Image URL',
          },
        },
        render: ShopifyProductBlockRender,
      },

      shopify_products_grid: {
        name: 'shopify_products_grid',
        label: 'Shopify Products Grid',
        description: 'Display multiple products in a grid',
        icon: 'grid',
        defaultProps: {
          collectionId: '',
          columns: 3,
          products: [],
        },
        fields: {
          collectionId: {
            type: 'text',
            label: 'Collection ID',
            description: 'Display products from this Shopify collection',
          },
          columns: {
            type: 'number',
            label: 'Columns',
            description: 'Number of columns',
          },
          products: {
            type: 'json',
            label: 'Products',
            description: 'Product data (auto-populated from collection)',
          },
        },
        render: ShopifyProductGridBlockRender,
      },
    },

    integrations: {
      shopify_api: {
        id: 'shopify_api',
        name: 'Shopify Storefront API',
        baseUrl: 'https://{shop}.myshopify.com/api/2024-01/graphql.json',
        authenticate: async (credentials: Record<string, string>) => {
          const { storefrontAccessToken, shopName } = credentials;
          if (!storefrontAccessToken || !shopName) {
            throw new Error('Missing Shopify credentials');
          }

          try {
            const response = await fetch(
              `https://${shopName}.myshopify.com/api/2024-01/graphql.json`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                },
                body: JSON.stringify({
                  query: '{ shop { name } }',
                }),
              }
            );

            return response.ok;
          } catch {
            return false;
          }
        },
        call: async (method: string, params: Record<string, any>) => {
          const { query, variables } = params;
          const response = await fetch(params.baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': params.accessToken,
            },
            body: JSON.stringify({ query, variables }),
          });

          if (!response.ok) {
            throw new Error('Shopify API request failed');
          }

          return response.json();
        },
      },
    },

    settings: {
      shop_name: {
        name: 'shop_name',
        label: 'Shopify Store Name',
        description: 'Your Shopify store name (without .myshopify.com)',
        type: 'string',
        required: true,
        placeholder: 'mystore',
        validation: validators.isRequired,
      },
      storefront_access_token: {
        name: 'storefront_access_token',
        label: 'Storefront Access Token',
        description: 'Get from Shopify Admin > Apps and sales channels > Settings',
        type: 'string',
        required: true,
        placeholder: 'shpua_...',
        validation: validators.isRequired,
      },
      currency: {
        name: 'currency',
        label: 'Currency',
        description: 'Display currency for prices',
        type: 'select',
        default: 'USD',
        options: [
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
          { label: 'CAD', value: 'CAD' },
          { label: 'AUD', value: 'AUD' },
        ],
      },
    },

    onLoad: async (context: PluginContext) => {
      context.logger.info('Shopify plugin loaded');
    },

    onActivate: async () => {

    },

    onDeactivate: async () => {

    },
  };
