import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'dripsy';
import { useGetHealthSystemsLazyQuery } from '../generated/graphql';

interface Props {
  onSelect: (system: {
    id: string;
    name: string;
    fhirBaseUrl: string;
    brand?: string;
    city?: string;
    state?: string;
    ehrVendor: string;
    isCancerCenter: boolean;
  }) => void;
}

export function HealthSystemSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [fetchSystems, { data, loading }] = useGetHealthSystemsLazyQuery();

  const results = data?.healthSystems ?? [];

  useEffect(() => {
    fetchSystems({ variables: { search: undefined } }).then(() => setHasSearched(true));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSystems({ variables: { search: query || undefined } }).then(() => setHasSearched(true));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by hospital name, city, or state..."
        autoFocus
        sx={{
          width: '100%',
          borderRadius: '$lg',
          borderWidth: 1,
          borderColor: 'gray300',
          py: '$3',
          px: '$4',
          fontSize: '$sm',
        }}
      />

      <View
        sx={{
          mt: '$3',
          maxHeight: 320,
          borderRadius: '$lg',
          borderWidth: 1,
          borderColor: 'gray200',
          overflow: 'hidden',
        }}
      >
        {loading && !hasSearched ? (
          <View sx={{ py: '$8', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" sx={{ color: 'blue600' }} />
          </View>
        ) : results.length === 0 ? (
          <View sx={{ py: '$8', alignItems: 'center' }}>
            <Text sx={{ fontSize: '$sm', color: 'gray500' }}>
              {hasSearched ? 'No health systems found' : 'Loading...'}
            </Text>
          </View>
        ) : (
          <ScrollView sx={{ maxHeight: 320 }}>
            {results.map((system) => (
              <Pressable
                key={system.id}
                onPress={() => onSelect({
                  ...system,
                  brand: system.brand ?? undefined,
                  city: system.city ?? undefined,
                  state: system.state ?? undefined,
                })}
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '$3',
                  borderBottomWidth: 1,
                  borderColor: 'gray100',
                  px: '$4',
                  py: '$3',
                }}
              >
                <View
                  sx={{
                    height: 40,
                    width: 40,
                    borderRadius: '$lg',
                    bg: 'blue100',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text sx={{ fontSize: '$base', color: 'blue600' }}>{'\u{1F3E5}'}</Text>
                </View>
                <View sx={{ flex: 1 }}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                    <Text numberOfLines={1} sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900', flex: 1 }}>
                      {system.name}
                    </Text>
                    {system.isCancerCenter && (
                      <View sx={{ borderRadius: '$full', bg: 'purple100', px: '$2', py: 2 }}>
                        <Text sx={{ fontSize: 10, fontWeight: '500', color: 'purple700' }}>
                          Cancer Center
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
                    {[system.city, system.state].filter(Boolean).join(', ')}
                    {system.brand && system.brand !== 'MyChart' && ` \u00B7 ${system.brand}`}
                  </Text>
                </View>
                <Text sx={{ fontSize: '$sm', color: 'gray400' }}>{'\u203A'}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
