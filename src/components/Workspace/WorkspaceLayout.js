'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inter, Playfair_Display } from 'next/font/google';
import { createClient } from '@/utils/supabase/client';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });

export default function WorkspaceLayout({ children }) {
  const [trackedBrands, setTrackedBrands] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from('scraped_ads')
        .select('brand, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Deduplicate by brand name, keep latest
        const seen = new Map();
        data.forEach(row => {
          if (!seen.has(row.brand)) {
            seen.set(row.brand, row);
          }
        });
        setTrackedBrands(Array.from(seen.values()));
      }
    }
    loadBrands();
  }, [supabase]);
  return (
    <div className={inter.className} style={{
      display: 'flex',
      backgroundColor: '#020202', // Very deep black
      color: '#fff',
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(234, 88, 12, 0.05), transparent 40%)'
    }}>
      {/* Translucent Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: 'rgba(5, 5, 5, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50
      }}>
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className={playfair.className} style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>K</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '0.01em' }}>Ad Intelligence</div>
              <div style={{ fontSize: 11, color: '#a1a1aa', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>Workspace</div>
            </div>
          </div>
        </div>

        {/* Global Navigation */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
             { name: 'Meta Ad Library', active: true, comingSoon: false },
             { name: 'TikTok Creative Center', active: false, comingSoon: true },
             { name: 'My Brand Assets', active: false, comingSoon: true }
          ].map((item, i) => (
             <div key={i} style={{
               padding: '10px 14px', borderRadius: 10, cursor: item.comingSoon ? 'default' : 'pointer',
               backgroundColor: item.active ? 'rgba(255,255,255,0.05)' : 'transparent',
               color: item.active ? '#fff' : '#71717a',
               fontSize: 14, fontWeight: 500,
               transition: 'all 0.2s',
               border: item.active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
               display: 'flex', alignItems: 'center', justifyContent: 'space-between',
               opacity: item.comingSoon ? 0.5 : 1
             }} onMouseOver={!item.active && !item.comingSoon ? e => e.currentTarget.style.color = '#fff' : undefined} 
                onMouseOut={!item.active && !item.comingSoon ? e => e.currentTarget.style.color = '#a1a1aa' : undefined}>
                <span>{item.name}</span>
                {item.comingSoon && (
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soon</span>
                )}
             </div>
          ))}
        </nav>

        {/* Saved Campaigns */}
        <div style={{ padding: '16px', flex: 1 }}>
           <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, paddingLeft: 14 }}>
              {trackedBrands.length > 0 ? 'Tracked Brands' : 'No brands yet'}
           </div>
           {trackedBrands.length === 0 && (
              <div style={{ padding: '8px 14px', color: '#52525b', fontSize: 13 }}>
                Scrape a URL to start tracking brands.
              </div>
           )}
           {trackedBrands.map((item, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 8,
                color: '#a1a1aa', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'color 0.2s'
              }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                   {item.brand}
                 </span>
                 <span style={{ fontSize: 10, color: '#52525b' }}>tracked</span>
              </div>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
