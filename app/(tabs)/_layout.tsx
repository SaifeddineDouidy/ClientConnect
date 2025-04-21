import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/Colors';
import { Home, Users, Briefcase, CheckSquare, Settings } from 'lucide-react-native';
import { useClientSubscription } from '@/store/clientStore';
import { useOpportunitySubscription } from '@/store/opportunityStore';
import { useInteractionSubscription } from '@/store/interactionStore';
import { useTaskSubscription } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  
  // Get the subscription functions from the hooks
  const subscribeToClients = useClientSubscription();
  const subscribeToOpportunities = useOpportunitySubscription();
  const subscribeToInteractions = useInteractionSubscription();
  const subscribeToTasks = useTaskSubscription();
  
  useEffect(() => {
    // Only subscribe when authenticated
    if (isAuthenticated) {
      // Set up subscriptions and store the unsubscribe functions
      const unsubscribeClients = subscribeToClients();
      const unsubscribeOpportunities = subscribeToOpportunities();
      const unsubscribeInteractions = subscribeToInteractions();
      const unsubscribeTasks = subscribeToTasks();
      
      // Clean up subscriptions when component unmounts or auth state changes
      return () => {
        if (unsubscribeClients) unsubscribeClients();
        if (unsubscribeOpportunities) unsubscribeOpportunities();
        if (unsubscribeInteractions) unsubscribeInteractions();
        if (unsubscribeTasks) unsubscribeTasks();
      };
    }
  }, [isAuthenticated, subscribeToClients, subscribeToOpportunities, subscribeToInteractions, subscribeToTasks]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: 'Opportunities',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}