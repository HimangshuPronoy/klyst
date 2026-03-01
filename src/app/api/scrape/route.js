// Async scrape: starts an Apify run and returns the runId immediately.
// The frontend polls /api/scrape/status?runId=xxx to get results.

import { createClient } from '@/utils/supabase/server';

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'apify~facebook-ads-scraper';

async function apifyFetch(path, options = {}) {
  const token = process.env.APIFY_API_TOKEN;
  const url = `${APIFY_BASE}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
  const res = await fetch(url, { ...options, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.APIFY_API_TOKEN) {
      return Response.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 });
    }

    // Derive brand keyword from URL
    const rawUrl = url.trim();
    const hostname = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).hostname;
    const brandKeyword = hostname.replace('www.', '').split('.')[0].replace(/-/g, ' ');

    // Build Meta Ad Library search URL
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=${encodeURIComponent(brandKeyword)}&search_type=keyword_unordered`;

    console.log(`[Scrape] Starting Apify run for: "${brandKeyword}" → ${adLibraryUrl}`);

    // Start the actor run and return immediately
    const runResp = await apifyFetch(`/acts/${ACTOR_ID}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: adLibraryUrl }],
        maxItems: 5,
        scrapeAdDetails: false,
      }),
    });

    const runId = runResp?.data?.id;
    if (!runId) {
      return Response.json({ error: 'Failed to start Apify run' }, { status: 500 });
    }

    console.log(`[Scrape] Run started: ${runId}`);

    return Response.json({
      success: true,
      runId,
      brandKeyword,
      originalUrl: rawUrl,
      userId: user.id,
    });
  } catch (error) {
    console.error('[Scrape] Fatal error:', error.message);
    return Response.json(
      { error: 'Scrape failed: ' + error.message },
      { status: 500 }
    );
  }
}
