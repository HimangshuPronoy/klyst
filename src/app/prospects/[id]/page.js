'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, DollarSign, Clock, MessageSquare, Send, Eye, Reply, Plus } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const STAGES = [
  { key: 'new', label: 'New', color: '#6b7280' },
  { key: 'contacted', label: 'Contacted', color: '#f97316' },
  { key: 'interested', label: 'Interested', color: '#7c3aed' },
  { key: 'meeting', label: 'Meeting', color: '#2563eb' },
  { key: 'proposal', label: 'Proposal', color: '#d97706' },
  { key: 'closed_won', label: 'Closed Won', color: '#059669' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#dc2626' },
];

const ACTIVITY_ICONS = {
  email_sent: Send,
  email_opened: Eye,
  email_replied: Reply,
  note: MessageSquare,
  call: Phone,
  meeting: Building2,
  stage_change: ArrowLeft,
};

export default function ProspectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = getSupabase();
  const { user } = useAuth();

  const [prospect, setProspect] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  // Note form
  const [noteType, setNoteType] = useState('note');
  const [noteContent, setNoteContent] = useState('');
  const [showNote, setShowNote] = useState(false);

  async function fetchData() {
    const { data: p } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .single();

    if (p) {
      setProspect(p);
      setForm(p);
    }

    const { data: acts } = await supabase
      .from('prospect_activities')
      .select('*')
      .eq('prospect_id', id)
      .order('created_at', { ascending: false });

    setActivities(acts || []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [id]);

  async function saveChanges() {
    await supabase.from('prospects').update({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      company: form.company,
      title: form.title,
      phone: form.phone,
      deal_value: form.deal_value,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    setProspect(form);
    setEditing(false);
  }

  async function changeStage(newStage) {
    if (!prospect || prospect.stage === newStage) return;
    const oldStage = prospect.stage;

    await supabase.from('prospects').update({
      stage: newStage,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    await supabase.from('prospect_activities').insert({
      prospect_id: id,
      user_id: user.id,
      type: 'stage_change',
      content: `Stage changed from ${oldStage} to ${newStage}`,
      metadata: { old_stage: oldStage, new_stage: newStage },
    });

    setProspect(prev => ({ ...prev, stage: newStage }));
    fetchData();
  }

  async function addActivity() {
    if (!noteContent.trim()) return;
    await supabase.from('prospect_activities').insert({
      prospect_id: id,
      user_id: user.id,
      type: noteType,
      content: noteContent,
    });

    // Update last_contacted_at
    if (['call', 'meeting', 'email_sent'].includes(noteType)) {
      await supabase.from('prospects').update({
        last_contacted_at: new Date().toISOString(),
      }).eq('id', id);
    }

    setNoteContent('');
    setShowNote(false);
    fetchData();
  }

  if (loading) {
    return <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }} className="text-muted">Loading...</div>;
  }

  if (!prospect) {
    return (
      <div className="glass-card-static empty-state">
        <div className="empty-title">Prospect not found</div>
        <button className="btn btn-primary" onClick={() => router.push('/prospects')}>Back to Pipeline</button>
      </div>
    );
  }

  const currentStage = STAGES.find(s => s.key === prospect.stage);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-lg mb-2xl">
        <button className="btn-icon" style={{ width: 36, height: 36 }} onClick={() => router.push('/prospects')}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 className="page-title">{prospect.first_name} {prospect.last_name}</h2>
          <p className="page-subtitle">{prospect.company}{prospect.title ? ` · ${prospect.title}` : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNote(true)}>
          <Plus size={14} /> Log Activity
        </button>
      </div>

      {/* Stage Pipeline */}
      <div className="glass-card-static mb-xl" style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STAGES.map((stage, i) => (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button
                onClick={() => changeStage(stage.key)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)', fontWeight: 600, cursor: 'pointer',
                  border: 'none', transition: 'all 0.2s',
                  background: prospect.stage === stage.key ? stage.color : 'var(--bg-tertiary)',
                  color: prospect.stage === stage.key ? 'white' : 'var(--text-muted)',
                  opacity: STAGES.findIndex(s => s.key === prospect.stage) >= i ? 1 : 0.5,
                }}
              >
                {stage.label}
              </button>
              {i < STAGES.length - 1 && (
                <ArrowLeft size={12} style={{ color: 'var(--text-muted)', transform: 'rotate(180deg)', flexShrink: 0, margin: '0 2px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Left: Details */}
        <div className="glass-card-static">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="section-title" style={{ marginBottom: 0 }}>Details</h3>
            {editing ? (
              <div className="flex items-center gap-sm">
                <button className="btn btn-primary btn-sm" onClick={saveChanges}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setForm(prospect); setEditing(false); }}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {[
              { icon: Mail, label: 'Email', field: 'email' },
              { icon: Phone, label: 'Phone', field: 'phone' },
              { icon: Building2, label: 'Company', field: 'company' },
              { icon: Briefcase, label: 'Title', field: 'title' },
              { icon: DollarSign, label: 'Deal Value', field: 'deal_value', type: 'number' },
            ].map(({ icon: Icon, label, field, type }) => (
              <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  {editing ? (
                    <input
                      className="form-input"
                      type={type || 'text'}
                      value={form[field] || ''}
                      onChange={e => setForm(p => ({ ...p, [field]: type === 'number' ? +e.target.value : e.target.value }))}
                      style={{ padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                    />
                  ) : (
                    <div style={{ fontWeight: 500 }}>
                      {field === 'deal_value' ? `$${Number(prospect[field] || 0).toLocaleString()}` : (prospect[field] || '—')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>Notes</div>
            {editing ? (
              <textarea
                className="form-input"
                rows={3}
                value={form.notes || ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add notes about this prospect..."
              />
            ) : (
              <div style={{ fontSize: 'var(--font-sm)', color: prospect.notes ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {prospect.notes || 'No notes yet.'}
              </div>
            )}
          </div>

          {prospect.last_contacted_at && (
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
              <Clock size={12} /> Last contacted: {new Date(prospect.last_contacted_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Right: Activity Timeline */}
        <div className="glass-card-static">
          <h3 className="section-title">Activity Timeline</h3>

          {/* Add Activity Form */}
          {showNote && (
            <div style={{
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
              border: '1px solid var(--border-light)',
            }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Type</label>
                <select className="form-select" value={noteType} onChange={e => setNoteType(e.target.value)}>
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="email_sent">Email Sent</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Details</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="What happened?"
                />
              </div>
              <div className="flex items-center gap-sm">
                <button className="btn btn-primary btn-sm" onClick={addActivity}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowNote(false)}>Cancel</button>
              </div>
            </div>
          )}

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 'var(--font-sm)' }}>No activities logged yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', left: 15, top: 0, bottom: 0, width: 2,
                background: 'var(--border-light)',
              }} />

              {activities.map((activity) => {
                const IconComp = ACTIVITY_ICONS[activity.type] || MessageSquare;
                const stageInfo = STAGES.find(s => s.key === activity.metadata?.new_stage);

                return (
                  <div key={activity.id} style={{
                    display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md) 0',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--bg-secondary)', border: '2px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1,
                    }}>
                      <IconComp size={14} style={{ color: stageInfo?.color || 'var(--text-muted)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: 2 }}>
                        {activity.type === 'stage_change' ? (
                          <span>Moved to <span style={{ color: stageInfo?.color, fontWeight: 600 }}>{stageInfo?.label}</span></span>
                        ) : (
                          <span style={{ textTransform: 'capitalize' }}>{activity.type.replace('_', ' ')}</span>
                        )}
                      </div>
                      {activity.content && (
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>
                          {activity.content}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
