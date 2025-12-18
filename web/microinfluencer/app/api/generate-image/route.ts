import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// Allow responses up to 60 seconds for image generation
export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, imageUrl } = body;

    if (!prompt) {
      return new Response('No prompt provided', { status: 400 });
    }

    console.log('Image generation request:', { prompt, hasImage: !!imageUrl });

    // Build the message content
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: prompt,
      },
    ];

    // If there's an image URL, add it to the content
    if (imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      });
    }

    const result = await generateText({
      model: openrouter('google/gemini-2.5-flash-image-preview'),
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    console.log('Image generation result:', result);

    // Extract the image URL from the response
    // Nano Banana returns markdown with image URLs
    const imageUrlMatch = result.text.match(/!\[.*?\]\((.*?)\)/);
    const generatedImageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

    return Response.json({
      text: result.text,
      imageUrl: generatedImageUrl,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

