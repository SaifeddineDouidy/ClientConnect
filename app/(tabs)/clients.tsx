import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users, Filter } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { ClientCard } from '@/components/ClientCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterChip } from '@/components/FilterChip';
import { EmptyState } from '@/components/EmptyState';
import { useClientStore } from '@/store/clientStore';
import { Client } from '@/types';

export default function ClientsScreen() {
  const router = useRouter();
  const clients = useClientStore(state => state.clients);
  const searchClients = useClientStore(state => state.searchClients);
  const filterClientsByStatus = useClientStore(state => state.filterClientsByStatus);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Client['status'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, selectedStatus]);
  
  const filterClients = () => {
    let result = clients;
    
    if (searchQuery) {
      result = searchClients(searchQuery);
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(client => client.status === selectedStatus);
    }
    
    setFilteredClients(result);
  };
  
  const handleClientPress = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };
  
  const handleAddClient = () => {
    router.push('/clients/add');
  };
  
  const handleStatusFilter = (status: Client['status'] | 'all') => {
    setSelectedStatus(status);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    filterClients();
    setRefreshing(false);
  };
  
  const renderClientItem = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      onPress={handleClientPress}
    />
  );
  
  const renderEmptyComponent = () => (
    <EmptyState
      title="No Clients Found"
      message={searchQuery || selectedStatus !== 'all' 
        ? "Try adjusting your search or filters" 
        : "Add your first client to get started"}
      icon={<Users size={48} color={colors.grey} />}
      actionLabel={searchQuery || selectedStatus !== 'all' ? undefined : "Add Client"}
      onAction={searchQuery || selectedStatus !== 'all' ? undefined : handleAddClient}
    />
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search clients..."
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? colors.primary : colors.grey} />
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filter by status:</Text>
            <View style={styles.chipContainer}>
              <FilterChip
                label="All"
                selected={selectedStatus === 'all'}
                onPress={() => handleStatusFilter('all')}
              />
              <FilterChip
                label="Lead"
                selected={selectedStatus === 'lead'}
                onPress={() => handleStatusFilter('lead')}
              />
              <FilterChip
                label="Prospect"
                selected={selectedStatus === 'prospect'}
                onPress={() => handleStatusFilter('prospect')}
              />
              <FilterChip
                label="Customer"
                selected={selectedStatus === 'customer'}
                onPress={() => handleStatusFilter('customer')}
              />
              <FilterChip
                label="Inactive"
                selected={selectedStatus === 'inactive'}
                onPress={() => handleStatusFilter('inactive')}
              />
            </View>
          </View>
        )}
      </View>
      
      <FlatList
        data={filteredClients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddClient}
      >
        <Plus size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
});