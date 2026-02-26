import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req) {
  try {
    const { adId, brand, hook } = await req.json();

    if (!adId) {
      return new Response(JSON.stringify({ error: 'adId is required for analysis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!genAI) {
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

    console.log(`[API] Calling Gemini for DNA extraction...`);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const prompt = `You are a world-class performance marketing AI vision analyzer.
    You are given metadata about an advertisement from "${brand}".
    The primary hook is: "${hook}".
    
    Based on typical direct-response video frameworks for this niche, return a JSON object with:
    1. 'visualDna': An array of 4 chronological timestamps detailing the expected visual and editing structure (e.g. "0:00 - Pain point visual").
    2. 'transcriptHook': A slightly expanded, direct-response version of the provided hook.
    
    Analyze the ad structure.`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    return new Response(JSON.stringify(parsed), {
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
