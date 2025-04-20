import { Stack } from 'expo-router';
import { colors } from '@/constants/Colors';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}