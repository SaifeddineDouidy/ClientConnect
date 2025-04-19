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
import { Plus, Calendar, Filter, Clock, CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { TaskItem } from '@/components/TaskItem';
import { SearchBar } from '@/components/SearchBar';
import { FilterChip } from '@/components/FilterChip';
import { EmptyState } from '@/components/EmptyState';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types';

export default function TasksScreen() {
  const router = useRouter();
  const tasks = useTaskStore(state => state.tasks);
  const getOverdueTasks = useTaskStore(state => state.getOverdueTasks);
  const getUpcomingTasks = useTaskStore(state => state.getUpcomingTasks);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, selectedFilter]);
  
  const filterTasks = () => {
    let result = tasks;
    
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (selectedFilter) {
      case 'upcoming':
        result = result.filter(task => !task.completed && task.dueDate >= Date.now());
        break;
      case 'overdue':
        result = result.filter(task => !task.completed && task.dueDate < Date.now());
        break;
      case 'completed':
        result = result.filter(task => task.completed);
        break;
    }
    
    // Sort by due date (overdue first, then upcoming)
    result = result.sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return a.dueDate - b.dueDate;
    });
    
    setFilteredTasks(result);
  };
  
  const handleTaskPress = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };
  
  const handleAddTask = () => {
    router.push('/tasks/add');
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    filterTasks();
    setRefreshing(false);
  };
  
  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={handleTaskPress}
      onToggle={toggleTaskCompletion}
    />
  );
  
  const renderEmptyComponent = () => (
    <EmptyState
      title="No Tasks Found"
      message={searchQuery || selectedFilter !== 'all' 
        ? "Try adjusting your search or filters" 
        : "Add your first task to get started"}
      icon={<Calendar size={48} color={colors.grey} />}
      actionLabel={searchQuery || selectedFilter !== 'all' ? undefined : "Add Task"}
      onAction={searchQuery || selectedFilter !== 'all' ? undefined : handleAddTask}
    />
  );
  
  const getTasksStats = () => {
    const overdue = getOverdueTasks().length;
    const upcoming = getUpcomingTasks().length;
    const completed = tasks.filter(task => task.completed).length;
    
    return { overdue, upcoming, completed };
  };
  
  const stats = getTasksStats();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tasks..."
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
            <Text style={styles.filtersTitle}>Filter tasks:</Text>
            <View style={styles.chipContainer}>
              <FilterChip
                label="All"
                selected={selectedFilter === 'all'}
                onPress={() => setSelectedFilter('all')}
              />
              <FilterChip
                label="Upcoming"
                selected={selectedFilter === 'upcoming'}
                onPress={() => setSelectedFilter('upcoming')}
              />
              <FilterChip
                label="Overdue"
                selected={selectedFilter === 'overdue'}
                onPress={() => setSelectedFilter('overdue')}
              />
              <FilterChip
                label="Completed"
                selected={selectedFilter === 'completed'}
                onPress={() => setSelectedFilter('completed')}
              />
            </View>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.danger} />
            <Text style={styles.statValue}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.statValue}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={styles.statItem}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>
      
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
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
        onPress={handleAddTask}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
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
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});