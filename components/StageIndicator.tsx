import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, statusColors } from '@/constants/Colors';
import { Opportunity } from '@/types';

interface StageIndicatorProps {
  currentStage: Opportunity['stage'];
  compact?: boolean;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  currentStage,
  compact = false,
}) => {
  const stages: Opportunity['stage'][] = ['lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'closed'];
  
  const stageLabels: Record<Opportunity['stage'], string> = {
    lead: 'Lead',
    prospect: 'Prospect',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed: 'Closed Won',
    lost: 'Lost',
  };

  const currentIndex = stages.indexOf(currentStage);
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {stages.map((stage, index) => {
          const isActive = index <= currentIndex && currentStage !== 'lost';
          const isLost = currentStage === 'lost';
          
          return (
            <View 
              key={stage}
              style={[
                styles.compactStage,
                isActive && { backgroundColor: statusColors[stage] },
                isLost && index === currentIndex && { backgroundColor: statusColors.lost },
                index < stages.length - 1 && styles.compactStageWithLine,
              ]}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isActive = index <= currentIndex && currentStage !== 'lost';
        const isCurrent = index === currentIndex;
        const isLost = currentStage === 'lost' && index === stages.length - 1;
        
        return (
          <View key={stage} style={styles.stageWrapper}>
            <View 
              style={[
                styles.stageCircle,
                isActive && { backgroundColor: statusColors[stage] },
                isLost && { backgroundColor: statusColors.lost },
              ]}
            />
            
            <Text 
              style={[
                styles.stageLabel,
                isCurrent && styles.currentStageLabel,
                isLost && styles.lostStageLabel,
              ]}
            >
              {stageLabels[stage]}
            </Text>
            
            {index < stages.length - 1 && (
              <View 
                style={[
                  styles.stageLine,
                  index < currentIndex && { backgroundColor: statusColors[stage] },
                ]} 
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  stageWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stageCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.lightGrey,
    marginBottom: 4,
  },
  stageLine: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: '100%',
    height: 2,
    backgroundColor: colors.lightGrey,
    zIndex: -1,
  },
  stageLabel: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
  },
  currentStageLabel: {
    fontWeight: '600',
    color: colors.text,
  },
  lostStageLabel: {
    color: statusColors.lost,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.lightGrey,
    marginVertical: 8,
  },
  compactStage: {
    flex: 1,
    height: '100%',
  },
  compactStageWithLine: {
    marginRight: 2,
  },
});