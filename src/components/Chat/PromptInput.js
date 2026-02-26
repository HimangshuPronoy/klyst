'use client';

import React, { useState } from 'react';

export default function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: 896, margin: '0 auto', padding: 16 }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        backgroundColor: '#141414',
        border: `1px solid ${isFocused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 24,
        boxShadow: isFocused ? '0 0 40px rgba(124,58,237,0.1)' : '0 0 40px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
        overflow: 'hidden',
        padding: 8
      }}>
        
        {/* Attachment Button */}
        <button style={{
          padding: 12, color: '#a1a1aa', borderRadius: 16, backgroundColor: 'transparent',
          border: 'none', cursor: 'pointer', flexShrink: 0, marginBottom: 4, transition: 'all 0.2s'
        }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }} onMouseOut={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </button>

        {/* Multi-line TextField */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask Klyst to generate variations, analyze ROAS, or draft a creative brief..."
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none', color: '#fff',
            fontSize: 16, padding: '16px 8px', resize: 'none', outline: 'none',
            minHeight: 56, maxHeight: 200, fontFamily: 'inherit'
          }}
          rows={1}
        />

        {/* Submit Button */}
        <button 
          style={{
            padding: 12, flexShrink: 0, borderRadius: 16, marginBottom: 4, border: 'none',
            transition: 'all 0.2s',
            ...(prompt.trim() ? {
              backgroundColor: '#f97316', color: '#fff', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(249,115,22,0.4)'
            } : {
              backgroundColor: 'rgba(255,255,255,0.05)', color: '#71717a', cursor: 'not-allowed'
            })
          }}
          disabled={!prompt.trim()}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>

      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#71717a' }}>
        Klyst AI can make mistakes. Verify critical campaign metrics.
      </div>
    </div>
  );
}
