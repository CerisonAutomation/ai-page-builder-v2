# Plugin System Integration Guide

Quick reference for integrating the plugin system into your AI Page Builder instance.

## 🚀 5-Minute Setup

### Step 1: Initialize Registry in Layout

**File:** `app/layout.tsx` or top-level client component

```typescript
'use client';

import { useEffect } from 'react';
import { getPluginRegistry } from '@/lib/plugins';
import { unsplashPlugin, shopifyPlugin, stripePlugin } from '@/lib/plugins/samples';

export function RootLayout({ children }) {
  useEffect(() => {
    const initializePlugins = async () => {
      const registry = getPluginRegistry();
      
      // Register built-in sample plugins
      try {
        await registry.registerPlugin(unsplashPlugin);
        await registry.registerPlugin(shopifyPlugin);
        await registry.registerPlugin(stripePlugin);
      } catch (error) {
        console.warn('Failed to register plugins:', error);
      }
    };
    
    initializePlugins();
  }, []);

  return <>{children}</>;
}
```

### Step 2: Use Plugins in Puck Editor

**File:** `components/editor/PuckEditor.tsx`

```typescript
'use client';

import { Puck } from '@measured/puck';
import { getPluginRegistry } from '@/lib/plugins';
import puckConfig from '@/lib/puck/config';

export function PuckEditor({ pageData }) {
  const registry = getPluginRegistry();
  const pluginBlocks = registry.getBlocks();

  // Merge plugin blocks with Puck components
  const enhancedConfig = {
    ...puckConfig,
    components: {
      ...puckConfig.components,
      ...Object.fromEntries(
        Array.from(pluginBlocks).map(([id, block]) => [
          id,
          {
            render: block.render,
            fields: block.fields,
            defaultProps: block.defaultProps,
            description: block.description,
            icon: block.icon,
            example: block.example,
          },
        ])
      ),
    },
  };

  return (
    <Puck
      config={enhancedConfig}
      data={pageData}
      onPublish={(data) => {
        // Handle publish
      }}
    />
  );
}
```

### Step 3: Add Plugin Manager UI

**File:** `app/admin/plugins/page.tsx`

```typescript
'use client';

import { PluginManager } from '@/components/plugins/PluginManager';
import { getPluginRegistry } from '@/lib/plugins';

export default function PluginsPage() {
  const registry = getPluginRegistry();

  return (
    <div className="admin-container">
      <PluginManager
        registry={registry}
        onPluginsChange={() => {
          // Refresh page or trigger UI update
          window.location.reload();
        }}
      />
    </div>
  );
}
```

### Step 4: Add Link to Plugin Manager

**File:** `app/admin/layout.tsx` or navigation component

```typescript
<nav>
  <Link href="/admin/plugins">
    Plugin Manager
  </Link>
</nav>
```

## 📋 Checklist

- [ ] Initialize registry in layout or root component
- [ ] Register sample plugins (Unsplash, Shopify, Stripe)
- [ ] Merge plugin blocks into Puck config
- [ ] Add PluginManager component to admin area
- [ ] Add navigation link to plugin manager
- [ ] Test plugin blocks appear in editor
- [ ] Configure plugin settings (API keys, etc.)
- [ ] Test install/uninstall functionality
- [ ] Create custom plugins for your use case

## 🎯 Adding Plugin Settings to Admin

If you want users to configure plugin API keys:

**File:** `components/plugins/PluginSettings.tsx`

```typescript
'use client';

import { useState } from 'react';
import { PluginRegistry } from '@/lib/plugins';

export function PluginSettings({ registry }) {
  const [plugins, setPlugins] = useState(registry.getPlugins());

  const handleSaveSettings = async (pluginId: string, settings: Record<string, any>) => {
    try {
      await registry.updatePluginSettings(pluginId, settings);
      alert('Settings saved!');
    } catch (error) {
      alert(`Failed to save settings: ${error}`);
    }
  };

  return (
    <div className="plugin-settings">
      {plugins.map((plugin) => (
        <div key={plugin.id} className="plugin-settings-card">
          <h3>{plugin.manifest.name}</h3>
          
          <PluginSettingsForm
            plugin={plugin}
            onSave={(settings) => handleSaveSettings(plugin.id, settings)}
          />
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Creating Your First Custom Plugin

**File:** `lib/plugins/custom/MyFirstPlugin.ts`

```typescript
import { createPlugin, PluginCategory } from '@/lib/plugins';

export const myFirstPlugin = createPlugin()
  .setId('my-first-plugin')
  .setName('My First Plugin')
  .setVersion('1.0.0')
  .setDescription('My first awesome plugin')
  .setAuthor('Your Name')
  .setLicense('MIT')
  .setCategory(PluginCategory.BLOCK)
  .setKeywords(['custom', 'first'])
  
  .addBlock('greeting', {
    name: 'greeting',
    label: 'Greeting Block',
    description: 'A simple greeting block',
    defaultProps: {
      name: 'World',
      mood: 'happy',
    },
    fields: {
      name: {
        type: 'text',
        label: 'Name',
      },
      mood: {
        type: 'select',
        label: 'Mood',
        options: [
          { label: 'Happy 😊', value: 'happy' },
          { label: 'Excited 🎉', value: 'excited' },
          { label: 'Calm 🧘', value: 'calm' },
        ],
      },
    },
    render: ({ name, mood }) => {
      const moodEmojis = {
        happy: '😊',
        excited: '🎉',
        calm: '🧘',
      };

      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h1>{moodEmojis[mood as keyof typeof moodEmojis]} Hello, {name}!</h1>
        </div>
      );
    },
  })
  
  .onLoad(async (context) => {
    context.logger.info('My first plugin loaded!');
  })
  
  .build();
```

Then register it:

```typescript
import { myFirstPlugin } from '@/lib/plugins/custom/MyFirstPlugin';

const registry = getPluginRegistry();
await registry.registerPlugin(myFirstPlugin);
```

## 🛡️ Securing API Keys

**Never** store API keys in frontend code. Instead:

### Option 1: Environment Variables

Store in `.env.local`:

```
NEXT_PUBLIC_UNSPLASH_API_KEY=your_key_here
```

Then use in plugin settings form.

### Option 2: Backend Configuration

**File:** `app/api/plugins/settings/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { pluginId, settings } = await req.json();

  // Validate user is admin
  // Store settings securely (database with encryption)
  // Never return API keys to frontend

  return NextResponse.json({ success: true });
}
```

### Option 3: Server Actions

```typescript
'use server';

import { getPluginRegistry } from '@/lib/plugins';

export async function updatePluginSettings(
  pluginId: string,
  settings: Record<string, any>
) {
  // Verify user is admin
  const registry = getPluginRegistry();
  await registry.updatePluginSettings(pluginId, settings);
}
```

## 🔗 Common Integration Points

### Puck Editor Page
```typescript
// Show plugin blocks in editor
import { getPluginRegistry } from '@/lib/plugins';

const registry = getPluginRegistry();
const blocks = registry.getBlocks();
```

### Frontend Pages
```typescript
// Use plugin blocks in published pages
const blocks = registry.getBlocks();
blocks.forEach(([id, block]) => {
  // Register block for rendering
});
```

### Admin Dashboard
```typescript
// Show installed plugins and stats
import { PluginInstaller } from '@/lib/plugins/installer/PluginInstaller';

const installer = new PluginInstaller(registry);
const installed = installer.getInstalledPlugins();
```

### API Routes
```typescript
// Provide plugin data via API
export async function GET(req: Request) {
  const registry = getPluginRegistry();
  return Response.json({
    plugins: registry.getPlugins(),
    blocks: Array.from(registry.getBlocks()),
  });
}
```

## 📊 Monitoring Plugins

Get plugin diagnostics:

```typescript
const registry = getPluginRegistry();
const logger = registry.getLogger();
const storage = registry.getStorage();

// View logs
const debugLogs = logger.getLogs('debug');
console.log('Recent debug logs:', debugLogs);

// Check storage
const keys = await storage.keys();
console.log('Stored plugin data:', keys);

// View registered items
console.log('Plugins:', registry.getPlugins());
console.log('Blocks:', Array.from(registry.getBlocks()));
console.log('Fields:', Array.from(registry.getFields()));
console.log('Integrations:', Array.from(registry.getIntegrations()));
```

## 🚨 Troubleshooting

### Plugins not appearing in editor

1. Check plugins are registered:
```typescript
const registry = getPluginRegistry();
console.log(registry.getPlugins());
```

2. Check blocks are in registry:
```typescript
const blocks = registry.getBlocks();
console.log(Array.from(blocks.keys()));
```

3. Verify Puck config merging:
```typescript
const enhancedConfig = {
  ...puckConfig,
  components: {
    ...puckConfig.components,
    // Plugin blocks should be here
  },
};
console.log(enhancedConfig.components);
```

### API key not working

1. Check settings are saved:
```typescript
const settings = await registry.getPluginSettings('plugin-id');
console.log('Settings:', settings);
```

2. Verify credential format
3. Check API rate limits
4. Review logger for API errors

### Plugin won't load

1. Check manifest:
```typescript
const plugin = unsplashPlugin;
console.log('Manifest:', plugin.manifest);
```

2. Check for required fields:
```typescript
const required = ['id', 'name', 'version', 'description', 'author'];
for (const field of required) {
  console.log(`${field}:`, plugin.manifest[field]);
}
```

3. Review browser console for errors
4. Check registry logs:
```typescript
registry.getLogger().getLogs().forEach(log => console.log(log));
```

## 📚 Next Steps

1. ✅ Follow the 5-minute setup
2. ✅ Test with sample plugins
3. ✅ Add plugin manager UI
4. ✅ Create your first custom plugin
5. ✅ Configure API keys securely
6. ✅ Monitor plugin usage

## 🎓 Learn More

- **Plugin Types** - See `lib/plugins/types.ts`
- **Sample Plugins** - Review `lib/plugins/samples/`
- **Full Guide** - Read `lib/plugins/PLUGINS_GUIDE.md`
- **SDK Reference** - Check `lib/plugins/sdk/PluginSDK.ts`

## 💡 Tips

- Start with sample plugins to understand the pattern
- Use TypeScript for type safety
- Test plugins in browser console before publishing
- Monitor storage usage (localStorage has limits)
- Use environment variables for secrets
- Implement error handling in plugin code
- Add logging for debugging
- Document your plugin settings

## 🆘 Support

If you encounter issues:

1. Check this guide
2. Review sample plugins
3. Read comprehensive PLUGINS_GUIDE.md
4. Check browser console for errors
5. Review registry logs
6. Create minimal reproduction case

---

**You're ready to build plugins! 🚀**
