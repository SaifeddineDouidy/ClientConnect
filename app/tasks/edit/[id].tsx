import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';
import { useTaskStore } from '@/store/taskStore';
import { TaskForm } from '@/components/forms/TaskForm';
import { Task } from '@/types';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getTask, updateTask, isLoading } = useTaskStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const taskData = getTask(id);
      if (taskData) {
        setTask(taskData);
      } else {
        Alert.alert('Error', 'Task not found');
        router.back();
      }
    }
  }, [id, getTask, router]);
  
  const handleSubmit = async (values: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      
      if (id) {
        await updateTask(id, values);
        router.replace(`/tasks/${id}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Edit Task' }} />
      
      <TaskForm
        initialValues={task}
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