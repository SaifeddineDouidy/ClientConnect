import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InteractionForm } from '@/components/forms/InteractionForm';
import { useInteractionStore } from '@/store/interactionStore';
import { colors } from '@/constants/Colors';
import { Interaction } from '@/types';

export default function AddInteractionScreen() {
  const router = useRouter();
  const { clientId, opportunityId, type } = useLocalSearchParams();
  const addInteraction = useInteractionStore(state => state.addInteraction);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (values: Omit<Interaction, 'id'>) => {
    setIsLoading(true);
    
    try {
      addInteraction(values);
      router.back();
    } catch (error) {
      console.error('Error adding interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <InteractionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        preselectedClientId={clientId as string}
        preselectedOpportunityId={opportunityId as string}
        type={type as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});