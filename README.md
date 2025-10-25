# Rick & Morty AI Explorer

An AI-powered Rick & Morty character and location explorer with semantic search, AI narration generation, and intelligent evaluation.

🚀 **[Live Demo](https://rickmorty-ai.vercel.app/)**

## Features

- 🌍 Browse interdimensional locations from Rick & Morty
- 🤖 AI-generated narrations in Rick Sanchez's style
- 🔍 Semantic search for characters using natural language
- 📊 Hybrid evaluation system (heuristic + LLM-as-judge)
- 📝 Character notes with AI-powered insights
- 🎯 Vector embeddings for intelligent search

## Architecture

This project uses a **hybrid GraphQL + REST architecture**. For detailed architectural decisions and rationale, see [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md).

**Key Technologies:**

- Next.js 16 (App Router)
- GraphQL (Apollo Client) for Rick & Morty API + Supabase
- REST APIs for OpenAI integration
- Supabase (PostgreSQL + pgvector) for vector search
- Vercel AI SDK for AI operations
- TypeScript for type safety

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
/src
  /app
    /api              - REST API routes (AI operations)
      /generate       - Narration & insight generation
      /evaluate       - Evaluation endpoints
      /search         - Semantic search
      /embeddings     - Vector embedding generation
    page.tsx          - Main UI
  /components         - React components
  /graphql            - GraphQL queries & mutations
  /lib                - Utilities & clients
```

## Documentation

- [Architecture Decisions](./ARCHITECTURE_DECISIONS.md) - Detailed technical decisions and rationale

## Key Features Explained

### Semantic Search

Uses OpenAI embeddings + Supabase pgvector for natural language character search.

### AI Narration

Generates Rick Sanchez-style narrations using GPT-4 with custom prompts.

### Hybrid Evaluation

Combines fast heuristic scoring with LLM-as-judge for comprehensive quality assessment.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
