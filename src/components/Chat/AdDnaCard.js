'use client';

import React from 'react';

export default function AdDnaCard({ brandName, insights }) {
  return (
    <div style={{
      width: '100%', maxWidth: 720, backgroundColor: '#0a0a0a',
      border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.1)', marginBottom: 24, alignSelf: 'center'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))',
        borderBottom: '1px solid rgba(168, 85, 247, 0.1)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(168, 85, 247, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            Ad-DNA Analysis Complete <span style={{ fontSize: 11, padding: '2px 6px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderRadius: 12 }}>{brandName}</span>
          </h3>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '2px 0 0 0' }}>Extracted repeatable patterns from top 5% historical winners.</p>
        </div>
      </div>

      {/* DNA Insights Grid */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>The "Why?"</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {insights.map((insight, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start'
            }}>
              <div style={{ color: insight.color || '#f97316', marginTop: 2 }}>
                {insight.icon || <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e4e4e7', marginBottom: 4 }}>{insight.title}</div>
                <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>{insight.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ backgroundColor: '#111', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
       <span style={{ fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>Patterns unlocked. Ready for Angle Discovery.</span>
      </div>
    </div>
  );
}
