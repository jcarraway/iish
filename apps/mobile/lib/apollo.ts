import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';
import { createCache } from '@oncovax/app';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const httpLink = new HttpLink({
  uri: `${BASE_URL}/api/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('auth_token');
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: createCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
  },
});
