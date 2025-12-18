'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Sparkles, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useChat } from 'ai/react';

export default function GeneratePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const influencerImageRef = useRef<HTMLInputElement>(null);
  
  const [influencerImage, setInfluencerImage] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
    body: {
      influencerImage,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || userProfile?.userType !== 'influencer')) {
      router.push('/');
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInfluencerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfluencerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Content Agent</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Search products, create content, generate images
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
                    className="rounded-full border-2 border-blue-500"
                  />
                  <button
                    onClick={() => setInfluencerImage(null)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={influencerImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInfluencerImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => influencerImageRef.current?.click()}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-4 dark:from-blue-950 dark:to-purple-950">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">What can I help you with?</h2>
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  I can search products, create captions, and more
                </p>
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
                    {/* Tool Invocations */}
                    {message.toolInvocations && message.toolInvocations.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.toolInvocations.map((tool) => (
                          <div
                            key={tool.toolCallId}
                            className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-900 dark:bg-blue-950"
                          >
                            <div className="font-medium text-blue-900 dark:text-blue-100">
                              {tool.toolName === 'searchProducts' ? '🔍 Searching Products' : '🎨 Generating Image'}
                            </div>
                            {tool.state === 'result' && (
                              <div className="mt-1 text-blue-600 dark:text-blue-400">
                                ✓ Done
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-md dark:bg-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-200 bg-white/80 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-xl px-6">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

