import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Phone, PhoneOff, Mic, MicOff, Clock } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Client, Interaction } from '@/types';
import { makePhoneCall } from '@/utils/helpers';
import { Button } from './Button';
import { useInteractionStore } from '@/store/interactionStore';

interface CallScreenProps {
  client: Client;
  visible: boolean;
  onClose: () => void;
  onCallComplete: (interaction: Omit<Interaction, 'id'>) => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  client,
  visible,
  onClose,
  onCallComplete,
}) => {
  const [callState, setCallState] = useState<'preparing' | 'calling' | 'completed'>('preparing');
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<number | null>(null);
  
  const addInteraction = useInteractionStore(state => state.addInteraction);

  useEffect(() => {
    if (callState === 'calling' && callStartTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const duration = Math.floor((now - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [callState, callStartTime]);

  const handleStartCall = () => {
    setCallState('calling');
    setCallStartTime(Date.now());
    makePhoneCall(client.phone);
  };

  const handleEndCall = () => {
    setCallState('completed');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSaveCall = () => {
    const now = Date.now();
    const interaction: Omit<Interaction, 'id'> = {
      clientId: client.id,
      type: 'call',
      date: callStartTime || now,
      duration: Math.ceil(callDuration / 60), // Convert to minutes
      notes,
      outcome,
      followUpDate: followUp ? (followUpDate || now + 7 * 24 * 60 * 60 * 1000) : undefined,
    };
    
    onCallComplete(interaction);
    resetCallState();
    onClose();
  };

  const handleCancel = () => {
    resetCallState();
    onClose();
  };

  const resetCallState = () => {
    setCallState('preparing');
    setCallStartTime(null);
    setCallDuration(0);
    setIsMuted(false);
    setNotes('');
    setOutcome('');
    setFollowUp(false);
    setFollowUpDate(null);
  };

  const setDefaultFollowUpDate = () => {
    // Set follow-up date to 1 week from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setFollowUpDate(date.getTime());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {callState === 'preparing' ? 'New Call' : 
             callState === 'calling' ? 'On Call' : 'Call Summary'}
          </Text>
          {callState !== 'completed' && (
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{`${client.firstName} ${client.lastName}`}</Text>
          <Text style={styles.clientCompany}>{client.company}</Text>
          <Text style={styles.clientPhone}>{client.phone}</Text>
        </View>
        
        {callState === 'preparing' && (
          <View style={styles.callActions}>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleStartCall}
            >
              <Phone size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.callButtonLabel}>Start Call</Text>
          </View>
        )}
        
        {callState === 'calling' && (
          <View style={styles.callingContainer}>
            <View style={styles.durationContainer}>
              <Clock size={20} color={colors.textLight} />
              <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
            </View>
            
            <View style={styles.callControls}>
              <TouchableOpacity 
                style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                onPress={handleToggleMute}
              >
                {isMuted ? (
                  <MicOff size={24} color={colors.white} />
                ) : (
                  <Mic size={24} color={colors.white} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.endCallButton}
                onPress={handleEndCall}
              >
                <PhoneOff size={32} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Call Notes</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                placeholder="Take notes during the call..."
                placeholderTextColor={colors.grey}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        )}
        
        {callState === 'completed' && (
          <ScrollView style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Call Duration</Text>
              <Text style={styles.summaryValue}>{formatDuration(callDuration)}</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Call Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="Enter call notes..."
                placeholderTextColor={colors.grey}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Outcome</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter call outcome..."
                placeholderTextColor={colors.grey}
                value={outcome}
                onChangeText={setOutcome}
              />
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.followUpHeader}>
                <Text style={styles.label}>Follow-up</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newValue = !followUp;
                    setFollowUp(newValue);
                    if (newValue && !followUpDate) {
                      setDefaultFollowUpDate();
                    }
                  }}
                >
                  <Text style={styles.followUpToggle}>
                    {followUp ? 'Remove' : 'Add Follow-up'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {followUp && (
                <View style={styles.followUpOptions}>
                  {[7, 14, 30].map((days) => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    const timestamp = date.getTime();
                    
                    return (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.followUpOption,
                          followUpDate === timestamp && styles.followUpOptionSelected
                        ]}
                        onPress={() => setFollowUpDate(timestamp)}
                      >
                        <Text 
                          style={[
                            styles.followUpOptionText,
                            followUpDate === timestamp && styles.followUpOptionTextSelected
                          ]}
                        >
                          {days} days
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
            
            <View style={styles.buttonGroup}>
              <Button
                title="Save Call"
                onPress={handleSaveCall}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  clientInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  clientCompany: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  clientPhone: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '500',
  },
  callActions: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  callButtonLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  callingContainer: {
    flex: 1,
    padding: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  notesContainer: {
    flex: 1,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  notesInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  formGroup: {
    marginBottom: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  followUpToggle: {
    color: colors.primary,
    fontWeight: '500',
  },
  followUpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  followUpOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  followUpOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followUpOptionText: {
    color: colors.text,
  },
  followUpOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  buttonGroup: {
    marginTop: 24,
    marginBottom: 40,
  },
  saveButton: {
    width: '100%',
  },
});