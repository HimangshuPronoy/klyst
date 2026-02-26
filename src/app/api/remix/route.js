import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

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
    if (!genAI) {
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

    console.log(`[API] Calling Gemini for remix...`);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const systemInstruction = `You are a world-class performance marketing AI. 
    You are analyzing a highly successful video ad from the brand "${adData.brand}". 
    The original successful hook was: "${adData.hook}".
    
    The user wants to remix this successful creative framework for their own brand/product.
    Apply the psychological principles of the original hook to the user's specific request.
    Output a short, punchy, direct-response video script (Hook, Body, CTA).`;

    const result = await model.generateContent(`${systemInstruction}\n\nUser request: ${prompt}`);

    return new Response(JSON.stringify({ 
      role: 'system',
      content: result.response.text()
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
