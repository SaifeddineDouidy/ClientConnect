import { create } from 'zustand';
import { Interaction } from '@/types';
import { interactionService } from '@/services/firestore';
import { useEffect } from 'react';

interface InteractionState {
  interactions: Interaction[];
  isLoading: boolean;
  error: string | null;
  addInteraction: (interaction: Omit<Interaction, 'id'>) => Promise<string>;
  updateInteraction: (id: string, updates: Partial<Omit<Interaction, 'id'>>) => Promise<void>;
  deleteInteraction: (id: string) => Promise<void>;
  getInteraction: (id: string) => Interaction | undefined;
  getInteractionsByClient: (clientId: string) => Interaction[];
  getInteractionsByOpportunity: (opportunityId: string) => Interaction[];
  getRecentInteractions: (limit?: number) => Interaction[];
  getInteractionsByType: (type: Interaction['type']) => Interaction[];
  fetchInteractions: () => Promise<void>;
  setInteractions: (interactions: Interaction[]) => void;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  interactions: [],
  isLoading: false,
  error: null,
  
  setInteractions: (interactions) => set({ interactions }),
  
  fetchInteractions: async () => {
    try {
      set({ isLoading: true, error: null });
      const interactions = await interactionService.getInteractions();
      set({ interactions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching interactions:', error);
    }
  },
  
  addInteraction: async (interactionData) => {
    try {
      set({ isLoading: true, error: null });
      const id = await interactionService.addInteraction(interactionData);
      
      // Refresh interactions list
      await get().fetchInteractions();
      
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error adding interaction:', error);
      throw error;
    }
  },
  
  updateInteraction: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await interactionService.updateInteraction(id, updates);
      
      // Refresh interactions list
      await get().fetchInteractions();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating interaction:', error);
      throw error;
    }
  },
  
  deleteInteraction: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await interactionService.deleteInteraction(id);
      
      // Update local state
      set((state) => ({
        interactions: state.interactions.filter((interaction) => interaction.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting interaction:', error);
      throw error;
    }
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
}));

// Set up real-time subscription
export function useInteractionSubscription() {
  const { setInteractions } = useInteractionStore();
  
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = interactionService.subscribeToInteractions((interactions) => {
      setInteractions(interactions);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setInteractions]);
}