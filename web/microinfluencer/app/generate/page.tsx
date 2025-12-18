'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Sparkles, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  imageUrl?: string;
}

export default function GeneratePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [influencerImage, setInfluencerImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || userProfile?.userType !== 'influencer')) {
      router.push('/');
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          influencerImage,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.text,
        id: (Date.now() + 1).toString(),
        imageUrl: data.imageUrl, // Include image URL if present
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error. Please try again.',
        id: Date.now().toString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile || userProfile.userType !== 'influencer') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Agent</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Search products and generate images
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {influencerImage ? (
                <div className="relative">
                  <Image
                    src={influencerImage}
                    alt="Your photo"
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-blue-500 object-cover"
                  />
                  <button
                    onClick={() => setInfluencerImage(null)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Upload Your Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h2 className="mb-2 text-xl font-semibold">Ask me anything</h2>
                <div className="space-y-2 text-sm text-zinc-600">
                  <p>Try: "Find me skincare products under 500 CZK"</p>
                  <p>Or: "Generate an image of me with a product" (upload photo first)</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    {message.imageUrl && message.imageUrl.trim().startsWith('http') && (
                      <div className="mb-3">
                        <Image
                          src={message.imageUrl.trim()}
                          alt="Generated"
                          width={500}
                          height={500}
                          className="rounded-lg"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-md dark:bg-zinc-800">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-zinc-200 py-4 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
