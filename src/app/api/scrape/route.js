import { createClient } from '@/utils/supabase/server';
import { ApifyClient } from 'apify-client';

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[API] Initiating Apify scrape for: ${url}`);

    // Initialize Server Client
    const supabase = await createClient();
    
    // Get active user session for RLS insertion
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No active session' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    // ----------------------------------------------------
    // APIFY SCRAPING LOGIC
    // ----------------------------------------------------
    let scrapedAdsToInsert = [];

    if (!process.env.APIFY_API_TOKEN) {
       throw new Error('APIFY_API_TOKEN is missing from environment variables.');
    }

    try {
      // Initialize the ApifyClient with API token
      const apifyClient = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
      });

      // Simple heuristic to extract a search term from a URL
      // e.g. "https://juneshine.com/products" -> "juneshine"
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const brandKeyword = hostname.replace('www.', '').split('.')[0]; 

      console.log(`[API] Starting Apify Actor for Keyword: ${brandKeyword}`);

      // You can use standard Apify actors. 'curious_coder/facebook-ads-library-scraper' is a common one.
      // Or 'apify/facebook-ads-scraper' 
      const actorId = 'apify/facebook-ads-scraper'; 
      
      const input = {
          searchTerms: [brandKeyword],
          country: "ALL", 
          maxItems: 3, // Keep the limit small for real-time dashboard responsiveness
      };

      // Run the Actor and wait for it to finish
      const run = await apifyClient.actor(actorId).call(input);

      // Fetch and process Actor results from the run's dataset
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

      console.log(`[API] Apify returned ${items.length} ads.`);

      if (items && items.length > 0) {
         scrapedAdsToInsert = items.map((ad, idx) => ({
            user_id: user.id,
            brand: ad.pageName || brandKeyword,
            original_url: url,
            hook_text: (ad.adText || 'No text content available').substring(0, 500),
            spend_estimate: ad.spend ? `$${ad.spend.lower_bound}-$${ad.spend.upper_bound}` : 'Unknown',
            days_active: ad.startDate ? Math.floor((new Date() - new Date(ad.startDate)) / (1000 * 60 * 60 * 24)) : 0,
            format: ad.snapshot && ad.snapshot.videos && ad.snapshot.videos.length > 0 ? 'Video Ad' : 'Image Ad',
            image_url: (ad.snapshot && ad.snapshot.images && ad.snapshot.images[0]?.url) || 
                       (ad.snapshot && ad.snapshot.videos && ad.snapshot.videos[0]?.video_preview_image_url) ||
                       'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop', // fallback
            visual_dna: []
         }));
      }

    } catch (scrapeErr) {
       console.error(`[API Scraper] Apify Actor failed:`, scrapeErr);
       // If apify fails, push a fallback error ad so the UI doesn't crash completely.
       scrapedAdsToInsert.push({
          user_id: user.id,
          brand: 'Scrape Failed',
          original_url: url,
          hook_text: `Error connecting to Meta Ads via Apify: ${scrapeErr.message}`,
          spend_estimate: 'N/A',
          days_active: 0,
          format: 'Error',
          image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
          visual_dna: []
       });
    }

    // Insert to Supabase DB (ensure we only insert if we have items)
    let insertedAds = [];
    if (scrapedAdsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('scraped_ads')
        .insert(scrapedAdsToInsert)
        .select();

      if (error) {
        console.error("Database Insert Error:", error);
        throw error;
      }
      insertedAds = data;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      scrapedAds: insertedAds
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Scrape API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process scrape request: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
