# Architecture Decisions

This document outlines the key architectural decisions made in the Rick & Morty AI Explorer project.

---

## 1. API Architecture: GraphQL vs REST

### GraphQL Used For:

- **Rick & Morty API** - Reading character/location data

  - **Why**: Official API is GraphQL-based
  - **Benefit**: Query exactly what we need, no over-fetching
  - **Implementation**: Apollo Client with `@apollo/client`

- **Supabase Queries** - Notes CRUD operations
  - **Why**: Supabase provides native GraphQL API
  - **Benefit**: Type-safe queries, automatic pagination
  - **Implementation**: Separate Apollo Client instance

### REST Used For:

- **OpenAI Integration** - AI generation endpoints
  - **Why**: OpenAI doesn't provide GraphQL API
  - **Benefit**: Simple POST requests, streaming support
  - **Endpoints**: `/api/generate/narration`, `/api/generate/insight`, `/api/evaluate`, `/api/search`

### Decision Rationale:

- Use GraphQL where natively supported (external APIs, Supabase)
- Use REST for AI operations and custom backend logic
- **Hybrid approach** optimizes for each use case

---

## 2. Client Architecture

### Dual GraphQL Clients:

```typescript
// Client 1: Rick & Morty API
graphqlClient → https://rickandmortyapi.com/graphql

// Client 2: Supabase
supabaseClient → Supabase GraphQL endpoint
```

### Why Separate Clients?

- Different authentication mechanisms
- Different caching strategies
- Cleaner separation of concerns

---

## 3. Database: Supabase (PostgreSQL)

### Chosen Over:

MongoDB, Firebase, or plain files

### Why Supabase?

- ✅ **Vector embeddings support** - pgvector extension for semantic search
- ✅ **GraphQL API** - Auto-generated from schema
- ✅ **Row Level Security** - Built-in auth
- ✅ **Real-time capabilities** - WebSocket subscriptions ready
- ✅ **PostgreSQL reliability** - ACID compliance

### Tables:

- `character_embeddings` - Vector search index
- `notes` - User/AI notes with character references

---

## 4. AI Evaluation: Hybrid Approach

### Quick Evaluation (Heuristic):

- Pattern matching for factual consistency
- Keyword analysis for tone matching
- Word count for completeness
- **Speed**: ~5ms
- **Use case**: Instant feedback

### Full Evaluation (LLM-as-Judge):

- GPT-4 evaluates creativity
- Combines with heuristic scores
- **Speed**: ~2-3s
- **Use case**: Detailed analysis

### Why Hybrid?

- Cost-effective (use LLM only when needed)
- Fast feedback loop
- Fallback mechanism if API fails

---

## 5. Semantic Search Architecture

### Flow:

1. User query → OpenAI `text-embedding-3-small`
2. Vector search in Supabase via `search_characters` RPC
3. Cosine similarity ranking
4. Return top N matches

### Why This Approach?

- ✅ Natural language queries ("green scientist")
- ✅ Better than exact text matching
- ✅ Handles typos and synonyms
- ✅ Scalable with pgvector indexing

---

## 6. AI SDK Choice: Vercel AI SDK

### Chosen Over:

LangChain, direct OpenAI SDK

### Why?

- ✅ Simple API: `generateText()`, `embed()`
- ✅ Streaming support (future feature ready)
- ✅ Type-safe
- ✅ Framework-agnostic
- ✅ Built-in error handling

---

## 7. Error Handling Strategy

### Graceful Degradation:

- No API key? → Show informative error
- LLM fails? → Fall back to heuristic evaluation
- Search fails? → Clear user message
- GraphQL error? → Display in UI

### Philosophy:

Never crash, always inform

---

## 8. TypeScript Usage

### Strict Typing:

- All API responses typed
- GraphQL types from queries
- Component props strictly typed

### Why?

- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
