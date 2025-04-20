import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Edit, Trash2, ArrowLeft, Phone, Mail, MessageSquare, Users } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { useInteractionStore } from '@/store/interactionStore';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Interaction, Client, Opportunity } from '@/types';

export default function InteractionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { getInteraction, deleteInteraction, isLoading } = useInteractionStore();
  const { getClient } = useClientStore();
  const { getOpportunity } = useOpportunityStore();
  
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  
  useEffect(() => {
    if (id) {
      const interactionData = getInteraction(id);
      if (interactionData) {
        setInteraction(interactionData);
        
        // Get related client
        const clientData = getClient(interactionData.clientId);
        if (clientData) {
          setClient(clientData);
        }
        
        // Get related opportunity if exists
        if (interactionData.opportunityId) {
          const opportunityData = getOpportunity(interactionData.opportunityId);
          if (opportunityData) {
            setOpportunity(opportunityData);
          }
        }
      } else {
        // Handle case where interaction is not found
        Alert.alert('Error', 'Interaction not found');
        router.back();
      }
    }
  }, [id, getInteraction, getClient, getOpportunity, router]);
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Interaction',
      'Are you sure you want to delete this interaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await deleteInteraction(id);
                router.back();
              }
            } catch (error) {
              console.error('Error deleting interaction:', error);
              Alert.alert('Error', 'Failed to delete interaction');
            }
          }
        },
      ]
    );
  };
  
  const handleEdit = () => {
    if (id) {
      router.push(`/interactions/edit/${id}`);
    }
  };
  
  const getTypeIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return <Phone size={20} color={colors.primary} />;
      case 'message':
        return <MessageSquare size={20} color={colors.primary} />;
      case 'meeting':
        return <Users size={20} color={colors.primary} />;
      case 'email':
        return <Mail size={20} color={colors.primary} />;
      case 'note':
      default:
        return <Edit size={20} color={colors.primary} />;
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!interaction || !client) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No interaction data found</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} Details`,
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
            <View style={styles.typeContainer}>
              {getTypeIcon(interaction.type)}
              <Text style={styles.typeText}>
                {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Calendar size={16} color={colors.textLight} style={styles.icon} />
              <Text style={styles.dateText}>{formatDate(interaction.date)}</Text>
            </View>
          </View>
          
          {(interaction.type === 'call' || interaction.type === 'meeting') && interaction.duration && (
            <View style={styles.durationContainer}>
              <Clock size={16} color={colors.textLight} style={styles.icon} />
              <Text style={styles.durationText}>{interaction.duration} minutes</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity 
              style={styles.clientCard}
              onPress={() => router.push(`/clients/${client.id}`)}
            >
              <Avatar 
                firstName={`${client.firstName}`}
                lastName = {`${client.lastName}`}
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
          
          {opportunity && (
            <View style={styles.opportunitySection}>
              <Text style={styles.sectionTitle}>Related Opportunity</Text>
              <TouchableOpacity 
                style={styles.opportunityCard}
                onPress={() => router.push(`/opportunities/${opportunity.id}`)}
              >
                <View style={styles.opportunityInfo}>
                  <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                  <Text style={styles.opportunityValue}>{formatCurrency(opportunity.value)}</Text>
                </View>
                <ArrowLeft size={16} color={colors.textLight} style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{interaction.notes || 'No notes provided'}</Text>
          </View>
          
          {interaction.outcome && (
            <View style={styles.outcomeSection}>
              <Text style={styles.sectionTitle}>Outcome</Text>
              <Text style={styles.outcomeText}>{interaction.outcome}</Text>
            </View>
          )}
          
          {interaction.followUpDate && (
            <View style={styles.followUpSection}>
              <Text style={styles.sectionTitle}>Follow-up Date</Text>
              <View style={styles.followUpContainer}>
                <Calendar size={16} color={colors.primary} style={styles.icon} />
                <Text style={styles.followUpText}>{formatDate(interaction.followUpDate)}</Text>
              </View>
            </View>
          )}
        </Card>
        
        <View style={styles.buttonContainer}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 14,
    color: colors.textLight,
  },
  icon: {
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  clientSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
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
  opportunityValue: {
    fontSize: 14,
    color: colors.success,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  outcomeSection: {
    marginBottom: 16,
  },
  outcomeText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  followUpSection: {
    marginBottom: 8,
  },
  followUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUpText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
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