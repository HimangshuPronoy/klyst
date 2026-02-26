'use client';

import { Suspense, useState } from 'react';
import { login, signup } from '../actions';
import { useSearchParams } from 'next/navigation';

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(192, 132, 252, 0.15), rgba(0, 0, 0, 1))',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Glassmorphic Container */}
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
        alignItems: 'center'
      }}>
        
        {/* Logo */}
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: '-1px' }}>K</span>
        </div>

        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          {isSignUp ? 'Create your Account' : 'Welcome Back'}
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
          {isSignUp ? 'Start scraping winning Meta ads in seconds' : 'Sign in to access the Ad Intelligence Board'}
        </p>

        {error && (
           <div style={{ width: '100%', padding: 12, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
             {decodeURIComponent(error)}
           </div>
        )}

        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Full Name — only shown during Sign Up */}
          {isSignUp && (
            <div>
              <label htmlFor="fullName" style={{ display: 'block', color: '#e4e4e7', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Full Name</label>
              <input 
                id="fullName" 
                name="fullName" 
                type="text" 
                required
                placeholder="Jane Doe"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ display: 'block', color: '#e4e4e7', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="you@agency.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', color: '#e4e4e7', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              minLength={6}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(192, 132, 252, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* TOS Checkbox — only on Sign Up */}
          {isSignUp && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
              <input type="checkbox" required style={{ marginTop: 3, accentColor: '#c084fc' }} />
              <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: '#c084fc', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#c084fc', textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>
          )}

          {/* Primary Action Button */}
          <button 
            formAction={isSignUp ? signup : login} 
            style={{
              width: '100%', padding: '14px', borderRadius: 12, backgroundColor: '#c084fc',
              color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
              transition: 'opacity 0.2s', marginTop: 8
            }}
            onMouseOver={e => e.target.style.opacity = '0.9'}
            onMouseOut={e => e.target.style.opacity = '1'}
          >
            {isSignUp ? 'Create Account' : 'Log In'}
          </button>
        </form>

        {/* Toggle Login / Sign Up */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ color: '#71717a', fontSize: 13 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          {' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
