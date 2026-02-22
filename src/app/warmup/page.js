'use client';

import { useEffect, useState } from 'react';
import { Flame, Settings as SettingsIcon } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ProgressRing from '@/components/ProgressRing';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(124, 58, 237, 0.15)',
        borderRadius: 10, padding: '12px 16px', backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>{label}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ color: e.color, fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
            {e.name}: {e.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function WarmupPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: accs } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('warmup_enabled', true);
      setAccounts(accs || []);

      const { data: logData } = await supabase
        .from('warmup_logs')
        .select('*')
        .order('date', { ascending: true })
        .limit(14);
      setLogs(logData || []);

      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const totalSent = logs.reduce((s, l) => s + l.sent, 0);
  const totalInbox = logs.reduce((s, l) => s + l.inbox_count, 0);
  const totalSpam = logs.reduce((s, l) => s + l.spam_count, 0);
  const inboxRate = totalSent > 0 ? ((totalInbox / totalSent) * 100).toFixed(1) : '0';
  const spamRate = totalSent > 0 ? ((totalSpam / totalSent) * 100).toFixed(1) : '0';

  const chartData = logs.map(l => ({
    day: new Date(l.date).toLocaleDateString('en', { weekday: 'short' }),
    inbox: l.sent > 0 ? Math.round((l.inbox_count / l.sent) * 100) : 0,
    spam: l.sent > 0 ? Math.round((l.spam_count / l.sent) * 100) : 0,
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title"><Flame size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--orange)' }} /> Warm-Up Center</h2>
          <p className="page-subtitle">Monitor and manage your inbox warm-up campaigns.</p>
        </div>
        <button className="btn btn-secondary"><SettingsIcon size={16} /> Warm-Up Settings</button>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-children" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{totalSent}</div>
          <div className="text-sm text-muted">Emails Sent</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--green)' }}>{inboxRate}%</div>
          <div className="text-sm text-muted">Inbox Placement</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--red)' }}>{spamRate}%</div>
          <div className="text-sm text-muted">Spam Rate</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{accounts.length}</div>
          <div className="text-sm text-muted">Active Accounts</div>
        </div>
      </div>

      {/* Account Progress */}
      <h3 className="section-title">Account Progress</h3>
      {accounts.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">No warm-up accounts</div>
          <div className="empty-description">Enable warm-up on your email accounts to see progress here.</div>
        </div>
      ) : (
        <div className="grid-2 stagger-children">
          {accounts.map(account => (
            <div key={account.id} className="glass-card-static" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', padding: 'var(--space-xl) var(--space-2xl)' }}>
              <ProgressRing
                value={account.warmup_progress}
                size={80}
                color={account.warmup_progress >= 80 ? '#059669' : account.warmup_progress >= 50 ? '#d97706' : '#7c3aed'}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{account.email}</div>
                <div className="text-sm text-muted">Health: {account.health}% · Limit: {account.daily_limit}/day</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deliverability Chart */}
      {chartData.length > 0 && (
        <div className="glass-card-static mt-xl">
          <h3 className="section-title">Deliverability Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradInbox" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradSpam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="inbox" name="Inbox" stroke="#059669" strokeWidth={2} fill="url(#gradInbox)" />
                <Area type="monotone" dataKey="spam" name="Spam" stroke="#dc2626" strokeWidth={2} fill="url(#gradSpam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
