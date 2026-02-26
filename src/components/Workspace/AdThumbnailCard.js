'use client';

import React from 'react';

export default function AdThumbnailCard({ id, brand, hook, spendEstimate, daysActive, format, imageUrl, onClick }) {
  return (
    <div 
      onClick={() => onClick(id)}
      style={{
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(168, 85, 247, 0.15)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Media Mockup */}
      <div style={{
        width: '100%',
        aspectRatio: format === 'Vertical Video' ? '9/16' : '1/1',
        backgroundColor: '#18181b', // Dark fallback
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlays */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          <div style={{ padding: '4px 8px', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: 10, fontWeight: 600, color: '#fff' }}>
            {daysActive} Days Active
          </div>
        </div>
        
        {format === 'Vertical Video' && (
           <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
           </div>
        )}
      </div>

      {/* Meta Data */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
           <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{brand}</span>
           <span style={{ fontSize: 11, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 6 }}>
             Est. Spend: {spendEstimate}
           </span>
        </div>
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "<span style={{ color: '#fff' }}>{hook}</span>"
        </p>
      </div>
    </div>
  );
}
