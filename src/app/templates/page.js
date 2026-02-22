'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, Copy, Search, Edit3, Save, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const CATEGORIES = ['general', 'cold_outreach', 'follow_up', 'meeting', 'closing'];

const STARTER_TEMPLATES = [
  {
    name: 'Cold Intro',
    category: 'cold_outreach',
    subject: 'Quick question, {{first_name}}',
    body: `Hi {{first_name}},

I noticed {{company}} is doing great work in your space. I wanted to reach out because we help companies like yours streamline their outreach and close more deals.

Would you be open to a quick 15-minute chat this week?

Best,
[Your Name]`,
  },
  {
    name: 'Follow Up #1',
    category: 'follow_up',
    subject: 'Following up — {{company}}',
    body: `Hi {{first_name}},

Just bumping this to the top of your inbox. I know things get busy!

I'd love to show you how we can help {{company}} — happy to work around your schedule.

Cheers,
[Your Name]`,
  },
  {
    name: 'Meeting Request',
    category: 'meeting',
    subject: 'Let\'s connect — {{first_name}}',
    body: `Hi {{first_name}},

I've been following {{company}} and I think there's a great opportunity for us to collaborate.

Would you have 15 minutes this week for a quick call? I'm flexible on timing.

Looking forward to connecting,
[Your Name]`,
  },
];

export default function TemplatesPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', category: 'general' });

  async function fetchTemplates() {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('updated_at', { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTemplates(); }, []);

  async function saveTemplate() {
    if (!form.name.trim() || !form.subject.trim()) return;
    if (editing) {
      await supabase.from('email_templates').update({
        name: form.name, subject: form.subject, body: form.body,
        category: form.category, updated_at: new Date().toISOString(),
      }).eq('id', editing);
      setEditing(null);
    } else {
      await supabase.from('email_templates').insert({
        ...form, user_id: user.id,
      });
    }
    setForm({ name: '', subject: '', body: '', category: 'general' });
    setShowAdd(false);
    fetchTemplates();
  }

  async function deleteTemplate(id) {
    await supabase.from('email_templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  function startEdit(template) {
    setForm({ name: template.name, subject: template.subject, body: template.body, category: template.category });
    setEditing(template.id);
    setShowAdd(true);
  }

  function copyTemplate(template) {
    setForm({ name: `${template.name} (copy)`, subject: template.subject, body: template.body, category: template.category });
    setEditing(null);
    setShowAdd(true);
  }

  async function addStarterTemplates() {
    const inserts = STARTER_TEMPLATES.map(t => ({ ...t, user_id: user.id }));
    await supabase.from('email_templates').insert(inserts);
    fetchTemplates();
  }

  const filtered = templates.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.subject.toLowerCase().includes(s);
    }
    return true;
  });

  // Variable preview
  const previewVars = { first_name: 'John', last_name: 'Doe', company: 'Acme Inc', email: 'john@acme.com' };
  function preview(text) {
    return (text || '')
      .replace(/\{\{first_name\}\}/g, previewVars.first_name)
      .replace(/\{\{last_name\}\}/g, previewVars.last_name)
      .replace(/\{\{company\}\}/g, previewVars.company)
      .replace(/\{\{email\}\}/g, previewVars.email);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Email Templates</h2>
          <p className="page-subtitle">Create and manage reusable email templates.</p>
        </div>
        <div className="flex items-center gap-md">
          {templates.length === 0 && (
            <button className="btn btn-secondary btn-sm" onClick={addStarterTemplates}>
              Add Starter Templates
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setForm({ name: '', subject: '', body: '', category: 'general' }); setEditing(null); setShowAdd(true); }}>
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* Editor */}
      {showAdd && (
        <div className="glass-card-static mb-xl">
          <h3 className="section-title">{editing ? 'Edit Template' : 'New Template'}</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Template Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cold Intro" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subject Line</label>
            <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Quick question, {{first_name}}" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Body</label>
            <textarea className="form-input" rows={8} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your email template... Use {{first_name}}, {{last_name}}, {{company}}, {{email}} as variables." style={{ minHeight: 160 }} />
          </div>

          {/* Preview */}
          {(form.subject || form.body) && (
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Preview</div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 'var(--font-sm)' }}>Subject: {preview(form.subject)}</div>
              <div style={{ fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{preview(form.body)}</div>
            </div>
          )}

          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Available variables: <code style={{ background: 'rgba(124,58,237,0.08)', padding: '2px 6px', borderRadius: 4 }}>{'{{first_name}}'}</code> <code style={{ background: 'rgba(124,58,237,0.08)', padding: '2px 6px', borderRadius: 4 }}>{'{{last_name}}'}</code> <code style={{ background: 'rgba(124,58,237,0.08)', padding: '2px 6px', borderRadius: 4 }}>{'{{company}}'}</code> <code style={{ background: 'rgba(124,58,237,0.08)', padding: '2px 6px', borderRadius: 4 }}>{'{{email}}'}</code>
          </div>

          <div className="flex items-center gap-md">
            <button className="btn btn-primary btn-sm" onClick={saveTemplate}>
              <Save size={14} /> {editing ? 'Update' : 'Save Template'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-md mb-xl">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        {['all', ...CATEGORIES].map(c => (
          <button
            key={c}
            className="btn btn-ghost btn-sm"
            style={c === categoryFilter ? { background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent)' } : {}}
            onClick={() => setCategoryFilter(c)}
          >
            {c === 'all' ? 'All' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Template List */}
      {filtered.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">{templates.length === 0 ? 'No templates yet' : 'No matching templates'}</div>
          <div className="empty-description">{templates.length === 0 ? 'Create your first email template or add starter templates.' : 'Try adjusting your search or filter.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {filtered.map(template => (
            <div key={template.id} className="glass-card" style={{ padding: 'var(--space-xl) var(--space-2xl)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-md)', marginBottom: 4 }}>{template.name}</div>
                  <div className="flex items-center gap-md">
                    <span className="badge badge-dot badge-neutral" style={{ textTransform: 'capitalize' }}>{template.category.replace('_', ' ')}</span>
                    <span className="text-sm text-muted">Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <button className="btn-icon" onClick={() => startEdit(template)} title="Edit"><Edit3 size={14} /></button>
                  <button className="btn-icon" onClick={() => copyTemplate(template)} title="Duplicate"><Copy size={14} /></button>
                  <button className="btn-icon" onClick={() => deleteTemplate(template.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md) var(--space-lg)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, marginBottom: 4 }}>Subject: {template.subject}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>
                  {template.body?.slice(0, 150)}{template.body?.length > 150 ? '...' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
