import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskForm } from '@/components/forms/TaskForm';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/Colors';
import { Task } from '@/types';

export default function AddTaskScreen() {
  const router = useRouter();
  const { clientId, opportunityId } = useLocalSearchParams();
  const addTask = useTaskStore(state => state.addTask);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (values: Omit<Task, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    
    try {
      addTask(values);
      router.back();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        preselectedClientId={clientId as string}
        preselectedOpportunityId={opportunityId as string}
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