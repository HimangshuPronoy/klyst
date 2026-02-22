'use client';

import { useEffect, useState } from 'react';
import { Send, Eye, Reply, AlertTriangle, Plus, Flame } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import StatCard from '@/components/StatCard';
import CampaignChart from '@/components/CampaignChart';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = getSupabase();
  const [stats, setStats] = useState({ sent: 0, opened: 0, replied: 0, bounced: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    async function fetchData() {
      // Fetch campaigns
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setCampaigns(campaignData || []);

      // Fetch send stats
      const { data: sends } = await supabase.from('campaign_sends').select('status');
      if (sends) {
        setStats({
          sent: sends.length,
          opened: sends.filter(s => s.status === 'opened' || s.status === 'replied').length,
          replied: sends.filter(s => s.status === 'replied').length,
          bounced: sends.filter(s => s.status === 'bounced').length,
        });
      }

      // Fetch accounts
      const { data: accountData } = await supabase
        .from('email_accounts')
        .select('*')
        .limit(4);
      setAccounts(accountData || []);

      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : '0';
  const bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : '0';

  return (
    <>
      <div className="mb-2xl">
        <h2 className="page-title">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h2>
        <p className="page-subtitle">Here&apos;s what&apos;s happening with your campaigns today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-children">
        <StatCard icon={Send} label="Emails Sent" value={stats.sent.toLocaleString()} change={0} changeLabel="all time" accent="accent1" />
        <StatCard icon={Eye} label="Open Rate" value={`${openRate}%`} change={0} changeLabel="all time" accent="accent2" />
        <StatCard icon={Reply} label="Reply Rate" value={`${replyRate}%`} change={0} changeLabel="all time" accent="accent3" />
        <StatCard icon={AlertTriangle} label="Bounce Rate" value={`${bounceRate}%`} change={0} changeLabel="all time" accent="accent4" />
      </div>

      {/* Chart */}
      <CampaignChart />

      {/* Campaigns & Quick Actions */}
      <div className="grid-2">
        <div className="glass-card-static">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Campaigns</h3>
            <Link href="/campaigns" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {campaigns.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
              <p className="text-muted">No campaigns yet.</p>
              <Link href="/campaigns/new" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-lg)' }}>
                <Plus size={14} /> Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>
                        <span className={`badge badge-dot ${
                          c.status === 'active' ? 'badge-success' :
                          c.status === 'paused' ? 'badge-warning' :
                          c.status === 'completed' ? 'badge-info' : 'badge-neutral'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="glass-card-static">
            <h3 className="section-title"><Flame size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: 'var(--orange)' }} />Warm-Up Health</h3>
            {accounts.length === 0 ? (
              <p className="text-muted text-sm">No email accounts connected yet.</p>
            ) : (
              accounts.filter(a => a.warmup_enabled).slice(0, 3).map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 'var(--font-sm)' }}>{a.email}</span>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: a.health >= 80 ? 'var(--green)' : 'var(--yellow)' }}>{a.health}%</span>
                </div>
              ))
            )}
          </div>
          <div className="glass-card-static">
            <h3 className="section-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <Link href="/campaigns/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Campaign</Link>
              <Link href="/leads" className="btn btn-secondary btn-sm"><Plus size={14} /> Import Leads</Link>
              <Link href="/accounts" className="btn btn-secondary btn-sm"><Plus size={14} /> Connect Account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
