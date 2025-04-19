import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClientForm } from '@/components/forms/ClientForm';
import { useClientStore } from '@/store/clientStore';
import { colors } from '@/constants/colors';
import { Client } from '@/types';

export default function EditClientScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const getClient = useClientStore(state => state.getClient);
  const updateClient = useClientStore(state => state.updateClient);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const clientData = getClient(id as string);
    if (clientData) {
      setClient(clientData);
    } else {
      router.back();
    }
  }, [id]);
  
  const handleSubmit = (values: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      updateClient(id as string, values);
      router.push(`/clients/${id}`);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  if (!client) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <ClientForm
        initialValues={client}
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