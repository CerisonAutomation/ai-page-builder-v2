'use client';

import React, { useState, useEffect } from 'react';

export function MediaLibrary() {
    const [media, setMedia] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      loadMedia();
    }, []);

    const loadMedia = async () => {
      try {
        const response = await fetch('/api/media/list');
        const data = await response.json();
        const files = data.files || [];
        setMedia(files);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Media Library</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {media.map((file) => (
              <div key={file.id} className="border rounded p-3">
                <img src={file.url} alt={file.filename} className="w-full h-32 object-cover rounded" />
                <p className="text-sm mt-2 truncate">{file.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  export default MediaLibrary;
