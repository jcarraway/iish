import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['../api/src/schema.ts'],
  documents: ['src/**/*.graphql', 'src/**/*.tsx', 'src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
        withHooks: true,
        apolloClientVersion: 3,
        addTypename: true,
        skipTypename: false,
        useTypeImports: true,
        enumsAsConst: true,
        noNamespaces: true,
        preResolveTypes: true,
        dedupeFragments: true,
      },
    },
  },
};

export default config;
