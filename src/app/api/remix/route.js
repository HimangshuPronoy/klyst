import OpenAI from 'openai';

// Initialize OpenAI client (requires OPENAI_API_KEY in .env)
// We wrap this in a try-catch so the app doesn't crash if the key is missing during UI development.
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.warn("OpenAI API Key missing. Remix endpoint will return mock data.");
}

export async function POST(req) {
  try {
    const { prompt, adData } = await req.json();

    if (!prompt || !adData) {
      return new Response(JSON.stringify({ error: 'Prompt and adData are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no API key is present, simulate the AI response for frontend testing
    if (!openai) {
      console.log(`[API] Simulating LLM Remix for prompt: "${prompt}"`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return new Response(JSON.stringify({ 
        role: 'system',
        content: `**[SIMULATED AI RESPONSE]**\n\nI have analyzed the semantic structure of the "${adData.brand}" ad.\n\nHere is a remixed script applying their successful hook architecture based on your prompt: "${prompt}"\n\n**Hook (0-3s):** Stop everything. If you're doing [PAIN POINT], you're losing money.\n**Body (3-12s):** Look at the difference [YOUR BRAND] makes. It uses [PROPRIETARY TECH] to solve it instantly.\n**CTA (12-15s):** Get 20% off your first month.`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Actual OpenAI Integration (Phase 5)
    console.log(`[API] Calling OpenAI for remix...`);
    
    const systemInstruction = `You are a world-class performance marketing AI. 
    You are analyzing a highly successful video ad from the brand "${adData.brand}". 
    The original successful hook was: "${adData.hook}".
    
    The user wants to remix this successful creative framework for their own brand/product.
    Apply the psychological principles of the original hook to the user's specific request.
    Output a short, punchy, direct-response video script (Hook, Body, CTA).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return new Response(JSON.stringify({ 
      role: 'system',
      content: completion.choices[0].message.content
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Remix API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process AI remix generating request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
