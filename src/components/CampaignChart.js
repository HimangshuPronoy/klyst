'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              color: entry.color,
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CampaignChart() {
  const supabase = getSupabase();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: sends } = await supabase
        .from('campaign_sends')
        .select('status, sent_at')
        .order('sent_at', { ascending: true });

      if (sends && sends.length > 0) {
        // Group by day of week
        const grouped = {};
        DAYS.forEach(d => { grouped[d] = { sent: 0, opened: 0, replied: 0 }; });

        sends.forEach(s => {
          const day = DAYS[new Date(s.sent_at).getDay()];
          grouped[day].sent += 1;
          if (s.status === 'opened' || s.status === 'replied') grouped[day].opened += 1;
          if (s.status === 'replied') grouped[day].replied += 1;
        });

        setData(DAYS.map(name => ({ name, ...grouped[name] })));
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="glass-card-static" style={{ padding: '24px' }}>
        <h3 className="section-title" style={{ marginBottom: '4px' }}>Campaign Performance</h3>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-card-static" style={{ padding: '24px' }}>
        <h3 className="section-title" style={{ marginBottom: '4px' }}>Campaign Performance</h3>
        <p className="text-sm text-muted">No sending data yet. Start a campaign to see performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card-static" style={{ padding: '24px' }}>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h3 className="section-title" style={{ marginBottom: '4px' }}>
            Campaign Performance
          </h3>
          <p className="text-sm text-muted">Activity by day of week</p>
        </div>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradOpened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradReplied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="sent"
              name="Sent"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#gradSent)"
            />
            <Area
              type="monotone"
              dataKey="opened"
              name="Opened"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#gradOpened)"
            />
            <Area
              type="monotone"
              dataKey="replied"
              name="Replied"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#gradReplied)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
