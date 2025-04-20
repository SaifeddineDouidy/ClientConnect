import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign, 
  Calendar, 
  BarChart, 
  User,
  Phone,
  MessageCircle,
  Mail,
} from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { InteractionItem } from '@/components/InteractionItem';
import { TaskItem } from '@/components/TaskItem';
import { StageIndicator } from '@/components/StageIndicator';
import { CallScreen } from '@/components/CallScreen';
import { useOpportunityStore } from '@/store/opportunityStore';
import { useClientStore } from '@/store/clientStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useTaskStore } from '@/store/taskStore';
import { formatCurrency, formatDate, makePhoneCall, sendWhatsAppMessage, sendEmail } from '@/utils/helpers';
import { Client, Interaction, Opportunity, Task } from '@/types';

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const getOpportunity = useOpportunityStore(state => state.getOpportunity);
  const deleteOpportunity = useOpportunityStore(state => state.deleteOpportunity);
  const getClient = useClientStore(state => state.getClient);
  const getInteractionsByOpportunity = useInteractionStore(state => state.getInteractionsByOpportunity);
  const addInteraction = useInteractionStore(state => state.addInteraction);
  const getTasksByOpportunity = useTaskStore(state => state.getTasksByOpportunity);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(getOpportunity(id as string) ?? null);
  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCallScreen, setShowCallScreen] = useState(false);

  const loadAllData = useCallback(() => {
    const opportunityData = getOpportunity(id as string);
    setOpportunity(opportunityData ?? null);

    if (opportunityData) {
      const clientData = getClient(opportunityData.clientId);
      setClient(clientData ?? null);
      setInteractions(getInteractionsByOpportunity(id as string));
      setTasks(getTasksByOpportunity(id as string))
    } else {
        router.back();
    }
  }, [id, getOpportunity, getClient, getInteractionsByOpportunity, getTasksByOpportunity, router]);

  useEffect(() => {
    loadAllData();
  }, [id, loadAllData]);

  
  
  const handleEditOpportunity = () => {
    router.push(`/oppurutnities/edit/${id}`);
  };
  
  const handleDeleteOpportunity = () => {
    Alert.alert(
      'Delete Opportunity',
      'Are you sure you want to delete this opportunity? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteOpportunity(id as string);
            router.back();
          },
        },
      ],
    );
  };
  
  const handleClientPress = () => {
    if (client) {
      router.push(`/clients/${client.id}`);
    }
  };
  
  const handleCall = () => {
    if (client) {
      setShowCallScreen(true);
    }
  };
  
  const handleEmail = () => {
    if (client) {
      sendEmail(client.email);
    }
  };
  
  const handleMessage = () => {
    if (client) {
      sendWhatsAppMessage(client.phone);
    }
  };
  
  const handleAddInteraction = (type: string) => {
    router.push({
      pathname: '/interactions/add',
      params: { clientId: client?.id, opportunityId: id, type },
    });
  };
  
  const handleAddTask = () => {
    router.push({
      pathname: '/tasks/add',
      params: { clientId: client?.id, opportunityId: id },
    });
  };
  
  const handleInteractionPress = (interaction: Interaction) => {
    router.push(`/interactions/edit/${interaction.id}`);
  };
  
  const handleTaskPress = (task: Task) => {
    router.push(`/tasks/add`);
  };
  
  const handleCallComplete = (interaction: Omit<Interaction, 'id'>) => {
    const interactionWithOpportunity = {
      ...interaction,
      opportunityId: id as string,
    };
    addInteraction(interactionWithOpportunity);
    loadAllData()
  };
  
  if (!opportunity || !client) {
    return null;
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{opportunity.title}</Text>
        <View style={styles.valueContainer}>
          <DollarSign size={20} color={colors.primary} />
          <Text style={styles.value}>{formatCurrency(opportunity.value)}</Text>
        </View>
      </View>
      
      <StageIndicator currentStage={opportunity.stage} />
      
      <View style={styles.section}>
        <Card variant="outlined" style={styles.card}>
          <TouchableOpacity style={styles.clientContainer} onPress={handleClientPress}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientLabel}>Client</Text>
              <Text style={styles.clientName}>{`${client.firstName} ${client.lastName}`}</Text>
              <Text style={styles.clientCompany}>{client.company}</Text>
            </View>
            <View style={styles.clientActions}>
              <TouchableOpacity style={styles.clientAction} onPress={handleCall}>
                <Phone size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.clientAction} onPress={handleMessage}>
                <MessageCircle size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.clientAction} onPress={handleEmail}>
                <Mail size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <View style={styles.detailsContainer}>
            {opportunity.probability !== undefined && (
              <View style={styles.detailItem}>
                <BarChart size={20} color={colors.textLight} />
                <Text style={styles.detailLabel}>Probability:</Text>
                <Text style={styles.detailValue}>{opportunity.probability}%</Text>
              </View>
            )}
            
            {opportunity.expectedCloseDate && (
              <View style={styles.detailItem}>
                <Calendar size={20} color={colors.textLight} />
                <Text style={styles.detailLabel}>Expected Close:</Text>
                <Text style={styles.detailValue}>{formatDate(opportunity.expectedCloseDate)}</Text>
              </View>
            )}
          </View>
        </Card>
      </View>
      
      {opportunity.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.notes}>{opportunity.notes}</Text>
          </Card>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.interactionButtons}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => handleAddInteraction('call')}
            >
              <Phone size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => handleAddInteraction('message')}
            >
              <MessageCircle size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => handleAddInteraction('note')}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {interactions.length > 0 ? (
          interactions.map(interaction => (
            <InteractionItem
              key={interaction.id}
              interaction={interaction}
              onPress={handleInteractionPress}
            />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Calendar size={32} color={colors.grey} />
              <Text style={styles.emptyText}>No activity recorded yet</Text>
              <Button
                title="Add Interaction"
                onPress={() => handleAddInteraction('note')}
                variant="outline"
                size="small"
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <TouchableOpacity onPress={handleAddTask}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onPress={handleTaskPress}
              onToggle={toggleTaskCompletion}
            />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Calendar size={32} color={colors.grey} />
              <Text style={styles.emptyText}>No tasks assigned</Text>
              <Button
                title="Add Task"
                onPress={handleAddTask}
                variant="outline"
                size="small"
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Edit Opportunity"
          onPress={handleEditOpportunity}
          variant="outline"
          icon={<Edit size={16} color={colors.primary} />}
          style={styles.footerButton}
        />
        <Button
          title="Delete Opportunity"
          onPress={handleDeleteOpportunity}
          variant="danger"
          icon={<Trash2 size={16} color={colors.white} />}
          style={styles.footerButton}
        />
      </View>
      
      {client && (
        <CallScreen
          client={client}
          visible={showCallScreen}
          onClose={() => setShowCallScreen(false)}
          onCallComplete={handleCallComplete}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
  },
  clientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
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
  clientActions: {
    flexDirection: 'row',
  },
  clientAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  notes: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  interactionButtons: {
    flexDirection: 'row',
  },
  interactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginVertical: 8,
  },
  emptyButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});