import { createClient } from '@/utils/supabase/server';
import { ApifyClient } from 'apify-client';

export const maxDuration = 300; // Allow up to 5 minutes for the Apify actor to finish

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Server Client
    const supabase = await createClient();

    // Get active user session for RLS insertion
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No active session' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is missing from environment variables.');
    }

    // Extract brand keyword from URL (e.g. "lumina-skincare.com" -> "lumina skincare")
    let rawUrl = url.trim();
    const hostname = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).hostname;
    const brandKeyword = hostname.replace('www.', '').split('.')[0].replace(/-/g, ' ');

    console.log(`[API] Scraping Meta Ad Library for brand keyword: "${brandKeyword}"`);

    // Build a Meta Ad Library search URL — this is what the actor expects as input
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=${encodeURIComponent(brandKeyword)}&search_type=keyword_unordered`;

    const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    let scrapedAdsToInsert = [];

    try {
      const input = {
        startUrls: [{ url: adLibraryUrl }],
        maxItems: 5,
        scrapeAdDetails: false, // Faster without deep detail scraping
      };

      console.log(`[API] Calling Apify actor with URL: ${adLibraryUrl}`);

      const run = await apifyClient.actor('apify/facebook-ads-scraper').call(input, {
        timeout: 240, // 4 minute timeout passed to Apify task
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

      console.log(`[API] Apify returned ${items.length} ads.`);

      if (items && items.length > 0) {
        scrapedAdsToInsert = items.map((ad) => ({
          user_id: user.id,
          brand: ad.pageName || ad.page_name || brandKeyword,
          original_url: rawUrl,
          hook_text: (
            ad.adText ||
            ad.ad_text ||
            (ad.snapshot && ad.snapshot.body && ad.snapshot.body.markup && ad.snapshot.body.markup.__html) ||
            'No text content available'
          ).substring(0, 500),
          spend_estimate: ad.spend
            ? `$${ad.spend.lower_bound ?? 0}–$${ad.spend.upper_bound ?? '?'}`
            : 'Unknown',
          days_active: ad.startDate
            ? Math.floor((Date.now() - new Date(ad.startDate).getTime()) / 86400000)
            : 0,
          format:
            ad.snapshot && ad.snapshot.videos && ad.snapshot.videos.length > 0
              ? 'Video Ad'
              : 'Image Ad',
          image_url:
            (ad.snapshot && ad.snapshot.images && ad.snapshot.images[0]?.url) ||
            (ad.snapshot && ad.snapshot.videos && ad.snapshot.videos[0]?.video_preview_image_url) ||
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
          visual_dna: [],
        }));
      }
    } catch (scrapeErr) {
      console.error('[API Scraper] Apify Actor failed:', scrapeErr);
      // Push a graceful error record so it doesn't silently fail
      scrapedAdsToInsert.push({
        user_id: user.id,
        brand: `${brandKeyword} (Error)`,
        original_url: rawUrl,
        hook_text: `Apify scrape error: ${scrapeErr.message}`,
        spend_estimate: 'N/A',
        days_active: 0,
        format: 'Error',
        image_url:
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
        visual_dna: [],
      });
    }

    // Insert results to Supabase
    let insertedAds = [];
    if (scrapedAdsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('scraped_ads')
        .insert(scrapedAdsToInsert)
        .select();

      if (error) {
        console.error('Database Insert Error:', error);
        throw error;
      }
      insertedAds = data;
    }

    return new Response(
      JSON.stringify({ success: true, scrapedAds: insertedAds }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process scrape request: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
