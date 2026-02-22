import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const { campaign_id, user_id } = await request.json();

    if (!campaign_id || !user_id) {
      return Response.json({ error: 'Missing campaign_id or user_id' }, { status: 400 });
    }

    // 1. Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('user_id', user_id)
      .single();

    if (campErr || !campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if scheduled for later
    if (campaign.scheduled_at) {
      const scheduledTime = new Date(campaign.scheduled_at);
      if (scheduledTime > new Date()) {
        await getSupabaseAdmin().from('campaigns').update({ status: 'scheduled' }).eq('id', campaign_id);
        return Response.json({
          success: true,
          scheduled: true,
          scheduled_at: campaign.scheduled_at,
          message: `Campaign scheduled for ${scheduledTime.toLocaleString()}`,
        });
      }
    }

    // 2. Fetch sending account with SMTP creds
    const { data: account, error: accErr } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', campaign.account_id)
      .single();

    if (accErr || !account) {
      return Response.json({ error: 'Sending account not found. Please assign an email account to this campaign.' }, { status: 400 });
    }

    if (!account.smtp_host || !account.smtp_user || !account.smtp_pass) {
      return Response.json({ error: 'SMTP credentials not configured for this account. Go to Email Accounts to set them up.' }, { status: 400 });
    }

    // 3. Fetch leads from the linked lead list
    const { data: leads, error: leadErr } = await supabase
      .from('leads')
      .select('id, email, name, first_name, last_name, company')
      .eq('list_id', campaign.lead_list_id);

    if (leadErr || !leads || leads.length === 0) {
      return Response.json({ error: 'No leads found in the linked lead list.' }, { status: 400 });
    }

    // 4. Fetch unsubscribed emails
    const { data: unsubs } = await supabase
      .from('unsubscribes')
      .select('email')
      .eq('user_id', user_id);

    const unsubEmails = new Set((unsubs || []).map(u => u.email.toLowerCase()));

    // Filter out unsubscribed leads
    const activeLeads = leads.filter(l => !unsubEmails.has(l.email.toLowerCase()));
    const skippedUnsub = leads.length - activeLeads.length;

    if (activeLeads.length === 0) {
      return Response.json({ error: 'All leads in this list have unsubscribed.' }, { status: 400 });
    }

    // 5. Create transporter
    const transporter = nodemailer.createTransport({
      host: account.smtp_host,
      port: account.smtp_port || 587,
      secure: (account.smtp_port || 587) === 465,
      auth: { user: account.smtp_user, pass: account.smtp_pass },
    });

    // 6. Update campaign status to active
    await getSupabaseAdmin().from('campaigns').update({ status: 'active' }).eq('id', campaign_id);

    // 7. Send first email step to all active leads
    const steps = campaign.steps || [];
    const firstStep = steps[0];
    if (!firstStep) {
      return Response.json({ error: 'No email steps defined in this campaign.' }, { status: 400 });
    }

    // Build unsubscribe URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const unsubFooter = `\n\n---\nIf you no longer wish to receive these emails, <a href="${appUrl}/api/unsubscribe?email={{email}}&uid=${user_id}">click here to unsubscribe</a>.`;

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const lead of activeLeads) {
      try {
        const firstName = lead.first_name || (lead.name || '').split(' ')[0] || '';
        const lastName = lead.last_name || (lead.name || '').split(' ').slice(1).join(' ') || '';

        const replaceVars = (text) => (text || '')
          .replace(/\{\{first_name\}\}/g, firstName)
          .replace(/\{\{last_name\}\}/g, lastName)
          .replace(/\{\{company\}\}/g, lead.company || '')
          .replace(/\{\{email\}\}/g, lead.email || '');

        const subject = replaceVars(firstStep.subject);
        const bodyText = replaceVars(firstStep.body);
        const bodyWithUnsub = bodyText + replaceVars(unsubFooter);

        await transporter.sendMail({
          from: account.email,
          to: lead.email,
          subject: subject,
          text: bodyWithUnsub.replace(/<[^>]+>/g, ''),
          html: bodyWithUnsub.replace(/\n/g, '<br>'),
          headers: {
            'List-Unsubscribe': `<${appUrl}/api/unsubscribe?email=${encodeURIComponent(lead.email)}&uid=${user_id}>`,
          },
        });

        await getSupabaseAdmin().from('campaign_sends').insert({
          campaign_id, lead_id: lead.id, step_index: 0,
          status: 'sent', sent_at: new Date().toISOString(), user_id,
        });

        sent++;
      } catch (err) {
        failed++;
        errors.push({ email: lead.email, error: err.message });

        await getSupabaseAdmin().from('campaign_sends').insert({
          campaign_id, lead_id: lead.id, step_index: 0,
          status: 'bounced', sent_at: new Date().toISOString(), user_id,
        });
      }
    }

    // 8. Update campaign status
    const finalStatus = failed === activeLeads.length ? 'failed' : 'completed';
    await getSupabaseAdmin().from('campaigns').update({ status: finalStatus }).eq('id', campaign_id);

    return Response.json({
      success: true,
      sent,
      failed,
      total: activeLeads.length,
      skipped_unsubscribed: skippedUnsub,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    return Response.json({ error: `Sending failed: ${error.message}` }, { status: 500 });
  }
}
