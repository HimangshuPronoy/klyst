import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const { message, user_id } = await request.json();

    if (!message || !user_id) {
      return Response.json({ error: 'Missing message or user_id' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured. Add it to your .env.local file.' }, { status: 500 });
    }

    // Fetch user's data context
    const [
      { data: campaigns },
      { data: sends },
      { data: accounts },
      { data: leadLists },
      { data: prospects },
      { data: leads },
    ] = await Promise.all([
      getSupabaseAdmin().from('campaigns').select('id, name, status, created_at, steps, schedule').eq('user_id', user_id),
      getSupabaseAdmin().from('campaign_sends').select('status, sent_at, campaign_id').eq('user_id', user_id),
      getSupabaseAdmin().from('email_accounts').select('email, provider, health, warmup_enabled, daily_limit, sent_today').eq('user_id', user_id),
      getSupabaseAdmin().from('lead_lists').select('id, name, created_at').eq('user_id', user_id),
      getSupabaseAdmin().from('prospects').select('first_name, last_name, company, stage, deal_value, email, last_contacted_at').eq('user_id', user_id),
      getSupabaseAdmin().from('leads').select('name, email, company, status, list_id').eq('user_id', user_id).limit(100),
    ]);

    // Build summary stats
    const totalSent = sends?.length || 0;
    const opened = sends?.filter(s => s.status === 'opened' || s.status === 'replied').length || 0;
    const replied = sends?.filter(s => s.status === 'replied').length || 0;
    const bounced = sends?.filter(s => s.status === 'bounced').length || 0;

    const pipelineValue = prospects?.reduce((s, p) => s + (Number(p.deal_value) || 0), 0) || 0;
    const prospectsByStage = {};
    prospects?.forEach(p => {
      prospectsByStage[p.stage] = (prospectsByStage[p.stage] || 0) + 1;
    });

    const dataContext = `
Here is the user's Kylst data:

CAMPAIGNS (${campaigns?.length || 0} total):
${campaigns?.map(c => `- "${c.name}" (status: ${c.status}, ${Array.isArray(c.steps) ? c.steps.length : 0} email steps, created: ${c.created_at})`).join('\n') || 'None'}

EMAIL STATS:
- Total emails sent: ${totalSent}
- Opened: ${opened} (${totalSent > 0 ? ((opened/totalSent)*100).toFixed(1) : 0}%)
- Replied: ${replied} (${totalSent > 0 ? ((replied/totalSent)*100).toFixed(1) : 0}%)
- Bounced: ${bounced} (${totalSent > 0 ? ((bounced/totalSent)*100).toFixed(1) : 0}%)

EMAIL ACCOUNTS (${accounts?.length || 0}):
${accounts?.map(a => `- ${a.email} (${a.provider}, health: ${a.health}%, warmup: ${a.warmup_enabled ? 'on' : 'off'}, limit: ${a.daily_limit}/day, sent today: ${a.sent_today})`).join('\n') || 'None'}

LEAD LISTS (${leadLists?.length || 0}):
${leadLists?.map(l => `- "${l.name}" (created: ${l.created_at})`).join('\n') || 'None'}

LEADS (${leads?.length || 0} shown, max 100):
${leads?.slice(0, 20).map(l => `- ${l.name || 'Unknown'} <${l.email}> at ${l.company || 'N/A'} (${l.status})`).join('\n') || 'None'}
${(leads?.length || 0) > 20 ? `...and ${leads.length - 20} more` : ''}

PROSPECTS CRM (${prospects?.length || 0}):
Pipeline breakdown: ${JSON.stringify(prospectsByStage)}
Total pipeline value: $${pipelineValue.toLocaleString()}
${prospects?.slice(0, 15).map(p => `- ${p.first_name} ${p.last_name} at ${p.company || 'N/A'} (stage: ${p.stage}, deal: $${Number(p.deal_value || 0).toLocaleString()})`).join('\n') || 'None'}
`;

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `You are Kylst AI, an intelligent assistant for a cold email outreach platform. You help users understand their campaign performance, suggest improvements, analyze their prospect pipeline, and provide actionable insights.

Be concise, friendly, and data-driven. Use the user's actual data to back up your answers. Format responses with markdown for readability. Use bullet points, bold text, and numbers when helpful.

${dataContext}

User's question: ${message}` }],
      }],
    });

    const response = result.response;
    const text = response.text();

    return Response.json({ reply: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: `AI chat failed: ${error.message}` },
      { status: 500 }
    );
  }
}
