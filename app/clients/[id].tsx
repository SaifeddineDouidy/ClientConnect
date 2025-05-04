import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  Linking
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Edit, 
  Trash2, 
  Plus, 
  BarChart3, 
  Clock,
  Calendar,
} from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { OpportunityCard } from '@/components/OpportunityCard';
import { InteractionItem } from '@/components/InteractionItem';
import { TaskItem } from '@/components/TaskItem';
import { CallScreen } from '@/components/CallScreen';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useTaskStore } from '@/store/taskStore';
import { makePhoneCall, sendWhatsAppMessage, sendEmail } from '@/utils/helpers';
import { Client, Interaction, Opportunity, Task } from '@/types';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const getClient = useClientStore(state => state.getClient);
  const deleteClient = useClientStore(state => state.deleteClient);
  const getOpportunitiesByClient = useOpportunityStore(state => state.getOpportunitiesByClient);
  const getInteractionsByClient = useInteractionStore(state => state.getInteractionsByClient);
  const addInteraction = useInteractionStore(state => state.addInteraction);
  const getTasksByClient = useTaskStore(state => state.getTasksByClient);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  
  const [client, setClient] = useState<Client | null>(getClient(id as string) ?? null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCallScreen, setShowCallScreen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [id]) // Re-run if ID changes
  );
  
  useEffect(() => {
    if (!client) {
      router.back();
      return;
    }
    
    loadData();
  }, [id]);
  
  const loadData = () => {
    setClient(getClient(id as string) ?? null);
    setOpportunities(getOpportunitiesByClient(id as string));
    setInteractions(getInteractionsByClient(id as string).slice(0, 5));
    setTasks(getTasksByClient(id as string));
  };
  
  const handleEditClient = () => {
    router.push(`/clients/edit/${id}`);
  };
  
  const handleDeleteClient = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteClient(id as string);
            router.back();
          },
        },
      ],
    );
  };
  
  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No phone number available');
      return;
    }
    
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const phoneUrl = `tel:${formattedNumber}`;
    console.log('Attempting to call:', phoneUrl);
    
    Linking.openURL(phoneUrl).catch(err => {
      Alert.alert('Error', 'Failed to make call: ' + err.message);
      console.error('Call Error:', err);
    });
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
  
  const handleAddOpportunity = () => {
    router.push({
      pathname: '/opportunities/add',
      params: { clientId: id },
    });
  };
  
  const handleAddInteraction = (type: string) => {
    router.push({
      pathname: '/interactions/add',
      params: { clientId: id, type },
    });
  };
  
  const handleAddTask = () => {
    router.push({
      pathname: '/tasks/add',
      params: { clientId: id },
    });
  };
  
  const handleOpportunityPress = (opportunity: Opportunity) => {
    router.push(`/opportunities/${opportunity.id}`);
  };
  
  const handleInteractionPress = (interaction: Interaction) => {
    router.push(`/interactions/${interaction.id}`);
  };
  
  const handleTaskPress = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };
  
  const handleCallComplete = (interaction: Omit<Interaction, 'id'>) => {
    addInteraction(interaction);
    loadData();
  };
  
  if (!client) {
    return null;
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar
            firstName={client.firstName}
            lastName={client.lastName}
            imageUrl={client.avatar}
            size={80}
          />
        </View>
        
        <Text style={styles.name}>{`${client.firstName} ${client.lastName}`}</Text>
        <Text style={styles.company}>{client.company}</Text>
        <Text style={styles.position}>{client.position}</Text>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleCall(client.phone)} // Pass client.phone here
        >
          <Phone size={24} color={colors.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Mail size={24} color={colors.primary} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <MessageCircle size={24} color={colors.primary} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{client.email}</Text>
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{client.phone}</Text>
          </View>
          
          {client.address && (
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{client.address}</Text>
            </View>
          )}
        </Card>
      </View>
      
      {client.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.notes}>{client.notes}</Text>
          </Card>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Opportunities</Text>
          <TouchableOpacity onPress={handleAddOpportunity}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {opportunities.length > 0 ? (
          opportunities.map(opportunity => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onPress={handleOpportunityPress}
            />
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <BarChart3 size={32} color={colors.grey} />
              <Text style={styles.emptyText}>No opportunities yet</Text>
              <Button
                title="Add Opportunity"
                onPress={handleAddOpportunity}
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
          <Text style={styles.sectionTitle}>Recent Activity</Text>
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
          <>
            {interactions.map(interaction => (
              <InteractionItem
                key={interaction.id}
                interaction={interaction}
                onPress={handleInteractionPress}
              />
            ))}
            
            {interactions.length < getInteractionsByClient(id as string).length && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setInteractions(getInteractionsByClient(id as string))}
              >
                <Text style={styles.viewAllText}>View All Activity</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Clock size={32} color={colors.grey} />
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
          title="Edit Client"
          onPress={handleEditClient}
          variant="outline"
          icon={<Edit size={16} color={colors.primary} />}
          style={styles.footerButton}
        />
        <Button
          title="Delete Client"
          onPress={handleDeleteClient}
          variant="danger"
          icon={<Trash2 size={16} color={colors.white} />}
          style={styles.footerButton}
        />
      </View>
      
      <CallScreen
        client={client}
        visible={showCallScreen}
        onClose={() => setShowCallScreen(false)}
        onCallComplete={handleCallComplete}
      />
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  company: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: colors.white,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    color: colors.primary,
    fontWeight: '500',
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
  contactInfo: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
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
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '500',
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