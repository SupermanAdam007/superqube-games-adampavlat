import { generateText } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

export async function POST(req: Request) {
  try {
    const { productName, productBrand, productPrice, productUrl } = await req.json();

    console.log(`[DEMO] Generating post for: ${productName}`);
    console.log(`[DEMO] Product URL: ${productUrl}`);
    
    // Ensure we have a valid URL
    const finalUrl = productUrl && productUrl !== 'undefined' 
      ? productUrl 
      : `https://www.slevomat.cz/hledani?keyword=${encodeURIComponent(productName)}`

    const result = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      prompt: `Jsi expert na sociální sítě pro micro-influencery. Vygeneruj krátký Instagram/TikTok příspěvek pro propagaci tohoto produktu:

Produkt: ${productName}
Značka: ${productBrand}
Cena: ${productPrice} CZK
Odkaz: ${finalUrl}

Požadavky:
- Piš ČESKY
- Maximálně 2-3 věty
- Přidej 3-4 relevantní hashtagy
- MUSÍ obsahovat PŘESNĚ tento odkaz (zkopíruj ho): ${finalUrl}
- Přidej vhodné emoji
- Buď autentický a přirozený
- NEVYMÝŠLEJ si jiný odkaz, použij PŘESNĚ ten výše

Vygeneruj pouze text příspěvku, nic jiného.`,
      maxTokens: 300,
    });

    console.log(`[DEMO] Post generated successfully`);
    return Response.json({ post: result.text });
  } catch (error) {
    console.error('[DEMO] Post generation error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

