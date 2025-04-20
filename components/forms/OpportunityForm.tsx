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
import { ChevronDown, Calendar } from 'lucide-react-native';
import { colors, statusColors } from '@/constants/Colors';
import { Opportunity, Client } from '@/types';
import { Button } from '../Button';
import { useClientStore } from '@/store/clientStore';
import { formatDate } from '@/utils/helpers';

interface OpportunityFormProps {
  initialValues?: Partial<Opportunity>;
  onSubmit: (values: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedClientId?: string;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  preselectedClientId,
}) => {
  const clients = useClientStore((state: { clients: any; }) => state.clients);
  
  const [values, setValues] = useState<Partial<Opportunity>>({
    title: '',
    clientId: preselectedClientId || '',
    value: 0,
    stage: 'lead',
    probability: 10,
    expectedCloseDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    notes: '',
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (preselectedClientId) {
      setValues(prev => ({ ...prev, clientId: preselectedClientId }));
    }
  }, [preselectedClientId]);

  const handleChange = (field: keyof Opportunity, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const stageOptions: Opportunity['stage'][] = [
    'lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'
  ];

  const selectStage = (stage: Opportunity['stage']) => {
    let probability = values.probability;
    
    // Set default probability based on stage
    switch (stage) {
      case 'lead':
        probability = 10;
        break;
      case 'prospect':
        probability = 25;
        break;
      case 'qualified':
        probability = 50;
        break;
      case 'proposal':
        probability = 60;
        break;
      case 'negotiation':
        probability = 80;
        break;
      case 'closed':
        probability = 100;
        break;
      case 'lost':
        probability = 0;
        break;
    }
    
    setValues(prev => ({ ...prev, stage, probability }));
    setShowStageDropdown(false);
  };

  const selectClient = (clientId: string) => {
    setValues(prev => ({ ...prev, clientId }));
    setShowClientDropdown(false);
  };

  const getSelectedClient = (): Client | undefined => {
    return clients.find((client: { id: string | undefined; }) => client.id === values.clientId);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!values.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!values.clientId) {
      newErrors.clientId = 'Client is required';
    }
    
    if (values.value === undefined || values.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values as Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const getStageColor = (stage: Opportunity['stage']) => {
    return statusColors[stage] || colors.grey;
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
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={values.title}
            onChangeText={(text) => handleChange('title', text)}
            placeholder="Enter opportunity title"
            placeholderTextColor={colors.grey}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
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
              {clients.map((client: { id: string; firstName: any; lastName: any; company: any; }) => (
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
                <Text style={styles.noClientsText}>No clients available. Add a client first.</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Value *</Text>
          <TextInput
            style={[styles.input, errors.value && styles.inputError]}
            value={values.value?.toString()}
            onChangeText={(text) => {
              const numValue = text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : 0;
              handleChange('value', numValue);
            }}
            placeholder="Enter opportunity value"
            placeholderTextColor={colors.grey}
            keyboardType="numeric"
          />
          {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Stage *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowStageDropdown(!showStageDropdown)}
          >
            <View style={styles.stageDropdownContent}>
              <View 
                style={[
                  styles.stageIndicator, 
                  { backgroundColor: getStageColor(values.stage as Opportunity['stage']) }
                ]} 
              />
              <Text style={styles.dropdownText}>
                {values.stage ? values.stage.charAt(0).toUpperCase() + values.stage.slice(1) : 'Select stage'}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {showStageDropdown && (
            <View style={styles.dropdownMenu}>
              {stageOptions.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={styles.dropdownItem}
                  onPress={() => selectStage(stage)}
                >
                  <View style={styles.stageDropdownItem}>
                    <View 
                      style={[
                        styles.stageIndicator, 
                        { backgroundColor: getStageColor(stage) }
                      ]} 
                    />
                    <Text style={[
                      styles.dropdownItemText,
                      values.stage === stage && styles.dropdownItemTextActive
                    ]}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Probability (%)</Text>
          <TextInput
            style={styles.input}
            value={values.probability?.toString()}
            onChangeText={(text) => {
              const numValue = text ? parseInt(text.replace(/[^0-9]/g, ''), 10) : 0;
              handleChange('probability', Math.min(100, Math.max(0, numValue)));
            }}
            placeholder="Enter probability percentage"
            placeholderTextColor={colors.grey}
            keyboardType="numeric"
          />
          
          <View style={styles.probabilityBar}>
            <View 
              style={[
                styles.probabilityFill, 
                { width: `${values.probability ?? 0}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Expected Close Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateText}>
              {values.expectedCloseDate ? formatDate(values.expectedCloseDate) : 'Select date'}
            </Text>
            <Calendar size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {/* Note: In a real app, you would use a DateTimePicker component here */}
          {/* For simplicity, we're just showing a dropdown with some date options */}
          {showDatePicker && (
            <View style={styles.dropdownMenu}>
              {[0, 7, 14, 30, 60, 90].map((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const timestamp = date.getTime();
                
                return (
                  <TouchableOpacity
                    key={days}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange('expectedCloseDate', timestamp);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {days === 0 ? 'Today' : `In ${days} days (${formatDate(timestamp)})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={values.notes}
            onChangeText={(text) => handleChange('notes', text)}
            placeholder="Enter additional notes"
            placeholderTextColor={colors.grey}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={initialValues?.id ? "Update Opportunity" : "Add Opportunity"}
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
  stageDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
  noClientsText: {
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
  probabilityBar: {
    height: 6,
    backgroundColor: colors.lightGrey,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
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