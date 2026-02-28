'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BrandAssetsPage() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);
  const supabase = createClient();

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadMsg('Not authenticated.'); setUploading(false); return; }

    const uploaded = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(path, file, { upsert: true });

      if (!error) {
        const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(path);
        uploaded.push({ name: file.name, url: urlData.publicUrl, type: file.type, path });
      }
    }

    setAssets(prev => [...uploaded, ...prev]);
    setUploadMsg(uploaded.length > 0 ? `${uploaded.length} file(s) uploaded!` : 'Upload failed. Check storage bucket settings.');
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

  return (
    <div style={{ padding: '40px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: 0 }}>My Brand Assets</h1>
        </div>
        <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>
          Upload your brand's logos, images, and creative files to use across your workspace.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 16, padding: '48px 32px', textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer', marginBottom: 40,
          backgroundColor: dragOver ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.ai,.psd,.svg"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div style={{ color: '#a1a1aa', fontSize: 14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', marginBottom: 12, display: 'block', margin: '0 auto 12px' }}>
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
            Uploading...
          </div>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 16px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div style={{ fontSize: 15, color: '#fff', fontWeight: 500, marginBottom: 6 }}>
              Drop files here or <span style={{ color: '#f97316' }}>browse</span>
            </div>
            <div style={{ fontSize: 12, color: '#52525b' }}>
              PNG, JPG, SVG, PDF, AI, PSD supported
            </div>
          </>
        )}
      </div>

      {uploadMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 24, fontSize: 13,
          backgroundColor: uploadMsg.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${uploadMsg.includes('failed') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          color: uploadMsg.includes('failed') ? '#ef4444' : '#10b981'
        }}>
          {uploadMsg}
        </div>
      )}

      {/* Asset Grid */}
      {assets.length > 0 ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Uploaded Assets ({assets.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {assets.map((asset, i) => (
              <div key={i} style={{
                borderRadius: 12, overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}
                onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}
              >
                {isImage(asset.url) ? (
                  <div style={{
                    width: '100%', aspectRatio: '1/1',
                    backgroundImage: `url(${asset.url})`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }} />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '1/1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(249,115,22,0.08)'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                )}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                    {asset.name}
                  </div>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#f97316', textDecoration: 'none' }}>
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', color: '#52525b', fontSize: 14, marginTop: 24 }}>
          No assets uploaded yet. Drag and drop files above to get started.
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
