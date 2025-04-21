import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { interactionService } from '@/services/firestore';
import { clientService } from '@/services/firestore';
import { opportunityService } from '@/services/firestore';
import { colors } from '@/constants/Colors';
import { Interaction, Client, Opportunity } from '@/types';
import { Phone, Mail, Calendar, Clock, FileText, MessageSquare, Users, Briefcase, Trash2, Edit, ArrowRight } from 'lucide-react-native';

export default function InteractionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInteractionDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Interaction ID is missing');
          setLoading(false);
          return;
        }
        
        // Fetch interaction details
        const interactionData = await interactionService.getInteraction(id);
        
        if (!interactionData) {
          setError('Interaction not found');
          setLoading(false);
          return;
        }
        
        setInteraction(interactionData);
        
        // Fetch related client
        if (interactionData.clientId) {
          const clientData = await clientService.getClient(interactionData.clientId);
          setClient(clientData);
        }
        
        // Fetch related opportunity
        if (interactionData.opportunityId) {
          const opportunityData = await opportunityService.getOpportunity(interactionData.opportunityId);
          setOpportunity(opportunityData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching interaction details:', error);
        setError('Failed to load interaction details');
        setLoading(false);
      }
    };
    
    fetchInteractionDetails();
  }, [id]);
  
  const handleEdit = () => {
    router.push(`/interactions/edit/${id}`);
  };
  
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
              if (!id) return;
              
              await interactionService.deleteInteraction(id);
              router.back();
            } catch (error) {
              console.error('Error deleting interaction:', error);
              Alert.alert('Error', 'Failed to delete interaction');
            }
          }
        },
      ]
    );
  };
  
  const getInteractionTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone size={20} color={colors.primary} />;
      case 'email':
        return <Mail size={20} color={colors.primary} />;
      case 'meeting':
        return <Users size={20} color={colors.primary} />;
      case 'message':
        return <MessageSquare size={20} color={colors.primary} />;
      default:
        return <FileText size={20} color={colors.primary} />;
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  if (error || !interaction) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load interaction'}</Text>
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
          <View style={styles.typeContainer}>
            {getInteractionTypeIcon(interaction.type)}
            <Text style={styles.typeText}>
              {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
            </Text>
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
          <View style={styles.infoRow}>
            <Calendar size={18} color={colors.secondary} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(interaction.date), 'PPP')}
            </Text>
          </View>
          
          {interaction.duration && (
            <View style={styles.infoRow}>
              <Clock size={18} color={colors.secondary} />
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>{interaction.duration} minutes</Text>
            </View>
          )}
          
          {interaction.followUpDate && (
            <View style={styles.infoRow}>
              <Calendar size={18} color={colors.secondary} />
              <Text style={styles.infoLabel}>Follow-up:</Text>
              <Text style={styles.infoValue}>
                {format(new Date(interaction.followUpDate), 'PPP')}
              </Text>
            </View>
          )}
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
        
        {interaction.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{interaction.notes}</Text>
            </View>
          </View>
        )}
        
        {interaction.outcome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outcome</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{interaction.outcome}</Text>
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
  notesContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
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