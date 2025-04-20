import React, { useState } from 'react';
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
import { ChevronDown } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Client } from '@/types';
import { Button } from '../Button';

interface ClientFormProps {
  initialValues?: Partial<Client>;
  onSubmit: (values: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [values, setValues] = useState<Partial<Client>>({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    address: '',
    status: 'lead',
    notes: '',
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleChange = (field: keyof Client, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const statusOptions: Client['status'][] = ['lead', 'prospect', 'customer', 'inactive'];

  const selectStatus = (status: Client['status']) => {
    setValues(prev => ({ ...prev, status }));
    setShowStatusDropdown(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!values.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!values.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!values.company?.trim()) {
      newErrors.company = 'Company is required';
    }
    
    if (!values.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!values.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(values as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
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
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={values.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            placeholder="Enter first name"
            placeholderTextColor={colors.grey}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={values.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            placeholder="Enter last name"
            placeholderTextColor={colors.grey}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Company *</Text>
          <TextInput
            style={[styles.input, errors.company && styles.inputError]}
            value={values.company}
            onChangeText={(text) => handleChange('company', text)}
            placeholder="Enter company name"
            placeholderTextColor={colors.grey}
          />
          {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Position</Text>
          <TextInput
            style={styles.input}
            value={values.position}
            onChangeText={(text) => handleChange('position', text)}
            placeholder="Enter job position"
            placeholderTextColor={colors.grey}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={values.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Enter email address"
            placeholderTextColor={colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={values.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Enter phone number"
            placeholderTextColor={colors.grey}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={values.address}
            onChangeText={(text) => handleChange('address', text)}
            placeholder="Enter address"
            placeholderTextColor={colors.grey}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <Text style={styles.dropdownText}>
              {values.status ? values.status.charAt(0).toUpperCase() + values.status.slice(1) : 'Select status'}
            </Text>
            <ChevronDown size={20} color={colors.grey} />
          </TouchableOpacity>
          
          {showStatusDropdown && (
            <View style={styles.dropdownMenu}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => selectStatus(option)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    values.status === option && styles.dropdownItemTextActive
                  ]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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
            title={initialValues?.id ? "Update Client" : "Add Client"}
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
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