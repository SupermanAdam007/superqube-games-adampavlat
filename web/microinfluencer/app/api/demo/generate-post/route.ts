import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

export async function POST(req: Request) {
  try {
    const { productName, productBrand, productPrice, productUrl } = await req.json();

    console.log(`[DEMO] Generating post for: ${productName}`);

    const result = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      prompt: `You are a social media expert for micro-influencers. Generate an engaging Instagram/TikTok post for promoting this product:

Product: ${productName}
Brand: ${productBrand}
Price: ${productPrice} CZK
Affiliate Link: ${productUrl}

Requirements:
- Write in a casual, authentic influencer voice
- Include 3-5 relevant hashtags
- Include a call-to-action with the affiliate link
- Keep it under 200 words
- Make it feel personal and genuine, not salesy
- Add relevant emojis

Generate only the post content, nothing else.`,
      maxTokens: 500,
    });

    console.log(`[DEMO] Post generated successfully`);
    return Response.json({ post: result.text });
  } catch (error) {
    console.error('[DEMO] Post generation error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

