// Uses Apify REST API directly via fetch — no apify-client npm package needed
// This avoids the 'proxy-agent' native module error on Vercel serverless

import { createClient } from '@/utils/supabase/server';

export const maxDuration = 300;

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

async function pollRun(runId, maxWaitMs = 200_000) {
  const interval = 5000;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, interval));
    const data = await apifyFetch(`/actor-runs/${runId}`);
    const status = data?.data?.status;
    console.log(`[Apify] Run ${runId} status: ${status}`);
    if (status === 'SUCCEEDED') return data.data;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Apify run ${status} (id: ${runId})`);
    }
  }
  throw new Error('Apify run timed out waiting for completion');
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

    let scrapedAdsToInsert = [];

    try {
      // 1. Start the actor run
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
      if (!runId) throw new Error('No run ID returned from Apify');

      console.log(`[Scrape] Run started: ${runId}`);

      // 2. Poll until done
      const finishedRun = await pollRun(runId);
      const datasetId = finishedRun.defaultDatasetId;

      // 3. Fetch results
      const itemsResp = await apifyFetch(`/datasets/${datasetId}/items?limit=5`);
      const items = Array.isArray(itemsResp) ? itemsResp : (itemsResp?.items ?? []);

      console.log(`[Scrape] Got ${items.length} ads from Apify`);

      if (items.length > 0) {
        scrapedAdsToInsert = items.map((ad) => ({
          user_id: user.id,
          brand: ad.pageName || ad.page_name || brandKeyword,
          original_url: rawUrl,
          hook_text: (
            ad.adText ||
            ad.ad_text ||
            ad.snapshot?.body?.markup?.__html ||
            'No text content available'
          ).substring(0, 500),
          spend_estimate: ad.spend
            ? `$${ad.spend.lower_bound ?? 0}–$${ad.spend.upper_bound ?? '?'}`
            : 'Unknown',
          days_active: ad.startDate
            ? Math.floor((Date.now() - new Date(ad.startDate).getTime()) / 86400000)
            : 0,
          format:
            ad.snapshot?.videos?.length > 0 ? 'Video Ad' : 'Image Ad',
          image_url:
            ad.snapshot?.images?.[0]?.url ||
            ad.snapshot?.videos?.[0]?.video_preview_image_url ||
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
          visual_dna: [],
        }));
      }
    } catch (scrapeErr) {
      console.error('[Scrape] Apify error:', scrapeErr.message);
      scrapedAdsToInsert.push({
        user_id: user.id,
        brand: `${brandKeyword} (Error)`,
        original_url: rawUrl,
        hook_text: `Scrape error: ${scrapeErr.message}`,
        spend_estimate: 'N/A',
        days_active: 0,
        format: 'Error',
        image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
        visual_dna: [],
      });
    }

    // Insert to Supabase
    let insertedAds = [];
    if (scrapedAdsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('scraped_ads')
        .insert(scrapedAdsToInsert)
        .select();

      if (error) throw error;
      insertedAds = data;
    }

    return Response.json({ success: true, scrapedAds: insertedAds });
  } catch (error) {
    console.error('[Scrape] Fatal error:', error.message);
    return Response.json(
      { error: 'Scrape failed: ' + error.message },
      { status: 500 }
    );
  }
}
