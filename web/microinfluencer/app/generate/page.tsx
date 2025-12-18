'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Sparkles, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  imageUrl?: string;
  isImageGeneration?: boolean;
}

export default function GeneratePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');

  useEffect(() => {
    // Redirect if not logged in or not an influencer
    if (!loading && (!user || userProfile?.userType !== 'influencer')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
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
      imageUrl: uploadedImage || undefined,
      isImageGeneration: mode === 'image',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const currentImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      if (mode === 'image') {
        // Image generation mode
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage.content,
            imageUrl: currentImage,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate image');

        const data = await response.json();
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.text,
          imageUrl: data.imageUrl,
          id: (Date.now() + 1).toString(),
          isImageGeneration: true,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Chat mode
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const assistantMessage: Message = {
          role: 'assistant',
          content: '',
          id: (Date.now() + 1).toString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...assistantMessage };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPrompt = (prompt: string, imageMode = false) => {
    setMode(imageMode ? 'image' : 'chat');
    setInput(prompt);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
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
                <h1 className="text-2xl font-bold">AI Content Studio</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Create captions, images, and marketing content
                </p>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                onClick={() => setMode('chat')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  mode === 'chat'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Chat
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  mode === 'image'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-zinc-700 dark:text-purple-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className={`mb-4 inline-flex rounded-full p-4 ${
                  mode === 'image' 
                    ? 'bg-purple-100 dark:bg-purple-950' 
                    : 'bg-blue-100 dark:bg-blue-950'
                }`}>
                  {mode === 'image' ? (
                    <ImageIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  {mode === 'image' ? 'Generate Images' : 'Start a conversation'}
                </h2>
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  {mode === 'image' 
                    ? 'Describe the image you want to create or upload a reference image'
                    : 'Ask me to help you create captions, suggest hashtags, or give marketing advice'
                  }
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mode === 'chat' ? (
                    <>
                      <button
                        onClick={() => sendPrompt('Write a caption for my skincare product post')}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">💄 Skincare Caption</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Get a creative caption for beauty products
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('Suggest hashtags for fitness content')}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">💪 Fitness Hashtags</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Get trending hashtags for fitness posts
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('How to increase engagement on Instagram?')}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">📈 Engagement Tips</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Learn how to boost your engagement
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('Best posting times for TikTok?')}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">⏰ Posting Schedule</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Optimize your posting times
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => sendPrompt('Create a product photo with my skincare bottle on a marble background', true)}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">🧴 Product Shot</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Create professional product photography
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('Generate a lifestyle photo of someone using a fitness product outdoors', true)}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">🏃 Lifestyle Shot</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Create lifestyle content imagery
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('Create an Instagram story graphic with text overlay for a product launch', true)}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">📱 Story Graphic</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Design engaging story graphics
                        </div>
                      </button>
                      <button
                        onClick={() => sendPrompt('Create a before/after comparison image for product results', true)}
                        className="rounded-lg border border-zinc-200 p-4 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="mb-1 font-medium">✨ Before/After</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Show product transformation
                        </div>
                      </button>
                    </>
                  )}
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
                    {message.imageUrl && message.role === 'user' && (
                      <div className="mb-2">
                        <Image
                          src={message.imageUrl}
                          alt="Uploaded"
                          width={300}
                          height={300}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.imageUrl && message.role === 'assistant' && (
                      <div className="mt-2">
                        <Image
                          src={message.imageUrl}
                          alt="Generated"
                          width={512}
                          height={512}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-white px-4 py-3 shadow-md dark:bg-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{mode === 'image' ? 'Generating image...' : 'AI is thinking...'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-zinc-200 bg-white/80 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          {uploadedImage && (
            <div className="mb-3 flex items-center gap-2">
              <div className="relative">
                <Image
                  src={uploadedImage}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Reference image attached
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'image'
                    ? 'Describe the image you want to generate...'
                    : 'Ask me anything about content creation...'
                }
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                disabled={isLoading}
              />
              {mode === 'image' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    disabled={isLoading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'image' 
              ? 'Powered by Gemini Nano Banana - State-of-the-art image generation'
              : 'Powered by Claude 3.5 Sonnet via OpenRouter'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
