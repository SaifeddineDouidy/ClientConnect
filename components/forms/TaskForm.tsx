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
import { colors } from '@/constants/Colors';
import { Task, Client, Opportunity } from '@/types';
import { Button } from '../Button';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { formatDate } from '@/utils/helpers';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (values: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedClientId?: string;
  preselectedOpportunityId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  preselectedClientId,
  preselectedOpportunityId,
}) => {
  const clients = useClientStore(state => state.clients);
  const getOpportunitiesByClient = useOpportunityStore(state => state.getOpportunitiesByClient);
  
  const [values, setValues] = useState<Partial<Task>>({
    title: '',
    description: '',
    clientId: preselectedClientId || '',
    opportunityId: preselectedOpportunityId || '',
    dueDate: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
    completed: false,
    priority: 'medium',
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showOpportunityDropdown, setShowOpportunityDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleChange = (field: keyof Task, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const priorityOptions: Task['priority'][] = ['low', 'medium', 'high'];

  const selectPriority = (priority: Task['priority']) => {
    setValues(prev => ({ ...prev, priority }));
    setShowPriorityDropdown(false);
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
    
    if (!values.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values as Omit<Task, 'id' | 'createdAt'>);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.grey;
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
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={values.title}
            onChangeText={(text) => handleChange('title', text)}
            placeholder="Enter task title"
            placeholderTextColor={colors.grey}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={values.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Enter task description"
            placeholderTextColor={colors.grey}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <View style={styles.priorityDropdownContent}>
              <View 
                style={[
                  styles.priorityIndicator, 
                  { backgroundColor: getPriorityColor(values.priority as Task['priority']) }
                ]} 
              />
              <Text style={styles.dropdownText}>
                {values.priority ? values.priority.charAt(0).toUpperCase() + values.priority.slice(1) : 'Select priority'}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {showPriorityDropdown && (
            <View style={styles.dropdownMenu}>
              {priorityOptions.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={styles.dropdownItem}
                  onPress={() => selectPriority(priority)}
                >
                  <View style={styles.priorityDropdownItem}>
                    <View 
                      style={[
                        styles.priorityIndicator, 
                        { backgroundColor: getPriorityColor(priority) }
                      ]} 
                    />
                    <Text style={[
                      styles.dropdownItemText,
                      values.priority === priority && styles.dropdownItemTextActive
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateText}>
              {values.dueDate ? formatDate(values.dueDate) : 'Select date'}
            </Text>
            <Calendar size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {/* Note: In a real app, you would use a DateTimePicker component here */}
          {showDatePicker && (
            <View style={styles.dropdownMenu}>
              {[0, 1, 2, 3, 7, 14].map((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const timestamp = date.getTime();
                
                return (
                  <TouchableOpacity
                    key={days}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange('dueDate', timestamp);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days (${formatDate(timestamp)})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Related Client (Optional)</Text>
          <TouchableOpacity
            style={styles.dropdown}
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
                <Text style={styles.noItemsText}>No clients available.</Text>
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

        <View style={styles.buttonGroup}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={initialValues?.id ? "Update Task" : "Add Task"}
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
  priorityDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
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