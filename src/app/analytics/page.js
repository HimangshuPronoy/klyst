'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Send, Eye, Reply, AlertTriangle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import StatCard from '@/components/StatCard';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
            {e.name}: {typeof e.value === 'number' && e.value < 100 ? `${e.value}%` : e.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const supabase = getSupabase();
  const [stats, setStats] = useState({ sent: 0, opened: 0, replied: 0, bounced: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: sends } = await supabase.from('campaign_sends').select('status, campaign_id');
      if (sends) {
        setStats({
          sent: sends.length,
          opened: sends.filter(s => s.status === 'opened' || s.status === 'replied').length,
          replied: sends.filter(s => s.status === 'replied').length,
          bounced: sends.filter(s => s.status === 'bounced').length,
        });
      }
      const { data: cs } = await supabase.from('campaigns').select('name, id').limit(6);
      setCampaigns(cs || []);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : '0';
  const bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : '0';

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Track and analyze your campaign performance.</p>
        </div>
        <button className="btn btn-secondary"><Download size={16} /> Export Report</button>
      </div>

      {/* Stats */}
      <div className="stats-grid stagger-children">
        <StatCard icon={Send} label="Total Sent" value={stats.sent.toLocaleString()} change={0} changeLabel="this month" accent="accent1" />
        <StatCard icon={Eye} label="Avg Open Rate" value={`${openRate}%`} change={0} changeLabel="this month" accent="accent2" />
        <StatCard icon={Reply} label="Avg Reply Rate" value={`${replyRate}%`} change={0} changeLabel="this month" accent="accent3" />
        <StatCard icon={AlertTriangle} label="Avg Bounce Rate" value={`${bounceRate}%`} change={0} changeLabel="this month" accent="accent4" />
      </div>

      {stats.sent === 0 ? (
        <div className="glass-card-static empty-state mt-xl">
          <div className="empty-title">No analytics data yet</div>
          <div className="empty-description">Start sending campaigns to see performance metrics here.</div>
        </div>
      ) : (
        <div className="grid-2 mt-xl">
          <div className="glass-card-static">
            <h3 className="section-title">Performance Over Time</h3>
            <p className="text-sm text-muted">Data will populate as campaigns send.</p>
          </div>
          <div className="glass-card-static">
            <h3 className="section-title">Campaign Comparison</h3>
            <p className="text-sm text-muted">Data will populate as campaigns send.</p>
          </div>
        </div>
      )}

      {/* Top Campaigns */}
      <div className="glass-card-static mt-xl">
        <h3 className="section-title">Campaigns Overview</h3>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted">No campaigns to show.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Campaign</th><th>ID</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td className="text-muted text-sm">{c.id.slice(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
