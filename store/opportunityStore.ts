import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Opportunity } from '@/types';
import { generateId } from '@/utils/helpers';

interface OpportunityState {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOpportunity: (id: string, updates: Partial<Omit<Opportunity, 'id' | 'createdAt'>>) => void;
  deleteOpportunity: (id: string) => void;
  getOpportunity: (id: string) => Opportunity | undefined;
  getOpportunitiesByClient: (clientId: string) => Opportunity[];
  getOpportunitiesByStage: (stage: Opportunity['stage'] | 'all') => Opportunity[];
  getTotalOpportunityValue: () => number;
  getOpportunityCountByStage: () => Record<Opportunity['stage'], number>;
}

export const useOpportunityStore = create<OpportunityState>()(
  persist(
    (set, get) => ({
      opportunities: [],
      isLoading: false,
      error: null,
      
      addOpportunity: (opportunityData) => {
        const now = Date.now();
        const id = generateId();
        const newOpportunity: Opportunity = {
          ...opportunityData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          opportunities: [...state.opportunities, newOpportunity],
        }));
        
        return id;
      },
      
      updateOpportunity: (id, updates) => {
        set((state) => ({
          opportunities: state.opportunities.map((opportunity) => 
            opportunity.id === id 
              ? { ...opportunity, ...updates, updatedAt: Date.now() } 
              : opportunity
          ),
        }));
      },
      
      deleteOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.filter((opportunity) => opportunity.id !== id),
        }));
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
    }),
    {
      name: 'opportunity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);