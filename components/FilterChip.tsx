import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/Colors';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          selected ? styles.selectedLabel : styles.unselectedLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLabel: {
    color: colors.white,
  },
  unselectedLabel: {
    color: colors.text,
  },
});