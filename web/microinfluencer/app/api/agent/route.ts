import { generateText, tool } from 'ai';
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
        limit: z.number().int().optional().default(5).describe('Number of products to return'),
      }),
      execute: async ({ query, limit = 5 }) => {
        console.log(`[TOOL] Searching for: ${query}, limit: ${limit} (type: ${typeof limit})`);
        try {
          const embedding = await generateEmbedding(query);
          console.log('[TOOL] Embedding generated, querying Pinecone...');
          const index = pinecone.Index(INDEX_NAME);
          
          const topK = Math.floor(Number(limit)); // Ensure it's an integer
          console.log(`[TOOL] Using topK: ${topK}`);
          
          const results = await index.query({
            vector: embedding,
            topK: topK,
            includeMetadata: true,
          });

        const products = results.matches.map(m => ({
          name: m.metadata?.name,
          brand: m.metadata?.brand,
          price: m.metadata?.originalPrice || m.metadata?.price,
          category: m.metadata?.category,
          image: m.metadata?.image,
        }));

          console.log(`[TOOL] Found ${products.length} products:`, JSON.stringify(products, null, 2));
          return { products };
        } catch (error) {
          console.error('[TOOL] Search error:', error);
          return { products: [], error: (error as Error).message };
        }
      },
    });

    const generateImage = tool({
      description: 'Generate a promotional image combining the influencer photo with a product. You must pass the product name and image URL.',
      parameters: z.object({
        productName: z.string().describe('Name of the product to feature'),
        productImageUrl: z.string().describe('Image URL of the product (get this from searchProducts results)'),
        scene: z.string().optional().default('modern lifestyle setting').describe('Scene description'),
      }),
      execute: async ({ productName, productImageUrl, scene = 'modern lifestyle setting' }) => {
        console.log(`Generating image for ${productName} with product image ${productImageUrl} in ${scene}`);
        
        if (!influencerImage) {
          return { success: false, error: 'Please upload your photo first' };
        }

        try {
          const prompt = `Create a high-quality promotional lifestyle image featuring a person with ${productName}. Scene: ${scene}. Make it look natural and Instagram-worthy. Professional photography style.`;
          
          // OpenRouter uses chat completions for image generation with Gemini
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: prompt,
                    }
                  ],
                }
              ],
              // Request image output
              response_format: { type: 'image' },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter error:', response.status, errorText);
            return { success: false, error: `OpenRouter error: ${response.status}` };
          }

          const data = await response.json();
          console.log('OpenRouter image generation response received');
          
          // Gemini returns image as base64 in content array
          const content = data.choices?.[0]?.message?.content;
          
          if (content && Array.isArray(content)) {
            // Content is an array with image data
            const imageData = content.find((item: any) => item.type === 'image' && item.image?.data);
            
            if (imageData?.image?.data) {
              const base64Image = imageData.image.data;
              const imageUrl = `data:image/png;base64,${base64Image}`;
              console.log('Image generated successfully (base64, length:', base64Image.length, ')');
              return { success: true, imageUrl };
            }
          } else if (typeof content === 'string') {
            // Fallback: if content is a string, try to extract URL
            const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
              console.log('Image generated successfully (URL):', urlMatch[1]);
              return { success: true, imageUrl: urlMatch[1].trim() };
            }
          }
          
          console.log('No image found in response, content type:', typeof content);
          return { success: false, error: 'No image data found in response' };
        } catch (error) {
          console.error('Image generation error:', error);
          return { success: false, error: (error as Error).message };
        }
      },
    });

    const result = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      messages,
      tools: { searchProducts, generateImage },
      maxSteps: 10, // Increase to allow more tool rounds
      system: `You are a helpful AI assistant for micro-influencers. 
      
${influencerImage ? '✅ The user HAS uploaded their photo. You CAN generate images.' : '❌ The user has NOT uploaded their photo yet. They need to upload it before generating images.'}

CRITICAL: You MUST use tools and wait for their results before responding. Do NOT say "I'll do X" - actually DO X.

**WORKFLOW RULES:**
1. If user asks about products: Call searchProducts, wait for results, THEN present them
2. If user asks to generate/create an image: 
   - STEP 1: Call searchProducts to find a product
   - STEP 2: Call generateImage with that product's details
   - STEP 3: Present the generated image
3. After EVERY tool call, you MUST wait for the result and process it
4. Do NOT end your response until you have completed ALL steps

You are in multi-step mode. Use as many steps as needed to complete the user's request fully.`,
    });

    console.log('Generation complete');
    console.log('Result text:', result.text);
    console.log('Tool results:', JSON.stringify(result.toolResults, null, 2));
    console.log('Steps:', result.steps?.length);
    
    // If the AI only executed tool calls but didn't respond with the results, 
    // manually construct a response
    if (result.toolResults && result.toolResults.length > 0 && result.steps && result.steps.length === 1) {
      console.log('AI stopped after tool call, constructing manual response');
      let responseText = result.text + '\n\n';
      
      // Check if user asked for image generation but AI only searched
      const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const askedForImage = lastUserMessage.includes('generate') || lastUserMessage.includes('create image') || lastUserMessage.includes('image');
      const onlySearched = result.toolResults.length === 1 && result.toolResults[0].toolName === 'searchProducts';
      
      if (askedForImage && onlySearched && influencerImage && result.toolResults[0].output?.products?.[0]) {
        // User wanted an image but AI only searched - manually generate it
        console.log('User asked for image, manually calling generateImage tool');
        const firstProduct = result.toolResults[0].output.products[0];
        
        try {
          const imageResult = await generateImage.execute({
            productName: firstProduct.name,
            productImageUrl: firstProduct.image,
            scene: 'modern lifestyle setting, professional photography',
          });
          
          if (imageResult.success) {
            responseText += `\n✨ Generated your promotional image with ${firstProduct.name}!\n`;
            return Response.json({ text: responseText, imageUrl: imageResult.imageUrl });
          } else {
            responseText += `\n❌ Failed to generate image: ${imageResult.error}\n`;
          }
        } catch (error) {
          console.error('Manual image generation error:', error);
          responseText += `\n❌ Failed to generate image: ${(error as Error).message}\n`;
        }
      }
      
      for (const toolResult of result.toolResults) {
        if (toolResult.toolName === 'searchProducts' && toolResult.output?.products) {
          responseText += '🔍 Found Products:\n\n';
          for (const product of toolResult.output.products) {
            responseText += `• ${product.name}\n`;
            responseText += `  Brand: ${product.brand}\n`;
            responseText += `  Price: ${product.price} CZK\n`;
            responseText += `  Category: ${product.category}\n\n`;
          }
        } else if (toolResult.toolName === 'generateImage' && toolResult.output?.success) {
          responseText += `\n✨ Generated Image:\n${toolResult.output.imageUrl}\n`;
        }
      }
      
      return Response.json({ text: responseText });
    }
    
    return Response.json({ text: result.text });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
