'use client';

import { useEffect, useState } from 'react';
import { User, Server, Shield, Bell, Key, AlertTriangle, Save, Eye, EyeOff, Copy } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: '', company: '', role: '' });
  const [settings, setSettings] = useState({ daily_max: 500, per_account_max: 50, min_delay: 60, max_delay: 180, notifications: {} });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) setProfile(p);

      const { data: s } = await supabase.from('settings').select('*').eq('user_id', user.id).single();
      if (s) setSettings(s);
    }
    fetchData();
  }, [supabase, user]);

  async function saveProfile() {
    setSaving('profile');
    await supabase.from('profiles').update({
      full_name: profile.full_name, company: profile.company, role: profile.role,
    }).eq('id', user.id);
    setSaving('');
  }

  async function saveSettings() {
    setSaving('settings');
    await supabase.from('settings').update({
      daily_max: settings.daily_max, per_account_max: settings.per_account_max,
      min_delay: settings.min_delay, max_delay: settings.max_delay,
    }).eq('user_id', user.id);
    setSaving('');
  }

  async function toggleNotif(key) {
    const updated = { ...settings.notifications, [key]: !settings.notifications[key] };
    setSettings(prev => ({ ...prev, notifications: updated }));
    await supabase.from('settings').update({ notifications: updated }).eq('user_id', user.id);
  }

  return (
    <>
      <div className="mb-2xl">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your account preferences and configurations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', maxWidth: 800 }}>
        {/* Profile */}
        <div className="glass-card-static">
          <div className="flex items-center gap-md mb-xl">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(124, 58, 237, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}>
              <User size={18} />
            </div>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Profile</h3>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm mt-md" onClick={saveProfile} disabled={saving === 'profile'}>
            <Save size={14} /> {saving === 'profile' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Sending Limits */}
        <div className="glass-card-static">
          <div className="flex items-center gap-md mb-xl">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--yellow)' }}>
              <Shield size={18} />
            </div>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Sending Limits</h3>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Daily Max (All Accounts)</label>
              <input className="form-input" type="number" value={settings.daily_max} onChange={e => setSettings(s => ({ ...s, daily_max: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Per-Account Max</label>
              <input className="form-input" type="number" value={settings.per_account_max} onChange={e => setSettings(s => ({ ...s, per_account_max: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Delay (seconds)</label>
              <input className="form-input" type="number" value={settings.min_delay} onChange={e => setSettings(s => ({ ...s, min_delay: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Delay (seconds)</label>
              <input className="form-input" type="number" value={settings.max_delay} onChange={e => setSettings(s => ({ ...s, max_delay: +e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm mt-md" onClick={saveSettings} disabled={saving === 'settings'}>
            <Save size={14} /> {saving === 'settings' ? 'Saving...' : 'Update Limits'}
          </button>
        </div>

        {/* Notifications */}
        <div className="glass-card-static">
          <div className="flex items-center gap-md mb-xl">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
              <Bell size={18} />
            </div>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Notifications</h3>
          </div>
          {[
            { key: 'campaignComplete', label: 'Campaign Completed', desc: 'Get notified when a campaign finishes sending.' },
            { key: 'dailyReport', label: 'Daily Report', desc: 'Receive a daily summary of your campaign performance.' },
            { key: 'bounceAlert', label: 'Bounce Alerts', desc: 'Get alerted when bounce rate exceeds threshold.' },
            { key: 'warmupComplete', label: 'Warm-Up Complete', desc: 'Get notified when an account reaches warm-up target.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between" style={{ padding: 'var(--space-md) 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{item.label}</div>
                <div className="text-sm text-muted">{item.desc}</div>
              </div>
              <button className={`toggle-switch ${settings.notifications?.[item.key] ? 'active' : ''}`} onClick={() => toggleNotif(item.key)}>
                <div className="toggle-knob"></div>
              </button>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="glass-card-static" style={{ border: '1px solid rgba(220, 38, 38, 0.15)' }}>
          <div className="flex items-center gap-md mb-xl">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(220, 38, 38, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
              <AlertTriangle size={18} />
            </div>
            <h3 className="section-title" style={{ marginBottom: 0, color: 'var(--red)' }}>Danger Zone</h3>
          </div>
          <p className="text-sm text-muted mb-lg">Once you delete your account, all data will be permanently removed.</p>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </>
  );
}
