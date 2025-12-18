import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Initialize OpenAI for embeddings via OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

interface Product {
  item_name: string;
  item_brand: string;
  item_category: string;
  item_category2: string;
  price: number;
  price_without_vat: number;
  url: string;
  name: string;
  brand: string;
  rating: number | null;
  ratingCount: number | null;
  originalPrice: number;
  image: string;
  personsAndNights?: any[];
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function productToText(product: Product): string {
  return `${product.name}. Brand: ${product.brand}. Category: ${product.item_category2}. Price: ${product.price / 100} CZK. ${product.rating ? `Rating: ${product.rating}/5 (${product.ratingCount} reviews)` : ''}`;
}

async function embedProducts() {
  console.log('Starting product embedding process...');

  // Read all product files
  const scraperDataPath = path.join(__dirname, '../../../scraper/data');
  const files = ['zbozi.json', 'kurzy-workshopy.json', 'prakticke-sluzby.json'];

  const allProducts: Product[] = [];
  
  for (const file of files) {
    const filePath = path.join(scraperDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    allProducts.push(...data);
  }

  console.log(`Total products loaded: ${allProducts.length}`);

  // Get or create Pinecone index
  const indexName = 'microinfluencer-products';
  
  try {
    const index = pinecone.index(indexName);
    console.log(`Using existing index: ${indexName}`);

    // Process products in batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < allProducts.length; i += batchSize) {
      batches.push(allProducts.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches...`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartIndex = batchIndex * batchSize;
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);

      const vectors = await Promise.all(
        batch.map(async (product, idx) => {
          const text = productToText(product);
          const embedding = await generateEmbedding(text);
          
          return {
            id: `product-${batchStartIndex + idx}`,
            values: embedding,
            metadata: {
              name: product.name || '',
              brand: product.brand || '',
              category: product.item_category2 || '',
              price: product.price || 0,
              originalPrice: product.originalPrice || 0,
              rating: product.rating || 0,
              ratingCount: product.ratingCount || 0,
              url: product.url || '',
              image: product.image || '',
              text: text,
            },
          };
        })
      );

      // Upsert to Pinecone
      await index.upsert(vectors);
      console.log(`Batch ${batchIndex + 1} uploaded successfully`);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ All products embedded and uploaded to Pinecone!');
  } catch (error) {
    console.error('Error:', error);
    console.log('\n⚠️  Index not found. Please create a Pinecone index first:');
    console.log('1. Go to https://app.pinecone.io/');
    console.log('2. Create a new index named "microinfluencer-products"');
    console.log('3. Dimension: 1536 (for text-embedding-3-small)');
    console.log('4. Metric: cosine');
    throw error;
  }
}

embedProducts().catch(console.error);

