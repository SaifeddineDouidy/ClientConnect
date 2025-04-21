import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { taskService } from '@/services/firestore';
import { clientService } from '@/services/firestore';
import { opportunityService } from '@/services/firestore';
import { colors } from '@/constants/Colors';
import { Task, Client, Opportunity } from '@/types';
import { Calendar, FileText, Users, Briefcase, Trash2, Edit, ArrowRight, CheckCircle, AlertCircle, Flag } from 'lucide-react-native';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Task ID is missing');
          setLoading(false);
          return;
        }
        
        // Fetch task details
        const taskData = await taskService.getTask(id);
        
        if (!taskData) {
          setError('Task not found');
          setLoading(false);
          return;
        }
        
        setTask(taskData);
        
        // Fetch related client
        if (taskData.clientId) {
          const clientData = await clientService.getClient(taskData.clientId);
          setClient(clientData);
        }
        
        // Fetch related opportunity
        if (taskData.opportunityId) {
          const opportunityData = await opportunityService.getOpportunity(taskData.opportunityId);
          setOpportunity(opportunityData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task details:', error);
        setError('Failed to load task details');
        setLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [id]);
  
  const handleEdit = () => {
    router.push(`/tasks/edit/${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (!id) return;
              
              await taskService.deleteTask(id);
              router.back();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        },
      ]
    );
  };
  
  const handleToggleCompletion = async () => {
    try {
      if (!id || !task) return;
      
      await taskService.toggleTaskCompletion(id);
      setTask({
        ...task,
        completed: !task.completed,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.primary;
      default:
        return colors.secondary;
    }
  };
  
  const isOverdue = (dueDate: number) => {
    return new Date(dueDate) < new Date() && !task?.completed;
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  if (error || !task) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load task'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.title,
              task.completed && styles.completedTitle
            ]}>
              {task.title}
            </Text>
            {task.completed ? (
              <CheckCircle size={20} color={colors.success} style={styles.statusIcon} />
            ) : isOverdue(task.dueDate) ? (
              <AlertCircle size={20} color={colors.warning} style={styles.statusIcon} />
            ) : null}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Trash2 size={20} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.completionContainer}>
            <Text style={styles.completionLabel}>Mark as completed</Text>
            <Switch
              value={task.completed}
              onValueChange={handleToggleCompletion}
              trackColor={{ false: colors.lightGrey, true: colors.success }}
              thumbColor={task.completed ? colors.success : colors.white}
            />
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={18} color={colors.secondary} />
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={[
              styles.infoValue,
              isOverdue(task.dueDate) && styles.overdueText
            ]}>
              {format(new Date(task.dueDate), 'PPP')}
              {isOverdue(task.dueDate) && ' (Overdue)'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Flag size={18} color={getPriorityColor(task.priority)} />
            <Text style={styles.infoLabel}>Priority:</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: `${getPriorityColor(task.priority)}20` }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(task.priority) }
              ]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        {client && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Client</Text>
            <TouchableOpacity 
              style={styles.relatedItemContainer}
              onPress={() => router.push(`/clients/${client.id}`)}
            >
              <View style={styles.relatedItemContent}>
                <Text style={styles.relatedItemTitle}>
                  {client.firstName} {client.lastName}
                </Text>
                <Text style={styles.relatedItemSubtitle}>{client.company}</Text>
              </View>
              <ArrowRight size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {opportunity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Opportunity</Text>
            <TouchableOpacity 
              style={styles.relatedItemContainer}
              onPress={() => router.push(`/opportunities/${opportunity.id}`)}
            >
              <View style={styles.relatedItemContent}>
                <Text style={styles.relatedItemTitle}>{opportunity.title}</Text>
                <Text style={styles.relatedItemSubtitle}>
                  ${opportunity.value.toLocaleString()} • {opportunity.stage}
                </Text>
              </View>
              <ArrowRight size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.warning,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.secondary,
  },
  statusIcon: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completionLabel: {
    fontSize: 16,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  overdueText: {
    color: colors.warning,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  relatedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
  },
  relatedItemContent: {
    flex: 1,
  },
  relatedItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  relatedItemSubtitle: {
    fontSize: 12,
    color: colors.secondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});