# 🎯 MicroInfluence - AI Micro Influencer Marketplace

AI-powered marketplace connecting agencies with micro influencers through automated content generation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up Pinecone (one-time):
# 1. Go to https://app.pinecone.io/
# 2. Create index: microinfluencer-products
# 3. Dimension: 1536, Metric: cosine
# 4. Add PINECONE_API_KEY to .env.local

# Embed product data
npx tsx scripts/embed-products.ts

# Run dev server
npm run dev
```

Visit: **http://localhost:3000**

## 💡 The Idea

**Problem**: Influencer marketing is slow, expensive, manual content creation.

**Solution**: AI generates promotional content featuring influencers with products.

### Influencer Path
1. Upload photo
2. Select products from e-commerce catalog
3. AI generates realistic promo images (OpenRouter + Gemini Nano Banana)
4. AI writes captions with affiliate links
5. Share & earn commissions

### Agency Path
1. Create campaigns with budget
2. Add products to promote
3. Invite influencers
4. Track performance & ROI

## ✨ Current Features

- ✅ **Unified AI Agent** - One interface for everything
- ✅ **Product Search** - RAG-powered search via Pinecone
- ✅ **Image Generation** - Nano Banana creates product + influencer photos
- ✅ **Smart Tools** - AI decides when to search or generate images
- ✅ **Influencer Photo Upload** - Combines your photo with products
- ✅ **Google Authentication** (Firebase)
- ✅ **Content Creation** - Captions, hashtags, strategy advice
- ✅ **Analytics & Tracking** - Click tracking with Firestore

## 🔧 Setup

### 1. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# OpenRouter API Key (for AI chat & image generation)
OPENROUTER_API_KEY=your-openrouter-api-key

# Pinecone API Key (for product search RAG)
PINECONE_API_KEY=your-pinecone-api-key

# OpenAI API Key (for embeddings)
OPENAI_API_KEY=your-openai-api-key
```

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /clicks/{clickId} {
      allow read: if request.auth != null;
      allow create: if true; // Anonymous tracking
    }
    match /content/{contentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource.data.influencerId == request.auth.uid;
    }
    match /affiliateLinks/{linkId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /influencer-photos/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /generated-content/{contentId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📁 Structure

```
app/
├── page.tsx              # Landing page
├── profile/              # User dashboard
├── generate/             # AI content generator (influencers)
├── analytics/            # Performance tracking (both)
├── a/[linkId]/           # Affiliate redirect tracker
└── api/                  # Backend routes (Firebase Admin SDK)
    ├── generate-image/   # Image generation
    └── generate-caption/ # Caption generation

lib/
└── firebase.ts           # Client SDK only

contexts/
└── AuthContext.tsx       # Auth state

microinfluencers-firestore.json  # Admin SDK (never on client!)
```

## 🗄️ Firestore Collections

- **`users`** - User profiles
- **`affiliateLinks`** - Tracking links
- **`clicks`** - Click data (IP, location, datetime)
- **`content`** - Generated content
- **`campaigns`** - Agency campaigns
- **`products`** - Product catalog
- **`conversions`** - Sales tracking

## 🔒 Architecture Rules

✅ **Client Side** (Browser):
- Firebase Auth (client SDK)
- Firestore queries (client SDK)
- Storage uploads (client SDK)

✅ **Server Side** (API Routes):
- Firebase Admin SDK
- OpenRouter AI calls
- Sensitive operations

❌ **Never on Client**:
- `microinfluencers-firestore.json`
- Firebase Admin SDK
- Private keys

## 🚀 Roadmap

- [x] Phase 1: Auth & Foundation
- [x] Phase 2: Analytics & Tracking
- [ ] Phase 3: AI Integration (OpenRouter)
- [ ] Phase 4: Product Catalog
- [ ] Phase 5: Campaign Management
- [ ] Phase 6: Payment Processing

## 🧪 Test Flow

1. Sign in as Influencer
2. Go to `/generate`
3. Upload photo
4. Click "Generate Content"
5. Visit `/analytics` to see performance
6. Click affiliate link (`/a/test123`) to test tracking

## 🛠️ Tech Stack

- Next.js 16, React 19, TypeScript 5
- Firebase Auth, Firestore, Storage
- Tailwind CSS 4
- OpenRouter (coming) + Gemini Nano Banana

## 📝 Notes

- COOP warnings in console are harmless
- Currently using mock data for analytics
- AI integration ready for Phase 3
- Storage bucket: `gs://microinfluencers-1ba2b.firebasestorage.app`

---

**Status**: Phase 2 Complete ✅  
**Next**: AI Integration with OpenRouter
