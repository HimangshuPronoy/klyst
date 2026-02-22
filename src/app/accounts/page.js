'use client';

import { useEffect, useState } from 'react';
import { Plus, Mail, Shield, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ProgressRing from '@/components/ProgressRing';

const PROVIDER_DEFAULTS = {
  Gmail: { smtp_host: 'smtp.gmail.com', smtp_port: 587 },
  Outlook: { smtp_host: 'smtp.office365.com', smtp_port: 587 },
  SMTP: { smtp_host: '', smtp_port: 587 },
};

export default function AccountsPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newProvider, setNewProvider] = useState('Gmail');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    const { data } = await supabase.from('email_accounts').select('*').order('created_at', { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  }

  function onProviderChange(provider) {
    setNewProvider(provider);
    const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.SMTP;
    setSmtpHost(defaults.smtp_host);
    setSmtpPort(defaults.smtp_port);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_pass: smtpPass }),
      });
      const data = await res.json();
      setTestResult(data.success ? { ok: true, msg: data.message } : { ok: false, msg: data.error });
    } catch (err) {
      setTestResult({ ok: false, msg: 'Failed to reach server' });
    }
    setTesting(false);
  }

  async function addAccount() {
    if (!newEmail.trim()) return;
    await supabase.from('email_accounts').insert({
      email: newEmail,
      provider: newProvider,
      user_id: user.id,
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_user: smtpUser || newEmail,
      smtp_pass: smtpPass,
    });
    setNewEmail(''); setSmtpHost('smtp.gmail.com'); setSmtpPort(587); setSmtpUser(''); setSmtpPass('');
    setShowAdd(false); setTestResult(null);
    fetchAccounts();
  }

  async function toggleWarmup(id, current) {
    await supabase.from('email_accounts').update({ warmup_enabled: !current }).eq('id', id);
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, warmup_enabled: !current } : a));
  }

  async function deleteAccount(id) {
    await supabase.from('email_accounts').delete().eq('id', id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Email Accounts</h2>
          <p className="page-subtitle">Manage your connected email accounts and SMTP settings.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Connect Account
        </button>
      </div>

      {showAdd && (
        <div className="glass-card-static mb-xl">
          <h3 className="section-title">Add Email Account</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Provider</label>
              <select className="form-select" value={newProvider} onChange={e => onProviderChange(e.target.value)}>
                <option>Gmail</option>
                <option>Outlook</option>
                <option>SMTP</option>
              </select>
            </div>
          </div>

          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginTop: 'var(--space-lg)', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
            SMTP Configuration
          </h4>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">SMTP Host</label>
              <input className="form-input" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Port</label>
              <input className="form-input" type="number" value={smtpPort} onChange={e => setSmtpPort(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Username</label>
              <input className="form-input" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Password / App Password</label>
              <input className="form-input" type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {testResult && (
            <div style={{
              padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
              marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: testResult.ok ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
              border: testResult.ok ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
              color: testResult.ok ? 'var(--green)' : 'var(--red)',
              fontSize: 'var(--font-sm)',
            }}>
              {testResult.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {testResult.msg}
            </div>
          )}

          <div className="flex items-center gap-md" style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn-secondary btn-sm" onClick={testConnection} disabled={testing || !smtpHost || !smtpPass}>
              {testing ? <><Loader2 size={14} className="spin" /> Testing...</> : 'Test Connection'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={addAccount} disabled={!newEmail.trim()}>Add Account</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setTestResult(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid stagger-children" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{accounts.length}</div>
          <div className="text-sm text-muted">Total Accounts</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--green)' }}>{accounts.filter(a => a.warmup_enabled).length}</div>
          <div className="text-sm text-muted">Warming Up</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
            {accounts.length > 0 ? Math.round(accounts.reduce((s, a) => s + (a.health || 0), 0) / accounts.length) : 0}%
          </div>
          <div className="text-sm text-muted">Avg Health</div>
        </div>
      </div>

      {/* Account List */}
      {accounts.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">No email accounts connected</div>
          <div className="empty-description">Connect your first email account to start sending campaigns.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {accounts.map((account) => (
            <div key={account.id} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-xl)',
              padding: 'var(--space-xl) var(--space-2xl)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: 'rgba(124, 58, 237, 0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
              }}>
                <Mail size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{account.email}</div>
                <div className="text-sm text-muted">
                  {account.provider} · {account.smtp_host || 'No SMTP'} · Daily limit: {account.daily_limit}
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontWeight: 600, color: (account.health || 0) >= 80 ? 'var(--green)' : (account.health || 0) >= 50 ? 'var(--yellow)' : 'var(--red)' }}>{account.health || 0}%</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Health</div>
              </div>
              <button
                className={`toggle-switch ${account.warmup_enabled ? 'active' : ''}`}
                onClick={() => toggleWarmup(account.id, account.warmup_enabled)}
              >
                <div className="toggle-knob"></div>
              </button>
              <button className="btn-icon" onClick={() => deleteAccount(account.id)} title="Remove account">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
