import { ApolloClient, HttpLink, type NormalizedCacheObject } from '@apollo/client';
import { createCache } from '@iish/app';

function createApolloClient() {
  const httpLink = new HttpLink({
    uri:
      typeof window === 'undefined'
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/graphql`
        : '/api/graphql',
    credentials: 'include',
  });

  return new ApolloClient({
    link: httpLink,
    cache: createCache() as unknown as ApolloClient<NormalizedCacheObject>['cache'],
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
      },
    },
  });
}

export const apolloClient = createApolloClient();
