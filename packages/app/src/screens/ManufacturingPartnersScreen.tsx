import { useState } from 'react';
import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Picker, ManufacturingPartnerCard } from '../components';
import { useGetManufacturingPartnersQuery } from '../generated/graphql';

const TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'CDMO', value: 'cdmo' },
  { label: 'Academic', value: 'academic' },
  { label: 'Biotech', value: 'biotech' },
];

const CAPABILITY_OPTIONS = [
  { label: 'All Capabilities', value: '' },
  { label: 'mRNA Synthesis', value: 'mrna_synthesis' },
  { label: 'Lipid Nanoparticle', value: 'lipid_nanoparticle' },
  { label: 'Fill & Finish', value: 'fill_finish' },
  { label: 'Quality Control', value: 'quality_control' },
];

export function ManufacturingPartnersScreen() {
  const [type, setType] = useState('');
  const [capability, setCapability] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const { data, loading } = useGetManufacturingPartnersQuery({
    variables: {
      type: type || undefined,
      capability: capability || undefined,
    },
  });

  const partners = data?.manufacturingPartners ?? [];
  const countries = [...new Set(partners.map((p) => p.country))].sort();
  const filtered = countryFilter
    ? partners.filter((p) => p.country === countryFilter)
    : partners;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Manufacturing Partners
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Browse contract manufacturing organizations (CDMOs) for personalized mRNA vaccines.
        </Text>

        {/* Filters */}
        <View sx={{ mt: '$6', gap: 12 }}>
          <Picker
            value={type}
            onValueChange={setType}
            options={TYPE_OPTIONS}
            placeholder="Type"
          />
          <Picker
            value={capability}
            onValueChange={setCapability}
            options={CAPABILITY_OPTIONS}
            placeholder="Capability"
          />
          {countries.length > 1 && (
            <Picker
              value={countryFilter}
              onValueChange={setCountryFilter}
              options={[
                { label: 'All Countries', value: '' },
                ...countries.map((c) => ({ label: c, value: c })),
              ]}
              placeholder="Country"
            />
          )}
        </View>

        {loading && (
          <View sx={{ mt: '$8', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {!loading && filtered.length === 0 && (
          <View sx={{ mt: '$8', alignItems: 'center', py: '$16', bg: 'gray50', borderRadius: '$xl' }}>
            <Text sx={{ color: 'gray500' }}>No partners found matching your filters.</Text>
          </View>
        )}

        <View sx={{ mt: '$6', gap: '$4' }}>
          {filtered.map((partner) => (
            <ManufacturingPartnerCard
              key={partner.id}
              id={partner.id}
              name={partner.name}
              slug={partner.slug}
              type={partner.type}
              capabilities={partner.capabilities}
              certifications={partner.certifications}
              costRangeMin={partner.costRangeMin ?? null}
              costRangeMax={partner.costRangeMax ?? null}
              turnaroundWeeksMin={partner.turnaroundWeeksMin ?? null}
              turnaroundWeeksMax={partner.turnaroundWeeksMax ?? null}
              country={partner.country}
              regulatorySupport={partner.regulatorySupport ?? []}
              description={partner.description ?? null}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
