import { create } from 'zustand';
import { Task } from '@/types';
import { taskService } from '@/services/firestore';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  getTasksByClient: (clientId: string) => Task[];
  getTasksByOpportunity: (opportunityId: string) => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  toggleTaskCompletion: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const tasks = await taskService.getTasks();
      set({ tasks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching tasks:', error);
    }
  },
  
  addTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const id = await taskService.addTask(taskData);
      
      // Refresh tasks list
      await get().fetchTasks();
      
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  updateTask: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.updateTask(id, updates);
      
      // Refresh tasks list
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.deleteTask(id);
      
      // Update local state
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  getTask: (id) => {
    return get().tasks.find((task) => task.id === id);
  },
  
  getTasksByClient: (clientId) => {
    return get().tasks
      .filter((task) => task.clientId === clientId)
      .sort((a, b) => a.dueDate - b.dueDate);
  },
  
  getTasksByOpportunity: (opportunityId) => {
    return get().tasks
      .filter((task) => task.opportunityId === opportunityId)
      .sort((a, b) => a.dueDate - b.dueDate);
  },
  
  getUpcomingTasks: (days = 7) => {
    const now = Date.now();
    const futureDate = now + days * 24 * 60 * 60 * 1000;
    
    return get().tasks
      .filter((task) => !task.completed && task.dueDate >= now && task.dueDate <= futureDate)
      .sort((a, b) => a.dueDate - b.dueDate);
  },
  
  getOverdueTasks: () => {
    const now = Date.now();
    
    return get().tasks
      .filter((task) => !task.completed && task.dueDate < now)
      .sort((a, b) => a.dueDate - b.dueDate);
  },
  
  toggleTaskCompletion: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await taskService.toggleTaskCompletion(id);
      
      // Refresh tasks list
      await get().fetchTasks();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error toggling task completion:', error);
      throw error;
    }
  },
}));

// Set up real-time subscription hook
export function useTaskSubscription() {
  const { setTasks } = useTaskStore();
  
  // Return a function that, when called, will set up the subscription
  return () => {
    // Subscribe to real-time updates
    const unsubscribe = taskService.subscribeToTasks((tasks) => {
      setTasks(tasks);
    });
    
    // Return the unsubscribe function
    return unsubscribe;
  };
}