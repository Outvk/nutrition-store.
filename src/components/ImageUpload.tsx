"use client";
import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setPreview(URL.createObjectURL(file));

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        fileType: 'image/webp',
        useWebWorker: true,
      });

      setProgress(40);
      const supabase = createClient();
      const path = `products/${Date.now()}.webp`;

      const { error } = await supabase.storage
        .from('products')
        .upload(path, compressedFile, {
          contentType: 'image/webp',
        });

      if (error) throw error;
      
      setProgress(100);
      onUpload(path);
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {preview && (
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      {uploading && <div style={{ fontSize: '12px' }}>Uploading... {progress}%</div>}
    </div>
  );
}
