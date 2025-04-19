import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@/types';
import { generateId } from '@/utils/helpers';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  searchClients: (query: string) => Client[];
  filterClientsByStatus: (status: Client['status'] | 'all') => Client[];
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: [],
      isLoading: false,
      error: null,
      
      addClient: (clientData) => {
        const now = Date.now();
        const id = generateId();
        const newClient: Client = {
          ...clientData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          clients: [...state.clients, newClient],
        }));
        
        return id;
      },
      
      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((client) => 
            client.id === id 
              ? { ...client, ...updates, updatedAt: Date.now() } 
              : client
          ),
        }));
      },
      
      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));
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
    }),
    {
      name: 'client-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);