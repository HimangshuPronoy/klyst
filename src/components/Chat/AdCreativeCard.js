'use client';

import React from 'react';

export default function AdCreativeCard({ title, hook, text, visual, cta }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 672,
      backgroundColor: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
      marginTop: 16,
      marginBottom: 8
    }}>
      <div style={{
        background: 'linear-gradient(to right, rgba(249, 115, 22, 0.1), rgba(168, 85, 247, 0.1))',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{title || 'Ad Creative Concept'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { const content = `Hook: ${hook || ''}\nPrimary Text: ${text || ''}\nVisual: ${visual || ''}\nCTA: ${cta || 'Shop Now'}`; navigator.clipboard.writeText(content); }} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}>Copy</button>
        </div>
      </div>
      
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hook */}
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, margin: 0 }}>Hook / Headline</h4>
          <p style={{ fontSize: 14, color: '#fff', fontWeight: 500, margin: 0 }}>{hook || 'Insert hook here'}</p>
        </div>
        
        {/* Primary Text */}
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, margin: 0 }}>Primary Text</h4>
          <p style={{ fontSize: 14, color: '#d4d4d8', lineHeight: 1.6, margin: 0 }}>{text || 'Main ad copy goes here'}</p>
        </div>
        
        {/* Visual / Video Description */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            Visual / Video Direction
          </h4>
          <p style={{ fontSize: 14, color: '#a1a1aa', margin: 0 }}>{visual || 'Description of the visual asset or UGC layout.'}</p>
        </div>
        
        {/* CTA */}
        <div>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, margin: 0 }}>Call to Action</h4>
          <div style={{ display: 'inline-block', backgroundColor: '#27272a', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 4, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
            {cta || 'Shop Now'}
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#111', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12 }}>
        <button onClick={() => { const content = `Hook: ${hook || ''}\nPrimary Text: ${text || ''}\nVisual: ${visual || ''}\nCTA: ${cta || 'Shop Now'}`; navigator.clipboard.writeText(content); alert('Ad creative copied — ready to paste into Meta Ads Manager.'); }} style={{ flex: 1, fontSize: 14, backgroundColor: '#ea580c', color: '#fff', padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f97316'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#ea580c'}>Export to Clipboard</button>
      </div>
    </div>
  );
}
