import { useState } from 'react';
import { View, Text, Pressable } from 'dripsy';

interface TranslationSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function TranslationSection({ title, subtitle, defaultOpen = true, children }: TranslationSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View sx={{ borderBottomWidth: 1, borderColor: 'gray200', py: '$8' }}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        sx={{
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text sx={{ fontSize: '$xl', fontWeight: '700', color: 'gray900' }}>{title}</Text>
          {subtitle && (
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>{subtitle}</Text>
          )}
        </View>
        <Text sx={{ fontSize: '$base', color: 'gray400' }}>
          {isOpen ? '\u25B2' : '\u25BC'}
        </Text>
      </Pressable>
      {isOpen && <View sx={{ mt: '$4' }}>{children}</View>}
    </View>
  );
}
