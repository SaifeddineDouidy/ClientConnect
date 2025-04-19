import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, MessageCircle, Calendar, Mail, FileText } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Interaction } from '@/types';
import { formatDateTime, getRelativeTime } from '@/utils/helpers';
import { useClientStore } from '@/store/clientStore';

interface InteractionItemProps {
  interaction: Interaction;
  onPress?: (interaction: Interaction) => void;
}

export const InteractionItem: React.FC<InteractionItemProps> = ({
  interaction,
  onPress,
}) => {
  const getClient = useClientStore(state => state.getClient);
  const client = getClient(interaction.clientId);

  const getInteractionIcon = () => {
    switch (interaction.type) {
      case 'call':
        return <Phone size={20} color={colors.primary} />;
      case 'message':
        return <MessageCircle size={20} color={colors.secondary} />;
      case 'meeting':
        return <Calendar size={20} color={colors.success} />;
      case 'email':
        return <Mail size={20} color={colors.warning} />;
      case 'note':
        return <FileText size={20} color={colors.grey} />;
      default:
        return <FileText size={20} color={colors.grey} />;
    }
  };

  const getInteractionTitle = () => {
    const typeLabels: Record<Interaction['type'], string> = {
      call: 'Call',
      message: 'Message',
      meeting: 'Meeting',
      email: 'Email',
      note: 'Note',
    };
    
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
    return `${typeLabels[interaction.type]} with ${clientName}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(interaction);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        {getInteractionIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{getInteractionTitle()}</Text>
        
        {interaction.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {interaction.notes}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDateTime(interaction.date)}</Text>
          <Text style={styles.relativeTime}>{getRelativeTime(interaction.date)}</Text>
        </View>
        
        {interaction.followUpDate && (
          <View style={styles.followUp}>
            <Calendar size={14} color={colors.primary} />
            <Text style={styles.followUpText}>
              Follow-up: {formatDateTime(interaction.followUpDate)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  relativeTime: {
    fontSize: 12,
    color: colors.grey,
  },
  followUp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  followUpText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
});