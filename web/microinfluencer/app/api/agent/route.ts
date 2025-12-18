import { streamText, tool } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { z } from 'zod';

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
    const { messages, influencerImage } = await req.json();
    console.log('Agent called with', messages.length, 'messages');

    const searchProducts = tool({
      description: 'Search for products based on a query',
      parameters: z.object({
        query: z.string().describe('Search query'),
        limit: z.number().optional().default(5),
      }),
      execute: async ({ query, limit }) => {
        console.log(`Searching for: ${query}`);
        const embedding = await generateEmbedding(query);
        const index = pinecone.Index(INDEX_NAME);
        
        const results = await index.query({
          vector: embedding,
          topK: limit,
          includeMetadata: true,
        });

        const products = results.matches.map(m => ({
          name: m.metadata?.name,
          brand: m.metadata?.brand,
          price: m.metadata?.price,
          category: m.metadata?.category,
          image: m.metadata?.image,
        }));

        console.log(`Found ${products.length} products`);
        return { products };
      },
    });

    const generateImage = tool({
      description: 'Generate a promotional image combining the influencer photo with a product',
      parameters: z.object({
        productName: z.string().describe('Name of the product'),
        productImageUrl: z.string().describe('URL of the product image'),
        scene: z.string().describe('Description of the scene (e.g., "modern bathroom", "outdoor setting")'),
      }),
      execute: async ({ productName, productImageUrl, scene }) => {
        console.log(`Generating image for ${productName} in ${scene}`);
        
        if (!influencerImage) {
          return { success: false, error: 'Please upload your photo first' };
        }

        try {
          const prompt = `Create a high-quality promotional lifestyle image featuring a person with ${productName}. Scene: ${scene}. Make it look natural and Instagram-worthy. Professional photography style.`;
          
          const response = await openai.images.generate({
            model: 'google/gemini-2.5-flash-image-preview',
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
          });

          const imageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
          console.log('Image generated successfully');
          return { success: true, imageUrl };
        } catch (error) {
          console.error('Image generation error:', error);
          return { success: false, error: (error as Error).message };
        }
      },
    });

    const result = await streamText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      messages,
      tools: { searchProducts, generateImage },
      maxToolRoundtrips: 5,
      system: `You are a helpful AI assistant for micro-influencers. 
      
${influencerImage ? '✅ The user HAS uploaded their photo. You CAN generate images.' : '❌ The user has NOT uploaded their photo yet. They need to upload it before generating images.'}

Help them:
1. Search for products using searchProducts tool
2. Generate promotional images using generateImage tool ${influencerImage ? '(photo is ready!)' : '(ask them to upload photo first)'}
3. Write captions and content ideas

Be creative and enthusiastic!`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
