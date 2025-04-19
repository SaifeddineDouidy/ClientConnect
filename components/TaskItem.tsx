import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { Task } from '@/types';
import { formatDate } from '@/utils/helpers';
import { useClientStore } from '@/store/clientStore';

interface TaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggle: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onToggle,
}) => {
  const getClient = useClientStore(state => state.getClient);
  const client = task.clientId ? getClient(task.clientId) : undefined;

  const isOverdue = !task.completed && task.dueDate < Date.now();

  const getPriorityColor = () => {
    switch (task.priority) {
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

  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
      ]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed ? (
          <CheckCircle size={24} color={colors.success} />
        ) : (
          <Circle size={24} color={colors.grey} />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            task.completed && styles.completedText,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {client && (
          <Text style={styles.client} numberOfLines={1}>
            {`${client.firstName} ${client.lastName}`}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            {isOverdue ? (
              <AlertCircle size={14} color={colors.danger} />
            ) : (
              <Clock size={14} color={colors.textLight} />
            )}
            <Text 
              style={[
                styles.date,
                isOverdue && styles.overdueDate,
              ]}
            >
              {formatDate(task.dueDate)}
            </Text>
          </View>
          
          <View 
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor() },
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
  client: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  overdueDate: {
    color: colors.danger,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
});