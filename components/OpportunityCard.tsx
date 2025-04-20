import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DollarSign, Calendar } from 'lucide-react-native';
import { colors, statusColors } from '@/constants/Colors';
import { Opportunity } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useClientStore } from '@/store/clientStore';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: (opportunity: Opportunity) => void;
  compact?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onPress,
  compact = false,
}) => {
  const getClient = useClientStore(state => state.getClient);
  const client = getClient(opportunity.clientId);

  const getStageColor = () => {
    return statusColors[opportunity.stage] || colors.grey;
  };

  const getStageLabel = () => {
    const labels: Record<Opportunity['stage'], string> = {
      lead: 'Lead',
      prospect: 'Prospect',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      closed: 'Closed Won',
      lost: 'Closed Lost',
    };
    return labels[opportunity.stage] || opportunity.stage;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(opportunity)}
        activeOpacity={0.7}
      >
        <View style={[styles.stageDot, { backgroundColor: getStageColor() }]} />
        <View style={styles.compactInfo}>
          <Text style={styles.title} numberOfLines={1}>{opportunity.title}</Text>
          <Text style={styles.compactValue}>{formatCurrency(opportunity.value)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(opportunity)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{opportunity.title}</Text>
        <View style={[styles.stageBadge, { backgroundColor: getStageColor() }]}>
          <Text style={styles.stageText}>{getStageLabel()}</Text>
        </View>
      </View>

      <View style={styles.clientSection}>
        <Text style={styles.clientLabel}>Client:</Text>
        <Text style={styles.clientName}>
          {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <DollarSign size={16} color={colors.textLight} />
          <Text style={styles.detailText}>{formatCurrency(opportunity.value)}</Text>
        </View>

        {opportunity.expectedCloseDate && (
          <View style={styles.detailItem}>
            <Calendar size={16} color={colors.textLight} />
            <Text style={styles.detailText}>
              Expected close: {formatDate(opportunity.expectedCloseDate)}
            </Text>
          </View>
        )}

        {opportunity.probability !== undefined && (
          <View style={styles.probabilityContainer}>
            <Text style={styles.probabilityText}>
              {opportunity.probability}% probability
            </Text>
            <View style={styles.probabilityBar}>
              <View 
                style={[
                  styles.probabilityFill, 
                  { width: `${opportunity.probability}%` }
                ]} 
              />
            </View>
          </View>
        )}
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  stageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  clientSection: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  probabilityContainer: {
    marginTop: 8,
  },
  probabilityText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  probabilityBar: {
    height: 6,
    backgroundColor: colors.lightGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});