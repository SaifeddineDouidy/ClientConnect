import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OpportunityForm } from '@/components/forms/OpportunityForm';
import { useOpportunityStore } from '@/store/opportunityStore';
import { colors } from '@/constants/Colors';
import { Opportunity } from '@/types';

export default function AddOpportunityScreen() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const addOpportunity = useOpportunityStore(state => state.addOpportunity);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (values: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      const opportunityId = await addOpportunity(values); // Wait for the ID
      router.push(`/opportunities/${opportunityId}`);
    } catch (error) {
      console.error('Error adding opportunity:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <OpportunityForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        preselectedClientId={clientId as string}
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
