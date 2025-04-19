import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OpportunityForm } from '@/components/forms/OpportunityForm';
import { useOpportunityStore } from '@/store/opportunityStore';
import { colors } from '@/constants/Colors';
import { Opportunity } from '@/types';

export default function EditOpportunityScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const getOpportunity = useOpportunityStore(state => state.getOpportunity);
  const updateOpportunity = useOpportunityStore(state => state.updateOpportunity);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const opportunityData = getOpportunity(id as string);
    if (opportunityData) {
      setOpportunity(opportunityData);
    } else {
      router.back();
    }
  }, [id]);
  
  const handleSubmit = (values: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      updateOpportunity(id as string, values);
      router.push(`/(stack)/opportunities/${id}`);
    } catch (error) {
      console.error('Error updating opportunity:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  if (!opportunity) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <OpportunityForm
        initialValues={opportunity}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
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