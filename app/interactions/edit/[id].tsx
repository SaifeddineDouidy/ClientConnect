import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { interactionService } from '@/services/firestore';
import { colors } from '@/constants/Colors';
import { Interaction } from '@/types';
import { InteractionForm } from '@/components/forms/InteractionForm';

export default function EditInteractionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Interaction ID is missing');
          setLoading(false);
          return;
        }
        
        const interactionData = await interactionService.getInteraction(id);
        
        if (!interactionData) {
          setError('Interaction not found');
          setLoading(false);
          return;
        }
        
        setInteraction(interactionData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching interaction:', error);
        setError('Failed to load interaction');
        setLoading(false);
      }
    };
    
    fetchInteraction();
  }, [id]);
  
  const handleSubmit = async (updatedInteraction: Partial<Interaction>) => {
    try {
      if (!id) return;
      
      await interactionService.updateInteraction(id, updatedInteraction);
      router.back();
    } catch (error) {
      console.error('Error updating interaction:', error);
      setError('Failed to update interaction');
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            {interaction && (
              <InteractionForm
                initialValues={interaction}
                onSubmit={handleSubmit} 
                onCancel={function (): void {
                  throw new Error('Function not implemented.');
                } }              
                />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});