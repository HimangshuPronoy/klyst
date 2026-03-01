// Polls Apify run status and returns results when done.
// Called by the frontend: GET /api/scrape/status?runId=xxx&brand=xxx&url=xxx

import { createClient } from '@/utils/supabase/server';

const APIFY_BASE = 'https://api.apify.com/v2';

async function apifyFetch(path) {
  const token = process.env.APIFY_API_TOKEN;
  const url = `${APIFY_BASE}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');
    const brandKeyword = searchParams.get('brand') || 'Unknown';
    const originalUrl = searchParams.get('url') || '';

    if (!runId) {
      return Response.json({ error: 'runId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check run status
    const runData = await apifyFetch(`/actor-runs/${runId}`);
    const status = runData?.data?.status;

    console.log(`[Scrape Status] Run ${runId}: ${status}`);

    if (status === 'RUNNING' || status === 'READY') {
      return Response.json({ status: 'running' });
    }

    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      return Response.json({ status: 'failed', error: `Apify run ${status}` });
    }

    if (status !== 'SUCCEEDED') {
      return Response.json({ status: 'running' }); // unknown state, keep polling
    }

    // Run succeeded — fetch dataset items
    const datasetId = runData.data.defaultDatasetId;
    const itemsResp = await apifyFetch(`/datasets/${datasetId}/items?limit=5`);
    const items = Array.isArray(itemsResp) ? itemsResp : (itemsResp?.items ?? []);

    console.log(`[Scrape Status] Got ${items.length} ads from dataset ${datasetId}`);

    if (items.length === 0) {
      return Response.json({
        status: 'done',
        scrapedAds: [],
        message: 'No ads found for this brand in the Meta Ad Library.',
      });
    }

    // Map items to our schema
    const scrapedAdsToInsert = items.map((ad) => ({
      user_id: user.id,
      brand: ad.pageName || ad.page_name || brandKeyword,
      original_url: originalUrl,
      hook_text: (
        ad.adText ||
        ad.ad_text ||
        ad.snapshot?.body?.markup?.__html ||
        'No text content available'
      ).substring(0, 500),
      spend_estimate: ad.spend
        ? `$${ad.spend.lower_bound ?? 0}–$${ad.spend.upper_bound ?? '?'}`
        : 'Unknown',
      days_active: ad.startDateFormatted
        ? Math.floor((Date.now() - new Date(ad.startDateFormatted).getTime()) / 86400000)
        : ad.startDate
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

    // Insert to Supabase
    const { data, error } = await supabase
      .from('scraped_ads')
      .insert(scrapedAdsToInsert)
      .select();

    if (error) {
      console.error('[Scrape Status] Supabase insert error:', error.message);
      return Response.json({ status: 'failed', error: 'Failed to save ads: ' + error.message });
    }

    return Response.json({ status: 'done', scrapedAds: data });
  } catch (error) {
    console.error('[Scrape Status] Error:', error.message);
    return Response.json(
      { error: 'Status check failed: ' + error.message },
      { status: 500 }
    );
  }
}
