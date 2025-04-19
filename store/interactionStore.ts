import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Interaction } from '@/types';
import { generateId } from '@/utils/helpers';

interface InteractionState {
  interactions: Interaction[];
  isLoading: boolean;
  error: string | null;
  addInteraction: (interaction: Omit<Interaction, 'id'>) => string;
  updateInteraction: (id: string, updates: Partial<Omit<Interaction, 'id'>>) => void;
  deleteInteraction: (id: string) => void;
  getInteraction: (id: string) => Interaction | undefined;
  getInteractionsByClient: (clientId: string) => Interaction[];
  getInteractionsByOpportunity: (opportunityId: string) => Interaction[];
  getRecentInteractions: (limit?: number) => Interaction[];
  getInteractionsByType: (type: Interaction['type']) => Interaction[];
}

export const useInteractionStore = create<InteractionState>()(
  persist(
    (set, get) => ({
      interactions: [],
      isLoading: false,
      error: null,
      
      addInteraction: (interactionData) => {
        const id = generateId();
        const newInteraction: Interaction = {
          ...interactionData,
          id,
        };
        
        set((state) => ({
          interactions: [...state.interactions, newInteraction],
        }));
        
        return id;
      },
      
      updateInteraction: (id, updates) => {
        set((state) => ({
          interactions: state.interactions.map((interaction) => 
            interaction.id === id 
              ? { ...interaction, ...updates } 
              : interaction
          ),
        }));
      },
      
      deleteInteraction: (id) => {
        set((state) => ({
          interactions: state.interactions.filter((interaction) => interaction.id !== id),
        }));
      },
      
      getInteraction: (id) => {
        return get().interactions.find((interaction) => interaction.id === id);
      },
      
      getInteractionsByClient: (clientId) => {
        return get().interactions
          .filter((interaction) => interaction.clientId === clientId)
          .sort((a, b) => b.date - a.date);
      },
      
      getInteractionsByOpportunity: (opportunityId) => {
        return get().interactions
          .filter((interaction) => interaction.opportunityId === opportunityId)
          .sort((a, b) => b.date - a.date);
      },
      
      getRecentInteractions: (limit = 10) => {
        return [...get().interactions]
          .sort((a, b) => b.date - a.date)
          .slice(0, limit);
      },
      
      getInteractionsByType: (type) => {
        return get().interactions
          .filter((interaction) => interaction.type === type)
          .sort((a, b) => b.date - a.date);
      },
    }),
    {
      name: 'interaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);