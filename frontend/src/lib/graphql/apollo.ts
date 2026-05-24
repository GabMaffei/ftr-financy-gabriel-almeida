import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { useAuthStore } from "../../stores/auth";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL || "http://localhost:4000/graphql",
});

const authLink = new SetContextLink((prevContext) => {
  const token = useAuthStore.getState().token;

  return {
    headers: {
      ...prevContext.headers, 
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', 
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only', 
      errorPolicy: 'all',
    },
  }
});