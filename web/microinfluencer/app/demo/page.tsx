'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Loader2, Upload, X } from 'lucide-react';

interface Product {
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  url: string;
}

export default function DemoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('skincare products');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [influencerImage, setInfluencerImage] = useState<string | null>(null);
  const [imageInstructions, setImageInstructions] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfluencerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchProducts = async () => {
    setSearchLoading(true);
    setError(null);
    setProducts([]);
    setSelectedProduct(null);
    setGeneratedImage(null);
    try {
      const response = await fetch('/api/demo/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      } else {
        setError('No products found');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearchLoading(false);
    }
  };

  const generateImage = async () => {
    if (!selectedProduct) {
      setError('Select a product first');
      return;
    }
    if (!influencerImage) {
      setError('Upload your photo first');
      return;
    }

    setImageLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/demo/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          productImageUrl: selectedProduct.image,
          influencerImage,
          customInstructions: imageInstructions,
        }),
      });
      
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImageLoading(false);
    }
  };

  const generatePost = async () => {
    if (!selectedProduct) {
      setError('Select a product first');
      return;
    }

    setPostLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/demo/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          productBrand: selectedProduct.brand,
          productPrice: selectedProduct.price,
          productUrl: selectedProduct.url, // Real product URL from scraped data
        }),
      });

      const data = await response.json();
      if (data.post) {
        setGeneratedPost(data.post);
      } else {
        setError(data.error || 'Failed to generate post');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">AI Agent Demo</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Upload Photo */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Step 1: Upload Your Photo</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {!influencerImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-700">
                Click to upload your photo
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or WEBP (max 10MB)
              </p>
            </div>
          ) : (
            <div className="relative inline-block">
              <Image
                src={influencerImage}
                alt="Your photo"
                width={200}
                height={200}
                className="rounded-xl border-2 border-green-400 object-cover"
              />
              <button
                onClick={() => setInfluencerImage(null)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mt-2 text-sm text-green-600">✓ Photo uploaded</p>
            </div>
          )}
        </div>

        {/* Step 2: Search Products */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Step 2: Search Products (Pinecone RAG)</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 rounded-lg border px-4 py-2"
            />
            <Button onClick={searchProducts} disabled={searchLoading}>
              {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
          {products.length > 0 && (
            <p className="mt-2 text-sm text-green-600">✓ Found {products.length} products - click to select</p>
          )}

          {products.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProduct(product)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedProduct?.name === product.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={150}
                    className="mb-2 rounded"
                    unoptimized
                  />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-lg font-bold">{product.price} CZK</p>
                  {selectedProduct?.name === product.name && (
                    <p className="mt-2 text-sm text-blue-600">✓ Selected</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Generate Image */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Step 3: Generate Image (Nano Banana)</h2>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Custom Instructions (optional):
            </label>
            <textarea
              value={imageInstructions}
              onChange={(e) => setImageInstructions(e.target.value)}
              placeholder="e.g., 'in a modern bathroom', 'outdoor setting', 'holding the product close to face'..."
              className="w-full rounded-lg border px-4 py-2 text-sm"
              rows={2}
            />
          </div>
          
          <Button onClick={generateImage} disabled={imageLoading || !selectedProduct || !influencerImage}>
            {imageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Promotional Image
          </Button>
          <div className="mt-2 text-sm text-gray-600">
            {!influencerImage && '⚠️ Upload your photo first'}
            {influencerImage && !selectedProduct && '⚠️ Search and select a product first'}
            {influencerImage && selectedProduct && `✓ Ready to generate with ${selectedProduct.name}`}
          </div>

          {generatedImage && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold">Generated Image:</h3>
              <Image
                src={generatedImage}
                alt="Generated"
                width={600}
                height={600}
                className="rounded-lg"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Step 4: Generate Social Media Post */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">Step 4: Generate Social Media Post (Claude)</h2>
          <Button onClick={generatePost} disabled={postLoading || !selectedProduct}>
            {postLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Post with Affiliate Link
          </Button>
          <div className="mt-2 text-sm text-gray-600">
            {!selectedProduct && '⚠️ Select a product first'}
            {selectedProduct && `✓ Ready to generate post for ${selectedProduct.name}`}
          </div>

          {generatedPost && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold">Generated Post:</h3>
              <div className="rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 p-6">
                <p className="whitespace-pre-wrap text-gray-800">{generatedPost}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigator.clipboard.writeText(generatedPost)}
              >
                📋 Copy to Clipboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

