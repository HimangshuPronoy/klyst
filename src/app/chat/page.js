'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const SUGGESTIONS = [
  'How are my campaigns performing?',
  'Which prospects should I follow up with?',
  'What is my pipeline value?',
  'How can I improve my open rate?',
  'Summarize my email health',
  'Which leads haven\'t been contacted yet?',
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! 👋 I'm **Kylst AI**, your intelligent outreach assistant powered by Gemini.\n\nI can analyze your campaigns, leads, prospects, and email performance in real-time. Ask me anything about your data!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, user_id: user.id }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error || 'Something went wrong. Please try again.'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Failed to reach the AI. Please check your connection.' }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function clearChat() {
    setMessages([messages[0]]);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h2 className="page-title">
            <Sparkles size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--orange)' }} />
            Chat with Data
          </h2>
          <p className="page-subtitle">Ask AI about your campaigns, leads, and pipeline — powered by Gemini.</p>
        </div>
        {messages.length > 1 && (
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="glass-card-static" style={{
        display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)',
        padding: 0, overflow: 'hidden',
      }}>
        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 'var(--space-xl)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 'var(--space-md)',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, #7c3aed, #f97316)'
                  : 'var(--bg-tertiary)',
                color: msg.role === 'assistant' ? 'white' : 'var(--text-muted)',
              }}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '70%', padding: 'var(--space-md) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(249, 115, 22, 0.08))'
                  : 'var(--bg-tertiary)',
                border: msg.role === 'user'
                  ? '1px solid rgba(124, 58, 237, 0.15)'
                  : '1px solid var(--border-light)',
                fontSize: 'var(--font-sm)', lineHeight: 1.6,
              }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(msg.content),
                  }}
                />
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7c3aed, #f97316)', color: 'white',
              }}>
                <Bot size={18} />
              </div>
              <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-light)',
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--text-muted)', fontSize: 'var(--font-sm)',
              }}>
                <Loader2 size={14} className="spin" /> Analyzing your data...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{
            padding: '0 var(--space-xl) var(--space-md)',
            display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)',
          }}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 'var(--font-xs)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s',
                  fontWeight: 500,
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <MessageSquare size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: 'var(--space-md) var(--space-xl)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex', gap: 'var(--space-md)', alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Ask about your campaigns, leads, or pipeline..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0 }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}

// Simple markdown to HTML converter
function formatMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(124,58,237,0.08);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 style="font-weight:600;margin:12px 0 4px">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-weight:600;margin:16px 0 8px">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^- (.+)$/gm, '<div style="padding-left:16px">• $1</div>')
    .replace(/^\d+\. (.+)$/gm, '<div style="padding-left:16px">$&</div>')
    .replace(/\n/g, '<br>');
}
