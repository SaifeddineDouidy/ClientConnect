import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, BarChart3, Filter, DollarSign } from 'lucide-react-native';
import { colors, statusColors } from '@/constants/Colors';
import { OpportunityCard } from '@/components/OpportunityCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterChip } from '@/components/FilterChip';
import { EmptyState } from '@/components/EmptyState';
import { useOpportunityStore } from '@/store/opportunityStore';
import { Opportunity } from '@/types';
import { formatCurrency } from '@/utils/helpers';

export default function OpportunitiesScreen() {
  const router = useRouter();
  const opportunities = useOpportunityStore(state => state.opportunities);
  const getOpportunitiesByStage = useOpportunityStore(state => state.getOpportunitiesByStage);
  const getTotalOpportunityValue = useOpportunityStore(state => state.getTotalOpportunityValue);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [selectedStage, setSelectedStage] = useState<Opportunity['stage'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchQuery, selectedStage]);
  
  const filterOpportunities = () => {
    let result = opportunities;
    
    if (searchQuery) {
      result = result.filter(opp => 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStage !== 'all') {
      result = result.filter(opp => opp.stage === selectedStage);
    }
    
    setFilteredOpportunities(result);
  };
  
  const handleOpportunityPress = (opportunity: Opportunity) => {
    router.push(`/opportunities/${opportunity.id}`);
  };
  
  const handleAddOpportunity = () => {
    router.push('/opportunities/add');
  };
  
  const handleStageFilter = (stage: Opportunity['stage'] | 'all') => {
    setSelectedStage(stage);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    filterOpportunities();
    setRefreshing(false);
  };
  
  const renderOpportunityItem = ({ item }: { item: Opportunity }) => (
    <OpportunityCard
      opportunity={item}
      onPress={handleOpportunityPress}
    />
  );
  
  const renderEmptyComponent = () => (
    <EmptyState
      title="No Opportunities Found"
      message={searchQuery || selectedStage !== 'all' 
        ? "Try adjusting your search or filters" 
        : "Add your first opportunity to get started"}
      icon={<BarChart3 size={48} color={colors.grey} />}
      actionLabel={searchQuery || selectedStage !== 'all' ? undefined : "Add Opportunity"}
      onAction={searchQuery || selectedStage !== 'all' ? undefined : handleAddOpportunity}
    />
  );
  
  const renderKanbanBoard = () => {
    const stages: Opportunity['stage'][] = ['lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
    const stageLabels: Record<Opportunity['stage'], string> = {
      lead: 'Lead',
      prospect: 'Prospect',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      closed: 'Closed Won',
      lost: 'Lost',
    };
    
    return (
      <ScrollView 
        horizontal 
        style={styles.kanbanContainer}
        contentContainerStyle={styles.kanbanContent}
        showsHorizontalScrollIndicator={false}
      >
        {stages.map(stage => {
          const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
          const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
          
          return (
            <View key={stage} style={styles.kanbanColumn}>
              <View 
                style={[
                  styles.kanbanHeader,
                  { backgroundColor: statusColors[stage] }
                ]}
              >
                <Text style={styles.kanbanHeaderTitle}>{stageLabels[stage]}</Text>
                <Text style={styles.kanbanHeaderCount}>{stageOpportunities.length}</Text>
              </View>
              
              <View style={styles.kanbanValueContainer}>
                <DollarSign size={14} color={colors.textLight} />
                <Text style={styles.kanbanValue}>{formatCurrency(stageValue)}</Text>
              </View>
              
              <ScrollView 
                style={styles.kanbanList}
                contentContainerStyle={styles.kanbanListContent}
                showsVerticalScrollIndicator={false}
              >
                {stageOpportunities.map(opportunity => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onPress={handleOpportunityPress}
                    compact
                  />
                ))}
                
                {stageOpportunities.length === 0 && (
                  <Text style={styles.kanbanEmptyText}>No opportunities</Text>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search opportunities..."
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? colors.primary : colors.grey} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'list' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text 
              style={[
                styles.viewToggleText,
                viewMode === 'list' && styles.viewToggleTextActive
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'kanban' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('kanban')}
          >
            <Text 
              style={[
                styles.viewToggleText,
                viewMode === 'kanban' && styles.viewToggleTextActive
              ]}
            >
              Pipeline
            </Text>
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filter by stage:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              <FilterChip
                label="All"
                selected={selectedStage === 'all'}
                onPress={() => handleStageFilter('all')}
              />
              <FilterChip
                label="Lead"
                selected={selectedStage === 'lead'}
                onPress={() => handleStageFilter('lead')}
              />
              <FilterChip
                label="Prospect"
                selected={selectedStage === 'prospect'}
                onPress={() => handleStageFilter('prospect')}
              />
              <FilterChip
                label="Qualified"
                selected={selectedStage === 'qualified'}
                onPress={() => handleStageFilter('qualified')}
              />
              <FilterChip
                label="Proposal"
                selected={selectedStage === 'proposal'}
                onPress={() => handleStageFilter('proposal')}
              />
              <FilterChip
                label="Negotiation"
                selected={selectedStage === 'negotiation'}
                onPress={() => handleStageFilter('negotiation')}
              />
              <FilterChip
                label="Closed"
                selected={selectedStage === 'closed'}
                onPress={() => handleStageFilter('closed')}
              />
              <FilterChip
                label="Lost"
                selected={selectedStage === 'lost'}
                onPress={() => handleStageFilter('lost')}
              />
            </ScrollView>
          </View>
        )}
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Total Pipeline Value:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getTotalOpportunityValue())}</Text>
        </View>
      </View>
      
      {viewMode === 'list' ? (
        <FlatList
          data={filteredOpportunities}
          renderItem={renderOpportunityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderKanbanBoard()
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddOpportunity}
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
  viewToggleContainer: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.white,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  viewToggleTextActive: {
    color: colors.primary,
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
    paddingRight: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
  },
  kanbanContainer: {
    flex: 1,
  },
  kanbanContent: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  kanbanColumn: {
    width: 280,
    marginHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    height: '100%',
  },
  kanbanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  kanbanHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  kanbanHeaderCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  kanbanValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.white,
  },
  kanbanValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginLeft: 4,
  },
  kanbanList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kanbanListContent: {
    padding: 8,
    paddingBottom: 16,
  },
  kanbanEmptyText: {
    textAlign: 'center',
    color: colors.textLight,
    padding: 16,
  },
});