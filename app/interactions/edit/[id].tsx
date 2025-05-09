import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';
import { useInteractionStore } from '@/store/interactionStore';
import { InteractionForm } from '@/components/forms/InteractionForm';
import { Interaction } from '@/types';

export default function EditInteractionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getInteraction, updateInteraction, isLoading } = useInteractionStore();
  
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const interactionData = getInteraction(id);
      if (interactionData) {
        setInteraction(interactionData);
      } else {
        Alert.alert('Error', 'Interaction not found');
        router.back();
      }
    }
  }, [id, getInteraction, router]);
  
  const handleSubmit = async (values: Omit<Interaction, 'id'>) => {
    try {
      setIsSubmitting(true);
      
      if (id) {
        await updateInteraction(id, values);
        router.replace(`/interactions/${id}`);
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
      Alert.alert('Error', 'Failed to update interaction');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !interaction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Edit Interaction' }} />
      
      <InteractionForm
        initialValues={interaction}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});