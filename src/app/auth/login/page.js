'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, Zap, ArrowRight } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#fafbfe',
    }}>
      {/* Left Panel — Branding */}
      <div style={{
        flex: '0 0 480px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px',
        background: 'white', borderRight: '1px solid rgba(0,0,0,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/landing" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <Zap size={22} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#f97316' }}>Kylst</span>
          </Link>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: 16 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6, marginBottom: 40 }}>
            Sign in to manage your campaigns, track performance, and close more deals.
          </p>

          {/* Testimonial */}
          <div style={{
            padding: 24, borderRadius: 16, background: 'rgba(249, 115, 22, 0.04)',
            border: '1px solid rgba(249, 115, 22, 0.08)',
          }}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
              &ldquo;Kylst tripled our reply rate in the first month. The warm-up feature alone is worth it.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#f97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12, fontWeight: 700,
              }}>AK</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Alex Kim</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Head of Sales, TechCorp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                padding: '12px 16px', marginBottom: 20, borderRadius: 10,
                background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.12)',
                color: '#dc2626', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, outline: 'none',
                    transition: 'border 0.2s', background: 'white',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, outline: 'none',
                    transition: 'border 0.2s', background: 'white',
                  }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
              background: '#f97316', color: 'white', fontWeight: 600, fontSize: 15,
              cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#9ca3af' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
