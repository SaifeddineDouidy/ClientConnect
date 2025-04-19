import { Linking, Alert, Platform } from 'react-native';
import { Client } from '@/types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date and time
export const formatDateTime = (timestamp: number): string => {
  return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
};

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = (timestamp: number): string => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date().getTime();
  const diff = timestamp - now;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days < -30) {
    return formatDate(timestamp);
  } else if (days < 0) {
    return rtf.format(days, 'day');
  } else if (hours < 0) {
    return rtf.format(hours, 'hour');
  } else if (minutes < 0) {
    return rtf.format(minutes, 'minute');
  } else {
    return 'just now';
  }
};

// Generate initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Make a phone call
export const makePhoneCall = (phoneNumber: string) => {
  if (Platform.OS !== 'web') {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch(err => Alert.alert('Error', 'An error occurred while trying to make the call'));
  } else {
    Alert.alert('Info', 'Phone calls are not supported in web browser');
  }
};

// Send WhatsApp message
export const sendWhatsAppMessage = (phoneNumber: string, message: string = '') => {
  const formattedNumber = phoneNumber.replace(/[^\d]/g, '');
  const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    })
    .catch(err => Alert.alert('Error', 'An error occurred while trying to open WhatsApp'));
};

// Send email
export const sendEmail = (email: string, subject: string = '', body: string = '') => {
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Email is not supported on this device');
      }
    })
    .catch(err => Alert.alert('Error', 'An error occurred while trying to open email client'));
};

// Get full name
export const getFullName = (client: Client): string => {
  return `${client.firstName} ${client.lastName}`;
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};