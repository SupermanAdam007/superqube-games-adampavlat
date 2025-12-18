# 🛠️ Setup Guide - Pinecone & Product Embeddings

## Step 1: Create Pinecone Index

1. Go to [https://app.pinecone.io/](https://app.pinecone.io/)
2. Sign up or log in
3. Click "Create Index"
4. Configure:
   - **Name**: `microinfluencer-products`
   - **Dimensions**: `1536`
   - **Metric**: `cosine`
   - **Cloud**: Choose your preferred region
5. Click "Create Index"
6. Copy your API key from the "API Keys" section

## Step 2: Add API Keys to `.env.local`

```bash
# Pinecone (for product search)
PINECONE_API_KEY=your-pinecone-api-key-here

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-your-openai-key-here

# OpenRouter (for AI agent & image generation)
OPENROUTER_API_KEY=sk-or-your-openrouter-key-here

# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCu4FBtFOtMSmwoJZfsDatssArxqXAF7Uc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=microinfluencers-1ba2b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=microinfluencers-1ba2b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=microinfluencers-1ba2b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=745075291860
NEXT_PUBLIC_FIREBASE_APP_ID=1:745075291860:web:1754f957bb6f8b1230ed41
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Embed Product Data

This script will:
- Read all product JSON files from `../scraper/data/`
- Generate embeddings using OpenAI
- Upload to Pinecone

```bash
npx tsx scripts/embed-products.ts
```

**Note**: This will take 5-10 minutes depending on the number of products (~10,000 products).

### Expected Output:

```
Starting product embedding process...
Total products loaded: 10170
Using existing index: microinfluencer-products
Processing 102 batches...
Processing batch 1/102...
Batch 1 uploaded successfully
Processing batch 2/102...
...
✅ All products embedded and uploaded to Pinecone!
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the AI Agent

1. **Log in** as an influencer
2. **Upload your photo** (top right button)
3. Try these prompts:
   - "Find me skincare products under 500 CZK"
   - "Show me highly rated fitness products"
   - "Create an image of me with a skincare product in a modern bathroom"
   - "Write a caption for a beauty product post"

## 🎯 How It Works

### Product Search (RAG):
1. User asks: "Find skincare products"
2. Query is embedded using OpenAI
3. Pinecone finds similar products
4. AI presents results with details

### Image Generation:
1. User uploads their photo
2. User asks: "Create image with product X"
3. AI searches for product X
4. Nano Banana combines influencer + product
5. Generated image is displayed

### Smart Tools:
The AI agent automatically decides:
- When to search products (`searchProducts` tool)
- When to generate images (`generateProductImage` tool)
- When to just chat and give advice

## 📊 Product Data

Current product catalog:
- **zbozi.json**: ~4000 products
- **kurzy-workshopy.json**: ~4000 workshops/courses  
- **prakticke-sluzby.json**: ~2000 services

Total: **~10,000 items** with:
- Name, brand, category
- Price, ratings, reviews
- Images, URLs
- All searchable via natural language

## 🔧 Troubleshooting

### "Index not found" error:
- Make sure you created the Pinecone index with the exact name: `microinfluencer-products`
- Check your PINECONE_API_KEY in `.env.local`

### Embedding script fails:
- Check OPENAI_API_KEY is valid
- Ensure you have API credits
- Check network connection

### No search results:
- Make sure you ran the embedding script
- Check Pinecone dashboard - index should have ~10,000 vectors

### Image generation fails:
- Check OPENROUTER_API_KEY is valid
- Make sure you're using a model that supports images
- Upload an influencer photo first

## 🎨 Next Steps

After setup, you can:
1. Test the full influencer workflow
2. Add more product data to `scraper/data/`
3. Re-run embedding script to update
4. Customize AI prompts in `/api/agent/route.ts`
5. Add more tools (e.g., caption generator, hashtag suggester)

