import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types';
import { generateId } from '@/utils/helpers';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByClient: (clientId: string) => Task[];
  getTasksByOpportunity: (opportunityId: string) => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  toggleTaskCompletion: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      
      addTask: (taskData) => {
        const id = generateId();
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        return id;
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id 
              ? { ...task, ...updates } 
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
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
      
      toggleTaskCompletion: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id 
              ? { ...task, completed: !task.completed } 
              : task
          ),
        }));
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);