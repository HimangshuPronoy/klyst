'use client';

import { useEffect, useState } from 'react';
import { Plus, Play, Pause, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function CampaignsPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null); // campaign id being sent
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    async function fetchCampaigns() {
      let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (filter !== 'All') {
        query = query.eq('status', filter.toLowerCase());
      }
      const { data } = await query;
      setCampaigns(data || []);
      setLoading(false);
    }
    fetchCampaigns();
  }, [supabase, filter]);

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'paused' : 'active';
    await supabase.from('campaigns').update({ status: newStatus }).eq('id', id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const startSending = async (campaignId) => {
    setSending(campaignId);
    setSendResult(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId, user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ ok: true, msg: `Successfully sent ${data.sent}/${data.total} emails!${data.failed > 0 ? ` (${data.failed} failed)` : ''}` });
        // Refresh campaigns to get updated status
        const { data: updated } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        setCampaigns(updated || []);
      } else {
        setSendResult({ ok: false, msg: data.error });
      }
    } catch (err) {
      setSendResult({ ok: false, msg: 'Failed to reach server' });
    }
    setSending(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Campaigns</h2>
          <p className="page-subtitle">Manage and track your email campaigns.</p>
        </div>
        <Link href="/campaigns/new" className="btn btn-primary">
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      {/* Send Result Banner */}
      {sendResult && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          background: sendResult.ok ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
          border: sendResult.ok ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
          color: sendResult.ok ? 'var(--green)' : 'var(--red)',
          fontSize: 'var(--font-sm)',
        }}>
          {sendResult.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {sendResult.msg}
          <button style={{ marginLeft: 'auto', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontSize: 'var(--font-sm)' }} onClick={() => setSendResult(null)}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-md mb-xl">
        {['All', 'Active', 'Paused', 'Draft', 'Completed'].map((f) => (
          <button key={f}
            className={`btn btn-ghost btn-sm`}
            style={f === filter ? { background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent)' } : {}}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">No campaigns {filter !== 'All' ? `with status "${filter}"` : 'yet'}</div>
          <div className="empty-description">Create your first campaign to start sending emails.</div>
          <Link href="/campaigns/new" className="btn btn-primary"><Plus size={16} /> Create Campaign</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-xl)',
              padding: 'var(--space-xl) var(--space-2xl)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)', marginBottom: 4 }}>
                  {campaign.name}
                </div>
                <div className="flex items-center gap-md">
                  <span className={`badge badge-dot ${
                    campaign.status === 'active' ? 'badge-success' :
                    campaign.status === 'paused' ? 'badge-warning' :
                    campaign.status === 'completed' ? 'badge-info' : 'badge-neutral'
                  }`}>{campaign.status}</span>
                  <span className="text-sm text-muted">
                    {Array.isArray(campaign.steps) ? campaign.steps.length : 0} steps
                  </span>
                  <span className="text-sm text-muted">
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                {/* Start Sending button for draft campaigns */}
                {campaign.status === 'draft' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startSending(campaign.id)}
                    disabled={sending === campaign.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {sending === campaign.id ? (
                      <><Loader2 size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Start Sending</>
                    )}
                  </button>
                )}
                {(campaign.status === 'active' || campaign.status === 'paused') && (
                  <button className="btn-icon" onClick={() => toggleStatus(campaign.id, campaign.status)}>
                    {campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
