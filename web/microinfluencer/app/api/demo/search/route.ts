import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!PINECONE_API_KEY) throw new Error('PINECONE_API_KEY is not set');
if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const INDEX_NAME = 'microinfluencer-products';

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log(`[DEMO] Searching for: ${query}`);

    const embedding = await generateEmbedding(query);
    const index = pinecone.Index(INDEX_NAME);

    const results = await index.query({
      vector: embedding,
      topK: 6,
      includeMetadata: true,
    });

    const products = results.matches.map(m => ({
      name: m.metadata?.name,
      brand: m.metadata?.brand,
      price: m.metadata?.originalPrice || m.metadata?.price,
      category: m.metadata?.category,
      image: m.metadata?.image,
      url: m.metadata?.url, // Include the actual product URL
    }));

    console.log(`[DEMO] Found ${products.length} products`);
    return Response.json({ products });
  } catch (error) {
    console.error('[DEMO] Search error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

