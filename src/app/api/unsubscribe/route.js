import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const uid = searchParams.get('uid');

  if (!email || !uid) {
    return new Response(unsubPage('Missing parameters.', true), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Record unsubscribe
  await supabase.from('unsubscribes').upsert(
    { user_id: uid, email: email.toLowerCase() },
    { onConflict: 'user_id,email' }
  );

  return new Response(unsubPage(email, false), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function unsubPage(emailOrError, isError) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed — Kylst</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
    .card { text-align: center; background: white; border-radius: 16px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; }
    h1 { font-size: 24px; margin-bottom: 12px; color: ${isError ? '#dc2626' : '#059669'}; }
    p { color: #6b7280; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${isError ? '⚠️ Error' : '✅ Unsubscribed'}</h1>
    <p>${isError ? emailOrError : `<strong>${emailOrError}</strong> has been removed from future emails. You will no longer receive messages from this sender.`}</p>
  </div>
</body>
</html>`;
}
