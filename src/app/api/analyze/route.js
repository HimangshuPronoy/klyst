import OpenAI from 'openai';

let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.warn("OpenAI API Key missing. Analyze endpoint will return mock data.");
}

export async function POST(req) {
  try {
    const { adId, brand, hook } = await req.json();

    if (!adId) {
      return new Response(JSON.stringify({ error: 'adId is required for analysis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!openai) {
      console.log(`[API] Simulating LLM DNA Extraction for Ad: ${adId}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return new Response(JSON.stringify({ 
        visualDna: [
          "[SIMULATED AI] 0:00 - Split screen comparison",
          "[SIMULATED AI] 0:03 - High-contrast text overlay",
          "[SIMULATED AI] 0:08 - Close up product application",
          "[SIMULATED AI] 0:15 - Fast paced jump cuts"
        ],
        transcriptHook: hook || "Simulated extracted transcript hook."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Actual OpenAI Integration (Phase 5)
    // In a full production app, this is where we would pass image frames/thumbnails to GPT-4o Vision.
    console.log(`[API] Calling OpenAI Vision for DNA extraction...`);
    
    // For MVP phase without actual image passing, we use the text data to synthesize a DNA profile.
    const systemInstruction = `You are a world-class performance marketing AI vision analyzer.
    You are given metadata about an advertisement from "${brand}".
    The primary hook is: "${hook}".
    
    Based on typical direct-response video frameworks for this niche, return a JSON object with:
    1. 'visualDna': An array of 4 chronological timestamps detailing the expected visual and editing structure (e.g. "0:00 - Pain point visual").
    2. 'transcriptHook': A slightly expanded, direct-response version of the provided hook.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: "Analyze the ad structure." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analyze API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to extract Visual DNA.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
