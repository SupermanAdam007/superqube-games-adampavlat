import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    // Convert to core messages format
    const coreMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const result = await streamText({
      model: openrouter('anthropic/claude-3.5-sonnet'), // Using Claude for better content generation
      system: `You are a helpful AI assistant for MicroInfluence, an AI-powered marketplace connecting agencies with micro influencers.
      
Your role is to help influencers:
- Generate creative social media captions
- Suggest hashtags for their content
- Give advice on product promotion
- Answer questions about influencer marketing

Be friendly, creative, and professional. Keep responses concise and actionable.`,
      messages: coreMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

