import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://rickandmortyapi.com/graphql",
  }),
  cache: new InMemoryCache(),
});
