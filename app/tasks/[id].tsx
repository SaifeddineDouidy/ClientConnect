import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Edit, Trash2, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { useTaskStore } from '@/store/taskStore';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { formatDate } from '@/utils/helpers';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Task, Client, Opportunity } from '@/types';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getTask, deleteTask, toggleTaskCompletion, isLoading } = useTaskStore();
  const { getClient } = useClientStore();
  const { getOpportunity } = useOpportunityStore();
  
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  
  useEffect(() => {
    if (id) {
      const taskData = getTask(id);
      if (taskData) {
        setTask(taskData);
        
        // Get related client if exists
        if (taskData.clientId) {
          const clientData = getClient(taskData.clientId);
          if (clientData) {
            setClient(clientData);
          }
        }
        
        // Get related opportunity if exists
        if (taskData.opportunityId) {
          const opportunityData = getOpportunity(taskData.opportunityId);
          if (opportunityData) {
            setOpportunity(opportunityData);
          }
        }
      } else {
        // Handle case where task is not found
        Alert.alert('Error', 'Task not found');
        router.back();
      }
    }
  }, [id, getTask, getClient, getOpportunity, router]);
  
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
              if (id) {
                await deleteTask(id);
                router.back();
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        },
      ]
    );
  };
  
  const handleEdit = () => {
    if (id) {
      router.push(`/tasks/edit/${id}`);
    }
  };
  
  const handleToggleCompletion = async () => {
    if (id && task) {
      try {
        setIsToggling(true);
        await toggleTaskCompletion(id);
        setTask({
          ...task,
          completed: !task.completed
        });
      } catch (error) {
        console.error('Error toggling task completion:', error);
        Alert.alert('Error', 'Failed to update task status');
      } finally {
        setIsToggling(false);
      }
    }
  };
  
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={20} color={colors.danger} />;
      case 'medium':
        return <AlertCircle size={20} color={colors.warning} />;
      case 'low':
        return <AlertCircle size={20} color={colors.success} />;
      default:
        return <AlertCircle size={20} color={colors.grey} />;
    }
  };
  
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.grey;
    }
  };
  
  const isOverdue = (dueDate: number) => {
    return !task?.completed && dueDate < Date.now();
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No task data found</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Task Details',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{task.title}</Text>
              <View style={styles.statusContainer}>
                {isToggling ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Switch
                    value={task.completed}
                    onValueChange={handleToggleCompletion}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={task.completed ? colors.primary : colors.grey}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.metaContainer}>
              <View style={styles.priorityContainer}>
                {getPriorityIcon(task.priority)}
                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Calendar size={16} color={isOverdue(task.dueDate) ? colors.danger : colors.textLight} style={styles.icon} />
                <Text 
                  style={[
                    styles.dateText, 
                    isOverdue(task.dueDate) && styles.overdueText
                  ]}
                >
                  {isOverdue(task.dueDate) ? 'Overdue: ' : 'Due: '}
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusIndicator}>
              {task.completed ? (
                <>
                  <CheckCircle size={20} color={colors.success} style={styles.statusIcon} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Completed</Text>
                </>
              ) : (
                <>
                  <XCircle size={20} color={isOverdue(task.dueDate) ? colors.danger : colors.textLight} style={styles.statusIcon} />
                  <Text 
                    style={[
                      styles.statusText, 
                      { color: isOverdue(task.dueDate) ? colors.danger : colors.textLight }
                    ]}
                  >
                    {isOverdue(task.dueDate) ? 'Overdue' : 'Pending'}
                  </Text>
                </>
              )}
            </View>
          </View>
          
          {task.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          )}
          
          {client && (
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Related Client</Text>
              <TouchableOpacity 
                style={styles.clientCard}
                onPress={() => router.push(`/clients/${client.id}`)}
              >
                <Avatar 
                  firstName={`${client.firstName}`}
                  lastName={` ${client.lastName}`}
                  size={40}
                  imageUrl={client.avatar}
                />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
                  <Text style={styles.clientCompany}>{client.company}</Text>
                </View>
                <ArrowLeft size={16} color={colors.textLight} style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>
          )}
          
          {opportunity && (
            <View style={styles.opportunitySection}>
              <Text style={styles.sectionTitle}>Related Opportunity</Text>
              <TouchableOpacity 
                style={styles.opportunityCard}
                onPress={() => router.push(`/opportunities/${opportunity.id}`)}
              >
                <View style={styles.opportunityInfo}>
                  <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                </View>
                <ArrowLeft size={16} color={colors.textLight} style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.createdSection}>
            <Text style={styles.sectionTitle}>Created</Text>
            <Text style={styles.createdText}>{formatDate(task.createdAt)}</Text>
          </View>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button 
            title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            onPress={handleToggleCompletion}
            variant={task.completed ? "outline" : "primary"}
            style={styles.completeButton}
            loading={isToggling}
          />
          <Button 
            title="Back to List" 
            onPress={() => router.back()} 
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '500',
  },
  icon: {
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  clientSection: {
    marginBottom: 16,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  clientCompany: {
    fontSize: 14,
    color: colors.textLight,
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
  },
  opportunitySection: {
    marginBottom: 16,
  },
  opportunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  opportunityInfo: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  createdSection: {
    marginBottom: 8,
  },
  createdText: {
    fontSize: 14,
    color: colors.textLight,
  },
  buttonContainer: {
    marginTop: 8,
  },
  completeButton: {
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
});