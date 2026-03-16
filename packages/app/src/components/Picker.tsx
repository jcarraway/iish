import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Platform, Modal } from 'react-native';

export interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function Picker({ value, onValueChange, options, placeholder = 'Select...', disabled }: PickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  if (Platform.OS === 'web') {
    return (
      <View
        sx={{
          borderWidth: 1,
          borderColor: 'gray200',
          borderRadius: '$lg',
          bg: '$background',
          overflow: 'hidden',
        }}
      >
        {/* @ts-ignore - web-only select element */}
        <select
          value={value}
          onChange={(e: { target: { value: string } }) => onValueChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 14,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: value ? '#0a0a0a' : '#737373',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        sx={{
          borderWidth: 1,
          borderColor: 'gray200',
          borderRadius: '$lg',
          px: '$3',
          py: '$2',
          bg: '$background',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text sx={{ fontSize: '$sm', color: value ? '$foreground' : '$mutedForeground' }}>
          {selectedLabel}
        </Text>
        <Text sx={{ fontSize: '$xs', color: '$mutedForeground' }}>{'\u25BC'}</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          sx={{ flex: 1, bg: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={() => {}}
            sx={{
              bg: '$background',
              borderTopLeftRadius: '$xl',
              borderTopRightRadius: '$xl',
              maxHeight: '50%',
              pb: '$6',
            }}
          >
            <View sx={{ px: '$4', py: '$3', borderBottomWidth: 1, borderColor: 'gray200' }}>
              <Text sx={{ fontSize: '$base', fontWeight: '600', color: '$foreground' }}>
                {placeholder}
              </Text>
            </View>
            <ScrollView sx={{ px: '$2' }}>
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onValueChange(opt.value);
                    setModalVisible(false);
                  }}
                  sx={{
                    px: '$4',
                    py: '$3',
                    borderBottomWidth: 1,
                    borderColor: 'gray100',
                    bg: opt.value === value ? 'blue50' : 'transparent',
                  }}
                >
                  <Text
                    sx={{
                      fontSize: '$sm',
                      color: opt.value === value ? 'blue700' : '$foreground',
                      fontWeight: opt.value === value ? '600' : '400',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
