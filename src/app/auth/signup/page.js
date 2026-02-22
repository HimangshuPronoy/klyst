'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Zap, ArrowRight, Check } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

const perks = [
  'Multi-step email sequences',
  'Automated inbox warm-up',
  'Real-time analytics dashboard',
  'Smart deliverability protection',
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
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
        <div style={{ position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.04)' }} />

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
            Start closing more deals today
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6, marginBottom: 36 }}>
            Join hundreds of sales teams using Kylst for smarter outreach.
          </p>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {perks.map((perk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'rgba(249, 115, 22, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', flexShrink: 0,
                }}>
                  <Check size={14} />
                </div>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{perk}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 40, padding: '16px 20px', borderRadius: 12,
            background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.08)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>Free forever plan</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>No credit card needed. Upgrade anytime.</div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Create your account</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>
            Set up your Kylst account in seconds
          </p>

          <form onSubmit={handleSignup}>
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe" required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, outline: 'none',
                    transition: 'border 0.2s', background: 'white',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
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
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6}
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
              {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
