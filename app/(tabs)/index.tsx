import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Users, 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Phone, 
  MessageCircle,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { ClientCard } from '@/components/ClientCard';
import { OpportunityCard } from '@/components/OpportunityCard';
import { InteractionItem } from '@/components/InteractionItem';
import { TaskItem } from '@/components/TaskItem';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useTaskStore } from '@/store/taskStore';
import { formatCurrency } from '@/utils/helpers';
import { Client, Interaction, Opportunity, Task } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const clients = useClientStore(state => state.clients);
  const opportunities = useOpportunityStore(state => state.opportunities);
  const getTotalOpportunityValue = useOpportunityStore(state => state.getTotalOpportunityValue);
  const getRecentInteractions = useInteractionStore(state => state.getRecentInteractions);
  const getUpcomingTasks = useTaskStore(state => state.getUpcomingTasks);
  const getOverdueTasks = useTaskStore(state => state.getOverdueTasks);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  
  const [recentInteractions, setRecentInteractions] = useState<Interaction[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    loadData();
  }, [clients, opportunities]);
  
  const loadData = () => {
    setRecentInteractions(getRecentInteractions(5));
    setUpcomingTasks(getUpcomingTasks(7));
    setOverdueTasks(getOverdueTasks());
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };
  
  const handleClientPress = (client: Client) => {
    router.push(`/clients/${client.id}`);
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
  
  const handleAddClient = () => {
    router.push('/clients/add');
  };
  
  const handleAddOpportunity = () => {
    router.push('/opportunities/add');
  };
  
  const handleAddTask = () => {
    router.push('/tasks/add');
  };
  
  const handleAddInteraction = (type: string) => {
    router.push({
      pathname: '/interactions/add',
      params: { type },
    });
  };
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to ClientConnect</Text>
        <Text style={styles.subGreeting}>Your CRM dashboard</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <Users size={24} color={colors.primary} />
            <Text style={styles.statValue}>{clients.length}</Text>
          </View>
          <Text style={styles.statLabel}>Clients</Text>
        </Card>
        
        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <BarChart3 size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{opportunities.length}</Text>
          </View>
          <Text style={styles.statLabel}>Opportunities</Text>
        </Card>
        
        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <TrendingUp size={24} color={colors.success} />
            <Text style={styles.statValue}>{formatCurrency(getTotalOpportunityValue())}</Text>
          </View>
          <Text style={styles.statLabel}>Pipeline Value</Text>
        </Card>
      </View>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleAddClient}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryLight }]}>
            <Plus size={20} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Add Client</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleAddOpportunity}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryLight }]}>
            <Plus size={20} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Add Deal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleAddInteraction('call')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E6F7FF' }]}>
            <Phone size={20} color="#0099FF" />
          </View>
          <Text style={styles.quickActionText}>Log Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleAddInteraction('message')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#E6FFE6' }]}>
            <MessageCircle size={20} color="#00CC00" />
          </View>
          <Text style={styles.quickActionText}>Message</Text>
        </TouchableOpacity>
      </View>
      
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Clock size={20} color={colors.danger} />
              <Text style={[styles.sectionTitle, { color: colors.danger }]}>Overdue Tasks</Text>
            </View>
          </View>
          
          <View style={styles.sectionContent}>
            {overdueTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onPress={handleTaskPress}
                onToggle={toggleTaskCompletion}
              />
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          </View>
          <TouchableOpacity onPress={handleAddTask}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionContent}>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onPress={handleTaskPress}
                onToggle={toggleTaskCompletion}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming tasks</Text>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/tasks')}
          >
            <Text style={styles.viewAllText}>View All Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Users size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Recent Clients</Text>
          </View>
          <TouchableOpacity onPress={handleAddClient}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {clients.length > 0 ? (
            clients.slice(0, 5).map(client => (
              <View key={client.id} style={styles.horizontalCard}>
                <ClientCard
                  client={client}
                  onPress={handleClientPress}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No clients added yet</Text>
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/clients')}
        >
          <Text style={styles.viewAllText}>View All Clients</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <BarChart3 size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Recent Opportunities</Text>
          </View>
          <TouchableOpacity onPress={handleAddOpportunity}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionContent}>
          {opportunities.length > 0 ? (
            opportunities.slice(0, 3).map(opportunity => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onPress={handleOpportunityPress}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No opportunities added yet</Text>
          )}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/opportunities')}
          >
            <Text style={styles.viewAllText}>View All Opportunities</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Clock size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
        </View>
        
        <View style={styles.sectionContent}>
          {recentInteractions.length > 0 ? (
            recentInteractions.map(interaction => (
              <InteractionItem
                key={interaction.id}
                interaction={interaction}
                onPress={handleInteractionPress}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
      </View>
      
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  horizontalCard: {
    width: 300,
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    padding: 16,
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
    height: 40,
  },
});