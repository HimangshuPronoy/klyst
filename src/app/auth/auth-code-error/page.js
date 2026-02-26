'use client';

import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(239, 68, 68, 0.1), rgba(0, 0, 0, 1))',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: '40px 32px',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Authentication Error</h1>
        <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
          Something went wrong during sign-in. The authentication code was invalid or expired. Please try again.
        </p>

        <Link href="/auth/login" style={{
          width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#c084fc',
          color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none',
          textAlign: 'center', display: 'block', transition: 'opacity 0.2s'
        }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
