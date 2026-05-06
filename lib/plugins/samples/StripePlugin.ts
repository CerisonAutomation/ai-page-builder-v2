/**
 * Stripe Plugin - Accept payments with Stripe checkout
 */

import { Plugin, PluginCategory, PluginContext } from '../types';
import { validators } from '../sdk/PluginSDK';

const StripeCheckoutBlockRender = (props: any) => {
  const handleCheckout = () => {
    if (props.onCheckoutClick) {
      props.onCheckoutClick();
    }
  };

  return (
    <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{props.title}</h3>

      {props.description && (
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>{props.description}</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {props.items &&
          props.items.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span>{item.name}</span>
              <span>${item.price}</span>
            </div>
          ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          paddingTop: '12px',
          borderTop: '2px solid #000',
        }}
      >
        <span>Total:</span>
        <span>${props.total || '0.00'}</span>
      </div>

      <button
        onClick={handleCheckout}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#6772e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {props.buttonText || 'Proceed to Checkout'}
      </button>

      {props.acceptedPayments && (
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999', textAlign: 'center' }}>
          We accept: {props.acceptedPayments.join(', ')}
        </p>
      )}
    </div>
  );
};

const StripePaymentFormBlockRender = (props: any) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>{props.formTitle || 'Payment Details'}</h3>

      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Card Number
          </label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Expiry
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>CVC</label>
            <input
              type="text"
              placeholder="123"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <button
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#6772e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Pay ${props.amount || '0.00'}
        </button>
      </form>
    </div>
  );
};

export const stripePlugin: Plugin = {
  manifest: {
    id: '@apb-plugins/stripe-checkout',
    name: 'Stripe Checkout',
    version: '1.0.0',
    description: 'Accept payments with Stripe checkout integration',
    author: 'AI Page Builder',
    license: 'MIT',
    homepage: 'https://github.com/ai-page-builder/stripe-plugin',
    repository: 'https://github.com/ai-page-builder/stripe-plugin',
    keywords: ['stripe', 'payments', 'checkout', 'billing', 'transactions'],
    category: PluginCategory.PAYMENT,
    requiredPeerVersions: {
      'ai-page-builder': '>=1.0.0',
    },
    dependencies: {
      '@stripe/stripe-js': '^3.0.0',
      '@stripe/react-stripe-js': '^2.0.0',
    },
  },

  blocks: {
    stripe_checkout: {
      name: 'stripe_checkout',
      label: 'Stripe Checkout',
      description: 'Display checkout summary with Stripe payment',
      icon: 'credit-card',
      defaultProps: {
        title: 'Checkout',
        description: 'Review your order and proceed to payment',
        items: [],
        total: '0.00',
        buttonText: 'Pay Now',
        acceptedPayments: ['Credit Card', 'Debit Card'],
      },
      fields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        description: {
          type: 'textarea',
          label: 'Description',
        },
        items: {
          type: 'json',
          label: 'Order Items',
          description: 'Array of { name, price } objects',
        },
        total: {
          type: 'number',
          label: 'Total Amount',
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
        },
      },
      render: StripeCheckoutBlockRender,
    },

    stripe_payment_form: {
      name: 'stripe_payment_form',
      label: 'Stripe Payment Form',
      description: 'Embedded payment form powered by Stripe',
      icon: 'credit-card',
      defaultProps: {
        formTitle: 'Payment Details',
        amount: '0.00',
      },
      fields: {
        formTitle: {
          type: 'text',
          label: 'Form Title',
        },
        amount: {
          type: 'number',
          label: 'Amount',
        },
      },
      render: StripePaymentFormBlockRender,
    },
  },

  integrations: {
    stripe_api: {
      id: 'stripe_api',
      name: 'Stripe API',
      baseUrl: 'https://api.stripe.com/v1',
      authenticate: async (credentials: Record<string, string>) => {
        const { secretKey } = credentials;
        if (!secretKey) {
          throw new Error('Stripe secret key not provided');
        }

        try {
          const response = await fetch('https://api.stripe.com/v1/charges', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
            },
          });

          return response.status === 200;
        } catch {
          return false;
        }
      },
      call: async (method: string, params: Record<string, any>) => {
        const { secretKey, action, data } = params;

        const response = await fetch(`https://api.stripe.com/v1/${action}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(data).toString(),
        });

        if (!response.ok) {
          throw new Error('Stripe API request failed');
        }

        return response.json();
      },
    },
  },

  settings: {
    publishable_key: {
      name: 'publishable_key',
      label: 'Stripe Publishable Key',
      description: 'Get from Stripe Dashboard > Developers > API Keys',
      type: 'string',
      required: true,
      placeholder: 'pk_live_...',
      validation: validators.isRequired,
    },
    secret_key: {
      name: 'secret_key',
      label: 'Stripe Secret Key',
      description: 'Keep this secret! Only use in backend',
      type: 'string',
      required: true,
      placeholder: 'sk_live_...',
      validation: validators.isRequired,
    },
    currency: {
      name: 'currency',
      label: 'Default Currency',
      description: 'Currency for charges',
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
    context.logger.info('Stripe plugin loaded');
  },

  onActivate: async () => {

  },

  onDeactivate: async () => {

  },
};
