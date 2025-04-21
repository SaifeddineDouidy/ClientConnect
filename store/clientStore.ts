import { create } from 'zustand';
import { Client } from '@/types';
import { clientService } from '@/services/firestore';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  searchClients: (query: string) => Client[];
  filterClientsByStatus: (status: Client['status'] | 'all') => Client[];
  fetchClients: () => Promise<void>;
  setClients: (clients: Client[]) => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,
  
  setClients: (clients) => set({ clients }),
  
  fetchClients: async () => {
    try {
      set({ isLoading: true, error: null });
      const clients = await clientService.getClients();
      set({ clients, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching clients:', error);
    }
  },
  
  addClient: async (clientData) => {
    try {
      set({ isLoading: true, error: null });
      const id = await clientService.addClient(clientData);
      
      // Refresh clients list
      await get().fetchClients();
      
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error adding client:', error);
      throw error;
    }
  },
  
  updateClient: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.updateClient(id, updates);
      
      // Refresh clients list
      await get().fetchClients();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating client:', error);
      throw error;
    }
  },
  
  deleteClient: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await clientService.deleteClient(id);
      
      // Update local state
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting client:', error);
      throw error;
    }
  },
  
  getClient: (id) => {
    return get().clients.find((client) => client.id === id);
  },
  
  searchClients: (query) => {
    const searchTerm = query.toLowerCase();
    return get().clients.filter((client) => 
      client.firstName.toLowerCase().includes(searchTerm) ||
      client.lastName.toLowerCase().includes(searchTerm) ||
      client.company.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm)
    );
  },
  
  filterClientsByStatus: (status) => {
    if (status === 'all') {
      return get().clients;
    }
    return get().clients.filter((client) => client.status === status);
  },
}));

// Set up real-time subscription hook
export function useClientSubscription() {
  const { setClients } = useClientStore();
  
  // Return a function that, when called, will set up the subscription
  return () => {
    // Subscribe to real-time updates
    const unsubscribe = clientService.subscribeToClients((clients) => {
      setClients(clients);
    });
    
    // Return the unsubscribe function
    return unsubscribe;
  };
}