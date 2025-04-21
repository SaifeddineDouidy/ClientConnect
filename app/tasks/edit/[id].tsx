import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskService } from '@/services/firestore';
import { colors } from '@/constants/Colors';
import { Task } from '@/types';
import { TaskForm } from '@/components/forms/TaskForm';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Task ID is missing');
          setLoading(false);
          return;
        }
        
        const taskData = await taskService.getTask(id);
        
        if (!taskData) {
          setError('Task not found');
          setLoading(false);
          return;
        }
        
        setTask(taskData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task:', error);
        setError('Failed to load task');
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  const handleSubmit = async (updatedTask: Partial<Task>) => {
    try {
      if (!id) return;
      
      await taskService.updateTask(id, updatedTask);
      router.back();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
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
            {task && (
              <TaskForm
                initialValues={task}
                onSubmit={handleSubmit} onCancel={function (): void {
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