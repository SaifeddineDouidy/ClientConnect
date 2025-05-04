import { create } from 'zustand';
import { Opportunity } from '@/types';
import { opportunityService } from '@/services/firestore';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface OpportunityState {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOpportunity: (id: string, updates: Partial<Omit<Opportunity, 'id' | 'createdAt'>>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  getOpportunity: (id: string) => Opportunity | undefined;
  getOpportunitiesByClient: (clientId: string) => Opportunity[];
  getOpportunitiesByStage: (stage: Opportunity['stage'] | 'all') => Opportunity[];
  getTotalOpportunityValue: () => number;
  getOpportunityCountByStage: () => Record<Opportunity['stage'], number>;
  fetchOpportunities: () => Promise<void>;
  setOpportunities: (opportunities: Opportunity[]) => void;
}

export const useOpportunityStore = create<OpportunityState>((set, get) => ({
  opportunities: [],
  isLoading: false,
  error: null,
  
  setOpportunities: (opportunities) => set({ opportunities }),
  
  fetchOpportunities: async () => {
    try {
      set({ isLoading: true, error: null });
      const opportunities = await opportunityService.getOpportunities();
      set({ opportunities, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching opportunities:', error);
    }
  },
  
  addOpportunity: async (opportunityData) => {
    try {
      set({ isLoading: true, error: null });
      const id = await opportunityService.addOpportunity(opportunityData);
      
      // Refresh opportunities list
      await get().fetchOpportunities();
      
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error adding opportunity:', error);
      throw error;
    }
  },
  
  updateOpportunity: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await opportunityService.updateOpportunity(id, updates);
      
      // Refresh opportunities list
      await get().fetchOpportunities();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },
  
  deleteOpportunity: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await opportunityService.deleteOpportunity(id);
      
      // Update local state
      set((state) => ({
        opportunities: state.opportunities.filter((opportunity) => opportunity.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  },
  
  getOpportunity: (id) => {
    return get().opportunities.find((opportunity) => opportunity.id === id);
  },
  
  getOpportunitiesByClient: (clientId) => {
    return get().opportunities.filter((opportunity) => opportunity.clientId === clientId);
  },
  
  getOpportunitiesByStage: (stage) => {
    if (stage === 'all') {
      return get().opportunities;
    }
    return get().opportunities.filter((opportunity) => opportunity.stage === stage);
  },
  
  getTotalOpportunityValue: () => {
    return get().opportunities
      .filter(opp => opp.stage !== 'lost')
      .reduce((sum, opportunity) => sum + opportunity.value, 0);
  },
  
  getOpportunityCountByStage: () => {
    const stages: Opportunity['stage'][] = ['lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
    const counts = {} as Record<Opportunity['stage'], number>;
    
    stages.forEach(stage => {
      counts[stage] = get().opportunities.filter(opp => opp.stage === stage).length;
    });
    
    return counts;
  },
}));

// Set up real-time subscription
export function useOpportunitySubscription() {
  const { setOpportunities } = useOpportunityStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    // Only subscribe if the user is authenticated
    if (isAuthenticated && !authLoading) {
      try {
        // Subscribe to real-time updates
        unsubscribe = opportunityService.subscribeToOpportunities((opportunities) => {
          setOpportunities(opportunities);
        });
      } catch (error) {
        console.error('Error subscribing to opportunities:', error);
      }
    }
    
    // Cleanup subscription on unmount or when auth state changes
    return () => unsubscribe();
  }, [setOpportunities, isAuthenticated, authLoading]);
}