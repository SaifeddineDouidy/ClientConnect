import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ClientForm } from '@/components/forms/ClientForm';
import { useClientStore } from '@/store/clientStore';
import { colors } from '@/constants/colors';
import { Client } from '@/types';

export default function AddClientScreen() {
  const router = useRouter();
  const addClient = useClientStore(state => state.addClient);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (values: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      const clientId = addClient(values);
      router.push(`/clients/${clientId}`);
    } catch (error) {
      console.error('Error adding client:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <ClientForm
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