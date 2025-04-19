import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
} from 'react-native';
import { ChevronDown, Calendar, Clock } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Interaction, Client, Opportunity } from '@/types';
import { Button } from '../Button';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { formatDate } from '@/utils/helpers';

interface InteractionFormProps {
  initialValues?: Partial<Interaction>;
  onSubmit: (values: Omit<Interaction, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedClientId?: string;
  preselectedOpportunityId?: string;
  type?: Interaction['type'];
}

export const InteractionForm: React.FC<InteractionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  preselectedClientId,
  preselectedOpportunityId,
  type = 'call',
}) => {
  const clients = useClientStore(state => state.clients);
  const getOpportunitiesByClient = useOpportunityStore(state => state.getOpportunitiesByClient);
  
  const [values, setValues] = useState<Partial<Interaction>>({
    clientId: preselectedClientId || '',
    opportunityId: preselectedOpportunityId || '',
    type: type,
    date: Date.now(),
    duration: type === 'call' || type === 'meeting' ? 15 : undefined,
    notes: '',
    outcome: '',
    followUpDate: undefined,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showOpportunityDropdown, setShowOpportunityDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [clientOpportunities, setClientOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    if (preselectedClientId) {
      setValues(prev => ({ ...prev, clientId: preselectedClientId }));
      const opportunities = getOpportunitiesByClient(preselectedClientId);
      setClientOpportunities(opportunities);
    }
  }, [preselectedClientId, getOpportunitiesByClient]);

  useEffect(() => {
    if (preselectedOpportunityId) {
      setValues(prev => ({ ...prev, opportunityId: preselectedOpportunityId }));
    }
  }, [preselectedOpportunityId]);

  const handleChange = (field: keyof Interaction, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const typeOptions: Interaction['type'][] = ['call', 'message', 'meeting', 'email', 'note'];

  const selectType = (selectedType: Interaction['type']) => {
    setValues(prev => ({ 
      ...prev, 
      type: selectedType,
      duration: selectedType === 'call' || selectedType === 'meeting' ? 15 : undefined
    }));
    setShowTypeDropdown(false);
  };

  const selectClient = (clientId: string) => {
    setValues(prev => ({ ...prev, clientId, opportunityId: '' }));
    const opportunities = getOpportunitiesByClient(clientId);
    setClientOpportunities(opportunities);
    setShowClientDropdown(false);
  };

  const selectOpportunity = (opportunityId: string) => {
    setValues(prev => ({ ...prev, opportunityId }));
    setShowOpportunityDropdown(false);
  };

  const getSelectedClient = (): Client | undefined => {
    return clients.find(client => client.id === values.clientId);
  };

  const getSelectedOpportunity = (): Opportunity | undefined => {
    return clientOpportunities.find(opportunity => opportunity.id === values.opportunityId);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!values.clientId) {
      newErrors.clientId = 'Client is required';
    }
    
    if (!values.notes?.trim()) {
      newErrors.notes = 'Notes are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values as Omit<Interaction, 'id'>);
    }
  };

  const getTypeIcon = (interactionType: Interaction['type']) => {
    switch (interactionType) {
      case 'call':
        return '📞';
      case 'message':
        return '💬';
      case 'meeting':
        return '🤝';
      case 'email':
        return '📧';
      case 'note':
        return '📝';
      default:
        return '📝';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Interaction Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <View style={styles.typeDropdownContent}>
              <Text style={styles.typeIcon}>{getTypeIcon(values.type as Interaction['type'])}</Text>
              <Text style={styles.dropdownText}>
                {values.type ? values.type.charAt(0).toUpperCase() + values.type.slice(1) : 'Select type'}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {showTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {typeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => selectType(option)}
                >
                  <View style={styles.typeDropdownItem}>
                    <Text style={styles.typeIcon}>{getTypeIcon(option)}</Text>
                    <Text style={[
                      styles.dropdownItemText,
                      values.type === option && styles.dropdownItemTextActive
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Client *</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.clientId && styles.inputError]}
            onPress={() => setShowClientDropdown(!showClientDropdown)}
            disabled={!!preselectedClientId}
          >
            <Text style={styles.dropdownText}>
              {getSelectedClient() 
                ? `${getSelectedClient()?.firstName} ${getSelectedClient()?.lastName}`
                : 'Select client'}
            </Text>
            {!preselectedClientId && <ChevronDown size={20} color={colors.grey} />}
          </TouchableOpacity>
          {errors.clientId && <Text style={styles.errorText}>{errors.clientId}</Text>}
          
          {showClientDropdown && (
            <View style={styles.dropdownMenu}>
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.dropdownItem}
                  onPress={() => selectClient(client.id)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    values.clientId === client.id && styles.dropdownItemTextActive
                  ]}>
                    {`${client.firstName} ${client.lastName} - ${client.company}`}
                  </Text>
                </TouchableOpacity>
              ))}
              {clients.length === 0 && (
                <Text style={styles.noItemsText}>No clients available. Add a client first.</Text>
              )}
            </View>
          )}
        </View>

        {values.clientId && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Related Opportunity (Optional)</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowOpportunityDropdown(!showOpportunityDropdown)}
              disabled={!!preselectedOpportunityId}
            >
              <Text style={styles.dropdownText}>
                {getSelectedOpportunity() 
                  ? getSelectedOpportunity()?.title
                  : 'Select opportunity'}
              </Text>
              {!preselectedOpportunityId && <ChevronDown size={20} color={colors.grey} />}
            </TouchableOpacity>
            
            {showOpportunityDropdown && (
              <View style={styles.dropdownMenu}>
                {clientOpportunities.map((opportunity) => (
                  <TouchableOpacity
                    key={opportunity.id}
                    style={styles.dropdownItem}
                    onPress={() => selectOpportunity(opportunity.id)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      values.opportunityId === opportunity.id && styles.dropdownItemTextActive
                    ]}>
                      {opportunity.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                {clientOpportunities.length === 0 && (
                  <Text style={styles.noItemsText}>No opportunities for this client.</Text>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateText}>
              {values.date ? formatDate(values.date) : 'Select date'}
            </Text>
            <Calendar size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {/* Note: In a real app, you would use a DateTimePicker component here */}
          {showDatePicker && (
            <View style={styles.dropdownMenu}>
              {[-7, -3, -1, 0].map((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const timestamp = date.getTime();
                
                return (
                  <TouchableOpacity
                    key={days}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange('date', timestamp);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {days === 0 ? 'Today' : `${Math.abs(days)} days ago (${formatDate(timestamp)})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {(values.type === 'call' || values.type === 'meeting') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => handleChange('duration', Math.max(1, (values.duration || 15) - 5))}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.durationValueContainer}>
                <Clock size={16} color={colors.grey} style={styles.durationIcon} />
                <Text style={styles.durationValue}>{values.duration} min</Text>
              </View>
              
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => handleChange('duration', (values.duration || 15) + 5)}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.notes && styles.inputError]}
            value={values.notes}
            onChangeText={(text) => handleChange('notes', text)}
            placeholder={`Enter ${values.type} notes...`}
            placeholderTextColor={colors.grey}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.notes && <Text style={styles.errorText}>{errors.notes}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Outcome</Text>
          <TextInput
            style={styles.input}
            value={values.outcome}
            onChangeText={(text) => handleChange('outcome', text)}
            placeholder="Enter interaction outcome"
            placeholderTextColor={colors.grey}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.followUpHeader}>
            <Text style={styles.label}>Follow-up Date (Optional)</Text>
            <TouchableOpacity
              onPress={() => {
                if (values.followUpDate) {
                  handleChange('followUpDate', undefined);
                } else {
                  const date = new Date();
                  date.setDate(date.getDate() + 7);
                  handleChange('followUpDate', date.getTime());
                }
              }}
            >
              <Text style={styles.followUpToggle}>
                {values.followUpDate ? 'Remove' : 'Add Follow-up'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {values.followUpDate && (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowFollowUpDatePicker(!showFollowUpDatePicker)}
            >
              <Text style={styles.dateText}>
                {formatDate(values.followUpDate)}
              </Text>
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          {showFollowUpDatePicker && values.followUpDate && (
            <View style={styles.dropdownMenu}>
              {[1, 3, 7, 14, 30].map((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const timestamp = date.getTime();
                
                return (
                  <TouchableOpacity
                    key={days}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange('followUpDate', timestamp);
                      setShowFollowUpDatePicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {`In ${days} days (${formatDate(timestamp)})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={initialValues?.id ? "Update Interaction" : "Save Interaction"}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
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
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  noItemsText: {
    padding: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  durationValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIcon: {
    marginRight: 4,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  followUpToggle: {
    color: colors.primary,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});