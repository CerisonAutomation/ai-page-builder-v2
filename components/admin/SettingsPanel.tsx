'use client';

import React, { useState } from 'react';

export function SettingsPanel() {
    const [apiKey, setApiKey] = useState('');
    const [theme, setTheme] = useState('light');

    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>
    );
  }

  export default SettingsPanel;
