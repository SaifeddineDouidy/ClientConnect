import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Client } from '@/types';
import { Avatar } from './Avatar';
import { makePhoneCall, sendWhatsAppMessage } from '@/utils/helpers';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  compact?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onPress,
  compact = false,
}) => {
  const handlePhonePress = () => {
    makePhoneCall(client.phone);
  };

  const handleMessagePress = () => {
    sendWhatsAppMessage(client.phone);
  };

  const getStatusColor = () => {
    switch (client.status) {
      case 'lead':
        return colors.secondary;
      case 'prospect':
        return colors.primary;
      case 'customer':
        return colors.success;
      case 'inactive':
        return colors.grey;
      default:
        return colors.grey;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(client)}
        activeOpacity={0.7}
      >
        <Avatar
          firstName={client.firstName}
          lastName={client.lastName}
          imageUrl={client.avatar}
          size={36}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.name}>{`${client.firstName} ${client.lastName}`}</Text>
          <Text style={styles.companyCompact}>{client.company}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(client)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Avatar
          firstName={client.firstName}
          lastName={client.lastName}
          imageUrl={client.avatar}
          size={50}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{`${client.firstName} ${client.lastName}`}</Text>
          <Text style={styles.position}>{client.position}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.company}>
        <Text style={styles.companyText}>{client.company}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactText}>{client.email}</Text>
        <Text style={styles.contactText}>{client.phone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePhonePress}
        >
          <Phone size={20} color={colors.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMessagePress}
        >
          <MessageCircle size={20} color={colors.primary} />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  compactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  companyCompact: {
    fontSize: 12,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  position: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  company: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  companyText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '500',
  },
});