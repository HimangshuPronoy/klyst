'use client';

import { useEffect, useState } from 'react';
import { Upload, Plus, Search, Users, MoreVertical, Trash2, Eye, ArrowUpRight } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function LeadsPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    const { data } = await supabase
      .from('lead_lists')
      .select('*, leads(count)')
      .order('created_at', { ascending: false });
    setLists(data || []);
    setLoading(false);
  }

  async function fetchLeads(listId) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });
    setLeads(data || []);
    setSelectedList(listId);
  }

  async function createList() {
    if (!newListName.trim()) return;
    await supabase.from('lead_lists').insert({ name: newListName, user_id: user.id });
    setNewListName('');
    setShowNewList(false);
    fetchLists();
  }

  async function deleteList(id) {
    await supabase.from('lead_lists').delete().eq('id', id);
    fetchLists();
  }

  async function promoteToProspect(lead) {
    const nameParts = (lead.name || '').split(' ');
    await supabase.from('prospects').insert({
      user_id: user.id,
      email: lead.email,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      company: lead.company || '',
      title: lead.title || '',
      stage: 'new',
      source: 'lead_list',
      lead_id: lead.id,
    });
    alert(`${lead.name || lead.email} promoted to Prospects!`);
  }

  async function uploadCSV(e) {
    const file = e.target.files?.[0];
    if (!file || !selectedList) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('list_id', selectedList);
      formData.append('user_id', user.id);
      const res = await fetch('/api/import-leads', { method: 'POST', body: formData });
      const data = await res.json();
      setImportResult(data);
      if (data.success) fetchLeads(selectedList);
    } catch (err) {
      setImportResult({ error: 'Upload failed' });
    }
    setImporting(false);
    e.target.value = '';
  }

  if (selectedList) {
    const list = lists.find(l => l.id === selectedList);
    return (
      <>
        <div className="flex items-center gap-lg mb-2xl">
          <button className="btn-icon" style={{ width: 36, height: 36 }} onClick={() => { setSelectedList(null); setImportResult(null); }}>←</button>
          <div style={{ flex: 1 }}>
            <h2 className="page-title">{list?.name || 'Lead List'}</h2>
            <p className="page-subtitle">{leads.length} leads</p>
          </div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={uploadCSV} style={{ display: 'none' }} disabled={importing} />
          </label>
        </div>

        {importResult && (
          <div style={{
            padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-lg)', fontSize: 'var(--font-sm)',
            background: importResult.success ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            border: importResult.success ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
            color: importResult.success ? 'var(--green)' : 'var(--red)',
          }}>
            {importResult.success
              ? `✅ Imported ${importResult.imported} of ${importResult.total} leads${importResult.skipped > 0 ? ` (${importResult.skipped} skipped)` : ''}`
              : `⚠️ ${importResult.error}`}
          </div>
        )}
        <div className="glass-card-static">
          {leads.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-2xl)' }}>
              <p className="text-muted">No leads in this list yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Company</th><th>Title</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 500 }}>{lead.name}</td>
                      <td style={{ color: 'var(--accent-light)' }}>{lead.email}</td>
                      <td>{lead.company}</td>
                      <td className="text-muted">{lead.title}</td>
                      <td><span className={`badge badge-dot ${lead.status === 'verified' ? 'badge-success' : lead.status === 'bounced' ? 'badge-danger' : 'badge-neutral'}`}>{lead.status}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => promoteToProspect(lead)} title="Promote to Prospect" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-xs)' }}>
                          <ArrowUpRight size={14} /> CRM
                        </button>
                      </td>
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

  return (
    <>
      <div className="flex items-center justify-between mb-2xl">
        <div>
          <h2 className="page-title">Leads</h2>
          <p className="page-subtitle">Manage your contact lists and import new leads.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewList(true)}>
          <Plus size={16} /> New List
        </button>
      </div>

      {/* New List Input */}
      {showNewList && (
        <div className="glass-card-static mb-xl flex items-center gap-md">
          <input className="form-input" placeholder="List name..." value={newListName} onChange={e => setNewListName(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={createList}>Create</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowNewList(false)}>Cancel</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid stagger-children" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <Users size={20} style={{ color: 'var(--accent-light)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{lists.length}</div>
          <div className="text-sm text-muted">Lead Lists</div>
        </div>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
            {lists.reduce((s, l) => s + (l.leads?.[0]?.count || 0), 0)}
          </div>
          <div className="text-sm text-muted">Total Leads</div>
        </div>
      </div>

      {/* Lists */}
      {lists.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-title">No lead lists yet</div>
          <div className="empty-description">Create a list to start organizing your leads.</div>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {lists.map((list) => (
            <div key={list.id} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-xl)',
              padding: 'var(--space-xl) var(--space-2xl)', cursor: 'pointer',
            }} onClick={() => fetchLeads(list.id)}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: 'rgba(124, 58, 237, 0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)',
              }}>
                <Users size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-md)', marginBottom: 4 }}>{list.name}</div>
                <div className="text-sm text-muted">{list.leads?.[0]?.count || 0} leads · Created {new Date(list.created_at).toLocaleDateString()}</div>
              </div>
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); deleteList(list.id); }} title="Delete list">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
