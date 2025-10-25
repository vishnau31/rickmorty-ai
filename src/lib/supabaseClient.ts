import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please check your environment configuration.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please check your environment configuration.'
  );
}

export const supabaseClient = new ApolloClient({
  link: new HttpLink({
    uri: `${supabaseUrl}/graphql/v1`,
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});

export interface Note {
  id: string;
  character_id: string;
  character_name: string;
  content: string;
  type: 'user' | 'ai-insight' | 'narration';
  created_at: string;
}

