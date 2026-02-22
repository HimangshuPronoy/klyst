'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Send, Clock, Users, FileText, Plus, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const STEPS = ['Campaign Details', 'Email Sequence', 'Select Leads', 'Review & Send'];

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = getSupabase();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [leadLists, setLeadLists] = useState([]);
  const [saving, setSaving] = useState(false);

  const [campaign, setCampaign] = useState({
    name: '', account_id: '', schedule: '9:00 AM - 5:00 PM', timezone: 'UTC',
    selectedList: null, scheduled_at: '',
    steps: [{ subject: '', body: '', delay: 0 }],
  });

  useEffect(() => {
    async function fetchData() {
      const { data: accs } = await supabase.from('email_accounts').select('id, email');
      setAccounts(accs || []);
      const { data: lists } = await supabase.from('lead_lists').select('id, name, leads(count)');
      setLeadLists(lists || []);
    }
    fetchData();
  }, [supabase]);

  const addStep = () => {
    setCampaign(prev => ({ ...prev, steps: [...prev.steps, { subject: '', body: '', delay: 2 }] }));
  };

  const removeStep = (idx) => {
    setCampaign(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx) }));
  };

  const updateStep = (idx, field, value) => {
    setCampaign(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }));
  };

  const saveCampaign = async () => {
    setSaving(true);
    const { error } = await supabase.from('campaigns').insert({
      name: campaign.name,
      user_id: user.id,
      account_id: campaign.account_id || null,
      schedule: campaign.schedule,
      timezone: campaign.timezone,
      steps: campaign.steps,
      lead_list_id: campaign.selectedList,
      scheduled_at: campaign.scheduled_at || null,
      status: 'draft',
    });
    if (!error) {
      router.push('/campaigns');
    }
    setSaving(false);
  };

  return (
    <>
      <div className="mb-2xl">
        <h2 className="page-title">Create Campaign</h2>
        <p className="page-subtitle">Set up your new email outreach campaign.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-lg mb-2xl">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-sm">
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-sm)', fontWeight: 600,
              background: i <= step ? 'var(--color-primary)' : 'var(--bg-tertiary)',
              color: i <= step ? 'white' : 'var(--text-muted)',
            }}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: 'var(--font-sm)', color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? 'var(--color-primary)' : 'var(--border-color)', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      <div className="glass-card-static" style={{ padding: 'var(--space-2xl)' }}>
        {/* Step 0: Campaign Details */}
        {step === 0 && (
          <>
            <h3 className="section-title"><FileText size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Campaign Details</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input className="form-input" value={campaign.name} onChange={e => setCampaign(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q1 Outreach" />
              </div>
              <div className="form-group">
                <label className="form-label">Sending Account</label>
                <select className="form-select" value={campaign.account_id} onChange={e => setCampaign(p => ({ ...p, account_id: e.target.value }))}>
                  <option value="">Select account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.email}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Schedule</label>
                <input className="form-input" value={campaign.schedule} onChange={e => setCampaign(p => ({ ...p, schedule: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-select" value={campaign.timezone} onChange={e => setCampaign(p => ({ ...p, timezone: e.target.value }))}>
                  <option>UTC</option><option>US/Eastern</option><option>US/Pacific</option><option>Europe/London</option><option>Asia/Kolkata</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Schedule Send (optional)</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={campaign.scheduled_at}
                  onChange={e => setCampaign(p => ({ ...p, scheduled_at: e.target.value }))}
                />
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                  Leave empty to send immediately when you click &quot;Start Sending&quot;
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 1: Email Sequence */}
        {step === 1 && (
          <>
            <h3 className="section-title"><Send size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Email Sequence</h3>
            {campaign.steps.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border-light)' }}>
                <div className="flex items-center justify-between mb-md">
                  <div className="flex items-center gap-md">
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{i + 1}</div>
                    <span style={{ fontWeight: 600 }}>Step {i + 1}</span>
                  </div>
                  {campaign.steps.length > 1 && <button className="btn-icon" onClick={() => removeStep(i)}><Trash2 size={14} /></button>}
                </div>
                {i > 0 && (
                  <div className="form-group mb-md">
                    <label className="form-label"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Wait (days)</label>
                    <input className="form-input" type="number" min="0" value={s.delay} onChange={e => updateStep(i, 'delay', +e.target.value)} style={{ maxWidth: 120 }} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={s.subject} onChange={e => updateStep(i, 'subject', e.target.value)} placeholder="Email subject line..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Body</label>
                  <textarea className="form-input" rows={4} value={s.body} onChange={e => updateStep(i, 'body', e.target.value)} placeholder="Write your email..." style={{ minHeight: 100 }} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addStep}><Plus size={14} /> Add Follow-Up</button>
          </>
        )}

        {/* Step 2: Select Leads */}
        {step === 2 && (
          <>
            <h3 className="section-title"><Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Select Lead List</h3>
            {leadLists.length === 0 ? (
              <p className="text-muted">No lead lists available. Create a lead list first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {leadLists.map(list => (
                  <div key={list.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-lg) var(--space-xl)', cursor: 'pointer' }}
                    onClick={() => setCampaign(p => ({ ...p, selectedList: list.id }))}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 'var(--radius-sm)',
                      border: campaign.selectedList === list.id ? 'none' : '2px solid var(--border-color)',
                      background: campaign.selectedList === list.id ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {campaign.selectedList === list.id && <Check size={12} color="white" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{list.name}</div>
                      <div className="text-sm text-muted">{list.leads?.[0]?.count || 0} leads</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <h3 className="section-title">Review Campaign</h3>
            <div style={{ background: 'rgba(124, 58, 237, 0.05)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', border: '1px solid rgba(124, 58, 237, 0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 8 }}>{campaign.name || 'Untitled Campaign'}</div>
              <div className="text-sm text-muted">{campaign.steps.length} email step{campaign.steps.length > 1 ? 's' : ''}</div>
              <div className="text-sm text-muted">Account: {accounts.find(a => a.id === campaign.account_id)?.email || 'Not selected'}</div>
              <div className="text-sm text-muted">Lead list: {leadLists.find(l => l.id === campaign.selectedList)?.name || 'Not selected'}</div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-2xl)' }}>
          <button className="btn btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : router.push('/campaigns')} disabled={saving}>
            <ArrowLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={saveCampaign} disabled={saving}>
              {saving ? 'Saving...' : 'Create Campaign'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
