'use client';

import React, { useState, useEffect } from 'react';

export default function AdInspector({ adData, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [visualDna, setVisualDna] = useState([]);
  const [transcriptHook, setTranscriptHook] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Extract DNA on mount
  useEffect(() => {
    async function extractDna() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: adData.id, brand: adData.brand, hook: adData.hook_text })
        });
        const data = await res.json();
        if (data.visualDna) setVisualDna(data.visualDna);
        if (data.transcriptHook) setTranscriptHook(data.transcriptHook);
      } catch (error) {
        console.error("Failed to extract DNA", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
    extractDna();
  }, [adData]);

  const handleRemix = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, adData: { brand: adData.brand, hook: transcriptHook || adData.hook_text } })
      });
      const data = await res.json();
      if (data.content) {
         setMessages(prev => [...prev, { role: 'system', content: data.content }]);
      }
    } catch (error) {
      console.error("Failed to remix", error);
      setMessages(prev => [...prev, { role: 'system', content: "Error: Could not reach Klyst AI API." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />

      {/* Slide Panel */}
      <div style={{
          position: 'fixed', top: 16, right: 16, bottom: 16, width: '480px',
          backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 24,
          boxShadow: '-10px 0 50px rgba(0,0,0,0.5)', zIndex: 110,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#fff' }}>Ad X-Ray Inspector</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#a1a1aa' }}>Analyzing {adData.brand} Creative</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Scrollable Data Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          
          {/* Ad Mini Preview */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 80, height: 120, borderRadius: 8, backgroundImage: `url(${adData.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>High Performer</div>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 4 }}>{adData.days_active} Days Active</div>
              <div style={{ fontSize: 13, color: '#a1a1aa' }}>Est. Spend: {adData.spend_estimate}</div>
            </div>
          </div>

          {/* DNA Extracted Section */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
            <h4 style={{ fontSize: 12, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0', fontWeight: 600 }}>Visual DNA Extracted</h4>
            
            {isAnalyzing ? (
              <div style={{ color: '#a1a1aa', fontSize: 13, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                 Klyst Vision Model analyzing frames...
              </div>
            ) : (
              visualDna.map((item, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#e4e4e7' }}>
                   <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#c084fc' }} />
                   {item}
                 </div>
              ))
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 12, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 600 }}>Transcript Hook</h4>
            <div style={{ fontSize: 14, color: '#fff', fontStyle: 'italic', lineHeight: 1.5, paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
              &quot;{isAnalyzing ? 'Extracting audio...' : (transcriptHook || adData.hook_text)}&quot;
            </div>
          </div>

          {/* Klyst Chat Remediation */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
             <h4 style={{ fontSize: 14, color: '#fff', fontWeight: 600, margin: '0 0 16px 0' }}>Remix with Klyst</h4>
             
             {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(168, 85, 247, 0.1)', color: '#e4e4e7', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                   {msg.content}
                </div>
             ))}
             {isTyping && <div style={{ color: '#c084fc', fontSize: 12, fontStyle: 'italic' }}>Klyst is generating...</div>}
          </div>

        </div>

        {/* Input Footer */}
        <div style={{ padding: 16, background: 'rgba(10,10,10,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
           <form onSubmit={handleRemix} style={{ display: 'flex', gap: 8 }}>
             <input 
               type="text" 
               value={inputValue}
               onChange={e => setInputValue(e.target.value)}
               placeholder="e.g. Remix this hook for Lumina Skincare..."
               style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '10px 16px', color: '#fff', outline: 'none', fontSize: 13 }}
             />
             <button type="submit" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#c084fc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
             </button>
           </form>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </>
  );
}
