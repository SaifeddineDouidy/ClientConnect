import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { 
  User, 
  Bell, 
  Database, 
  HelpCircle, 
  Info, 
  LogOut, 
  Moon, 
  Shield, 
  Smartphone, 
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { useClientStore } from '@/store/clientStore';
import { useOpportunityStore } from '@/store/opportunityStore';
import { useInteractionStore } from '@/store/interactionStore';
import { useTaskStore } from '@/store/taskStore';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const clients = useClientStore(state => state.clients);
  const opportunities = useOpportunityStore(state => state.opportunities);
  const interactions = useInteractionStore(state => state.interactions);
  const tasks = useTaskStore(state => state.tasks);
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // Clear all stores
            useClientStore.getState().clients = [];
            useOpportunityStore.getState().opportunities = [];
            useInteractionStore.getState().interactions = [];
            useTaskStore.getState().tasks = [];
            
            Alert.alert('Data Cleared', 'All your data has been cleared successfully.');
          },
        },
      ],
    );
  };
  
  const handleExportData = () => {
    // In a real app, this would export data to a file
    Alert.alert('Export Data', 'This feature is not implemented in this demo.');
  };
  
  const handleImportData = () => {
    // In a real app, this would import data from a file
    Alert.alert('Import Data', 'This feature is not implemented in this demo.');
  };
  
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@clientconnect.com');
  };
  
  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This feature is not implemented in this demo.');
  };
  
  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'This feature is not implemented in this demo.');
  };
  
  const handleAbout = () => {
    Alert.alert('About ClientConnect', 'ClientConnect CRM Mobile\nVersion 1.0.0');
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        {icon}
        <Text 
          style={[
            styles.settingItemTitle,
            destructive && styles.destructiveText,
          ]}
        >
          {title}
        </Text>
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={colors.grey} />)}
    </TouchableOpacity>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Card variant="outlined" style={styles.card}>
          {renderSettingItem(
            <Moon size={20} color={colors.primary} style={styles.settingIcon} />,
            'Dark Mode',
            undefined,
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : colors.white}
            />
          )}
          
          {renderSettingItem(
            <Bell size={20} color={colors.primary} style={styles.settingIcon} />,
            'Notifications',
            undefined,
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
              thumbColor={notifications ? colors.primary : colors.white}
            />
          )}
          
          {renderSettingItem(
            <Smartphone size={20} color={colors.primary} style={styles.settingIcon} />,
            'App Version',
            undefined,
            <Text style={styles.versionText}>1.0.0</Text>
          )}
        </Card>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Card variant="outlined" style={styles.card}>
          {renderSettingItem(
            <Database size={20} color={colors.primary} style={styles.settingIcon} />,
            'Export Data',
            handleExportData
          )}
          
          {renderSettingItem(
            <Database size={20} color={colors.primary} style={styles.settingIcon} />,
            'Import Data',
            handleImportData
          )}
          
          {renderSettingItem(
            <Trash2 size={20} color={colors.danger} style={styles.settingIcon} />,
            'Clear All Data',
            handleClearData,
            undefined,
            true
          )}
        </Card>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Statistics</Text>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>Clients</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{opportunities.length}</Text>
              <Text style={styles.statLabel}>Opportunities</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{interactions.length}</Text>
              <Text style={styles.statLabel}>Interactions</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <Card variant="outlined" style={styles.card}>
          {renderSettingItem(
            <HelpCircle size={20} color={colors.primary} style={styles.settingIcon} />,
            'Contact Support',
            handleContactSupport
          )}
          
          {renderSettingItem(
            <Shield size={20} color={colors.primary} style={styles.settingIcon} />,
            'Privacy Policy',
            handlePrivacyPolicy
          )}
          
          {renderSettingItem(
            <Info size={20} color={colors.primary} style={styles.settingIcon} />,
            'Terms of Service',
            handleTermsOfService
          )}
          
          {renderSettingItem(
            <Info size={20} color={colors.primary} style={styles.settingIcon} />,
            'About',
            handleAbout
          )}
        </Card>
      </View>
      
      <View style={styles.section}>
        <Card variant="outlined" style={styles.card}>
          {renderSettingItem(
            <LogOut size={20} color={colors.danger} style={styles.settingIcon} />,
            'Log Out',
            () => Alert.alert('Log Out', 'This feature is not implemented in this demo.'),
            undefined,
            true
          )}
        </Card>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>ClientConnect CRM Mobile</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    color: colors.text,
  },
  destructiveText: {
    color: colors.danger,
  },
  versionText: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  },
});