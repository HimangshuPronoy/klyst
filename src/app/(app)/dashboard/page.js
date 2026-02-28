'use client';

import React, { useState, useEffect } from 'react';
import AdThumbnailCard from '../../../components/Workspace/AdThumbnailCard';
import AdInspector from '../../../components/Workspace/AdInspector';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [ads, setAds] = useState([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadAds() {
      const { data, error } = await supabase
        .from('scraped_ads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setAds(data);
        if (data.length > 0) {
           setHasScanned(true); // If user already has ads, bypass the initial scanner screen
        }
      }
      setIsLoadingAds(false);
    }
    loadAds();
  }, [supabase]);

  const selectedAd = ads.find(ad => ad.id === selectedAdId);

  const runScrape = async () => {
    if (!scanUrl.trim()) return;
    
    setIsScanning(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || 'Scrape failed. Please try again.');
        return;
      }
      
      if (data.success && data.scrapedAds) {
        // Optimistically update UI
        setAds(prev => [...data.scrapedAds, ...prev]);
        setHasScanned(true);
        setScanUrl('');
      }
    } catch (error) {
       console.error("Error running scrape:", error);
       setErrorMsg('Network error — could not reach the server.');
    } finally {
       setIsScanning(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    await runScrape();
  };

  return (
    <div style={{ padding: '32px 40px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Error Toast */}
      {errorMsg && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, padding: '12px 20px', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400, animation: 'fadeIn 0.3s ease-out', backdropFilter: 'blur(12px)' }}>
          <span style={{ flex: 1 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}>&times;</button>
        </div>
      )}
      
      {/* 1. Initial State: The Scanner Input */}
      {!hasScanned && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 640, margin: '0 auto', width: '100%' }}>
           <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 30px rgba(249,115,22,0.3)' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
           </div>
           
           <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 12, textAlign: 'center' }}>Scrape Competitor Creative</h1>
           <p style={{ color: '#a1a1aa', fontSize: 15, textAlign: 'center', marginBottom: 40, lineHeight: 1.5 }}>
             Paste a brand&apos;s URL to intercept their active campaigns from the Meta Ad Library and extract visual DNA.
           </p>

           <form onSubmit={handleScan} style={{ width: '100%', position: 'relative' }}>
             <input 
               type="text"
               value={scanUrl}
               onChange={e => setScanUrl(e.target.value)}
               placeholder="e.g. lumina-skincare.com"
               disabled={isScanning}
               style={{
                 width: '100%', padding: '16px 24px', fontSize: 16, color: '#fff',
                 backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                 borderRadius: 16, outline: 'none', transition: 'all 0.3s',
                 boxShadow: isScanning ? '0 0 40px rgba(168, 85, 247, 0.2)' : 'none',
                 borderColor: isScanning ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255,255,255,0.1)'
               }}
               onFocus={e => e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)'}
               onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
             />
             <button 
               type="submit" 
               disabled={isScanning || !scanUrl.trim()}
               style={{
                 position: 'absolute', right: 8, top: 8, bottom: 8, padding: '0 24px',
                 backgroundColor: '#c084fc', border: 'none', borderRadius: 12,
                 color: '#fff', fontWeight: 600, fontSize: 14, cursor: isScanning ? 'default' : 'pointer',
                 opacity: scanUrl.trim() ? 1 : 0.5, transition: 'all 0.2s',
                 display: 'flex', alignItems: 'center', gap: 8
               }}
             >
               {isScanning ? (
                 <>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                   Extracting Data...
                 </>
               ) : 'Run Scrape'}
             </button>
           </form>
        </div>
      )}

      {/* 2. Post-Scan State: The Masonry Grid */}
      {hasScanned && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Search & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Top Performing Ads (Global)</h1>
            
            <div style={{ display: 'flex', gap: 12 }}>
               <input 
                 type="text" 
                 placeholder="Paste a new competitor URL to scrape..." 
                 value={scanUrl}
                 onChange={e => setScanUrl(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && runScrape()}
                 disabled={isScanning}
                 style={{
                   width: 320, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                   backgroundColor: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, outline: 'none'
                 }} 
               />
               <button onClick={runScrape} disabled={isScanning || !scanUrl.trim()} style={{
                 padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                 borderRadius: 12, color: '#fff', fontWeight: 500,
                 cursor: isScanning || !scanUrl.trim() ? 'not-allowed' : 'pointer',
                 transition: 'background 0.2s', opacity: isScanning || !scanUrl.trim() ? 0.5 : 1,
                 display: 'flex', alignItems: 'center', gap: 7
               }} onMouseOver={e => { if (!isScanning && scanUrl.trim()) e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)'; }} onMouseOut={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'}>
                 {isScanning ? (
                   <>
                     <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}><line x1='12' y1='2' x2='12' y2='6'/><line x1='12' y1='18' x2='12' y2='22'/><line x1='4.93' y1='4.93' x2='7.76' y2='7.76'/><line x1='16.24' y1='16.24' x2='19.07' y2='19.07'/><line x1='2' y1='12' x2='6' y2='12'/><line x1='18' y1='12' x2='22' y2='12'/><line x1='4.93' y1='19.07' x2='7.76' y2='16.24'/><line x1='16.24' y1='7.76' x2='19.07' y2='4.93'/></svg>
                     Scraping...
                   </>
                 ) : 'New Scrape'}
               </button>
            </div>
          </div>

          {/* Masonry Grid */}
          <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
             gap: 24,
             alignItems: 'start'
          }}>
             {isLoadingAds ? (
               <>
                 {[1, 2, 3].map(i => (
                   <div key={i} style={{ width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ width: '100%', aspectRatio: '1/1', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                     <div style={{ padding: 16 }}>
                       <div style={{ height: 14, width: '60%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 }} />
                       <div style={{ height: 10, width: '90%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)' }} />
                     </div>
                   </div>
                 ))}
               </>
             ) : ads.length === 0 ? (
               <div style={{ color: '#a1a1aa', fontSize: 14 }}>No ads found. Try running a scrape above.</div>
             ) : (
               ads.map(ad => (
                  <AdThumbnailCard 
                    key={ad.id} 
                    id={ad.id}
                    brand={ad.brand}
                    hook={ad.hook_text || ad.hook} // fallback for mock compatibility
                    spendEstimate={ad.spend_estimate || ad.spendEstimate}
                    daysActive={ad.days_active || ad.daysActive}
                    format={ad.format}
                    imageUrl={ad.image_url || ad.imageUrl}
                    onClick={setSelectedAdId} 
                  />
               ))
             )}
          </div>
        </div>
      )}
      
      {/* Slide Out Panel */}
      {selectedAd && (
         <AdInspector 
           adData={selectedAd} 
           onClose={() => setSelectedAdId(null)} 
         />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}} />
    </div>
  );
}
