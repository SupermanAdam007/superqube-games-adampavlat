const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

export async function POST(req: Request) {
  try {
    const { productName, productImageUrl, influencerImage, customInstructions } = await req.json();
    
    console.log(`[DEMO] Generating image for: ${productName}`);
    console.log(`[DEMO] Product image: ${productImageUrl}`);
    console.log(`[DEMO] Has influencer image: ${!!influencerImage}`);
    console.log(`[DEMO] Custom instructions: ${customInstructions || 'none'}`);

    // Build prompt with optional custom instructions
    let prompt = `Generate a promotional lifestyle image: Take the person from the first image and show them naturally using or holding the product from the second image (${productName}). Make it look like a professional Instagram promotional photo.`;
    
    if (customInstructions && customInstructions.trim()) {
      prompt += ` Additional instructions: ${customInstructions.trim()}`;
    }

    console.log(`[DEMO] Prompt: "${prompt}"`);
    console.log(`[DEMO] Sending influencer image + product image`);

    // Send images as input following OpenRouter docs format
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://microinfluencer.app',
        'X-Title': 'MicroInfluencer Platform',
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
              },
              {
                type: 'image_url',
                image_url: {
                  url: influencerImage, // The uploaded photo (base64 data URL)
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: productImageUrl, // The product image URL
                },
              },
            ],
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEMO] OpenRouter error:', response.status, errorText);
      return Response.json({ error: `OpenRouter error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    
    // Log key info about the response
    const imageTokens = data.usage?.completion_tokens_details?.image_tokens || 0;
    console.log('[DEMO] OpenRouter response - image_tokens:', imageTokens);

    const message = data.choices?.[0]?.message;
    
    // The image is in message.images array, NOT in content!
    if (message?.images && Array.isArray(message.images) && message.images.length > 0) {
      const imageData = message.images[0];
      const imageUrl = imageData?.image_url?.url;
      
      if (imageUrl) {
        console.log('[DEMO] ✅ Image found in message.images! Length:', imageUrl.length);
        return Response.json({ imageUrl });
      }
    }

    // Fallback: check content array format (older format)
    const content = message?.content;
    if (content && Array.isArray(content)) {
      const imageItem = content.find((item: any) => item.type === 'image' && item.image?.data);
      if (imageItem?.image?.data) {
        const imageUrl = `data:image/png;base64,${imageItem.image.data}`;
        console.log('[DEMO] ✅ Image found in content array');
        return Response.json({ imageUrl });
      }
    }

    // No image found
    console.error('[DEMO] ❌ No image found');
    console.error('[DEMO] Message keys:', Object.keys(message || {}));
    return Response.json({ 
      error: `No image in response (image_tokens: ${imageTokens})` 
    }, { status: 500 });
  } catch (error) {
    console.error('[DEMO] Image generation error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

