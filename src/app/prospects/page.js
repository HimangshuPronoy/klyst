'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, DollarSign, Users, TrendingUp, ArrowRight, GripVertical } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

const STAGES = [
  { key: 'new', label: 'New', color: '#6b7280' },
  { key: 'contacted', label: 'Contacted', color: '#f97316' },
  { key: 'interested', label: 'Interested', color: '#7c3aed' },
  { key: 'meeting', label: 'Meeting', color: '#2563eb' },
  { key: 'proposal', label: 'Proposal', color: '#d97706' },
  { key: 'closed_won', label: 'Closed Won', color: '#059669' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#dc2626' },
];

export default function ProspectsPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState(null);

  // New prospect form
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', company: '', title: '', phone: '', deal_value: 0,
  });

  async function fetchProspects() {
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .order('updated_at', { ascending: false });
    setProspects(data || []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProspects();
  }, []);

  async function addProspect() {
    if (!form.email.trim()) return;
    await supabase.from('prospects').insert({
      ...form,
      user_id: user.id,
      stage: 'new',
      source: 'manual',
    });
    setForm({ first_name: '', last_name: '', email: '', company: '', title: '', phone: '', deal_value: 0 });
    setShowAdd(false);
    fetchProspects();
  }

  async function moveToStage(prospectId, newStage) {
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect || prospect.stage === newStage) return;

    await supabase.from('prospects').update({
      stage: newStage,
      updated_at: new Date().toISOString(),
    }).eq('id', prospectId);

    // Log stage change activity
    await supabase.from('prospect_activities').insert({
      prospect_id: prospectId,
      user_id: user.id,
      type: 'stage_change',
      content: `Moved from ${prospect.stage} to ${newStage}`,
      metadata: { old_stage: prospect.stage, new_stage: newStage },
    });

    setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, stage: newStage } : p));
  }

  const filtered = prospects.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (p.first_name || '').toLowerCase().includes(s) ||
      (p.last_name || '').toLowerCase().includes(s) ||
      (p.email || '').toLowerCase().includes(s) ||
      (p.company || '').toLowerCase().includes(s)
    );
  });

  const totalValue = prospects.reduce((s, p) => s + (Number(p.deal_value) || 0), 0);
  const wonCount = prospects.filter(p => p.stage === 'closed_won').length;
  const convRate = prospects.length > 0 ? ((wonCount / prospects.length) * 100).toFixed(0) : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Prospects</h2>
          <p className="page-subtitle">Manage your sales pipeline and track deals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Prospect
        </button>
      </div>

      {/* Add Prospect Form */}
      {showAdd && (
        <div className="glass-card-static mb-xl">
          <h3 className="section-title">New Prospect</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Acme Inc" />
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="VP of Sales" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Deal Value ($)</label>
              <input className="form-input" type="number" value={form.deal_value} onChange={e => setForm(p => ({ ...p, deal_value: +e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-md" style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn-primary btn-sm" onClick={addProspect}>Add Prospect</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid stagger-children" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <Users size={20} style={{ color: 'var(--accent-light)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{prospects.length}</div>
          <div className="text-sm text-muted">Total Prospects</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <DollarSign size={20} style={{ color: 'var(--green)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>${totalValue.toLocaleString()}</div>
          <div className="text-sm text-muted">Pipeline Value</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <TrendingUp size={20} style={{ color: 'var(--orange)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{convRate}%</div>
          <div className="text-sm text-muted">Win Rate</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-md mb-xl">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search prospects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Kanban Pipeline */}
      {prospects.length === 0 && !loading ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">No prospects yet</div>
          <div className="empty-description">Add your first prospect or promote leads from your lead lists.</div>
        </div>
      ) : (
        <div style={{
          display: 'flex', gap: 'var(--space-md)', overflowX: 'auto',
          paddingBottom: 'var(--space-lg)', minHeight: 400,
        }}>
          {STAGES.map(stage => {
            const stageProspects = filtered.filter(p => p.stage === stage.key);
            const stageValue = stageProspects.reduce((s, p) => s + (Number(p.deal_value) || 0), 0);

            return (
              <div
                key={stage.key}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)'; }}
                onDragLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.background = 'transparent';
                  if (draggedId) moveToStage(draggedId, stage.key);
                  setDraggedId(null);
                }}
                style={{
                  minWidth: 240, flex: '1 0 240px',
                  background: 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm)',
                  transition: 'background 0.2s',
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{stage.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, background: 'var(--bg-tertiary)',
                      borderRadius: 10, padding: '2px 8px', color: 'var(--text-muted)',
                    }}>{stageProspects.length}</span>
                  </div>
                </div>

                {/* Stage Value */}
                {stageValue > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    ${stageValue.toLocaleString()}
                  </div>
                )}

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {stageProspects.map(prospect => (
                    <Link
                      key={prospect.id}
                      href={`/prospects/${prospect.id}`}
                      draggable
                      onDragStart={() => setDraggedId(prospect.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className="glass-card"
                      style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        cursor: 'grab', textDecoration: 'none', color: 'inherit',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        opacity: draggedId === prospect.id ? 0.5 : 1,
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 4 }}>
                        {prospect.first_name} {prospect.last_name}
                      </div>
                      {prospect.company && (
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                          {prospect.company}{prospect.title ? ` · ${prospect.title}` : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {Number(prospect.deal_value) > 0 && (
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--green)' }}>
                            ${Number(prospect.deal_value).toLocaleString()}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {prospect.email}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
