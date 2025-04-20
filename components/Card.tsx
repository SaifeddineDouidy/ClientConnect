import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevatedCard;
      case 'outlined':
        return styles.outlinedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.white,
  },
  defaultCard: {
    backgroundColor: colors.white,
  },
  elevatedCard: {
    backgroundColor: colors.white,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  outlinedCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});