import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
    SnapshotOptions,
    FirestoreDataConverter
  } from 'firebase/firestore';
  import { db } from '@/config/firebase';
  import { Client, Opportunity, Interaction, Task } from '@/types';
  import { useAuthStore } from '@/store/authStore';
  
  // Helper function to get the current user ID
  const getCurrentUserId = (): string => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  };
  
  // Generic converter for Firestore documents
  const createConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
    toFirestore: (data: T) => {
      // Convert Date objects to Firestore Timestamps
      const converted: any = { ...data };
      
      // Handle date fields
      if (converted.createdAt) {
        converted.createdAt = Timestamp.fromMillis(converted.createdAt);
      }
      if (converted.updatedAt) {
        converted.updatedAt = Timestamp.fromMillis(converted.updatedAt);
      }
      if (converted.date) {
        converted.date = Timestamp.fromMillis(converted.date);
      }
      if (converted.dueDate) {
        converted.dueDate = Timestamp.fromMillis(converted.dueDate);
      }
      
      return converted;
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options: SnapshotOptions
    ): T => {
      const data = snapshot.data(options);
      
      // Convert Firestore Timestamps back to milliseconds
      const converted: any = { ...data };
      
      // Handle date fields
      if (converted.createdAt) {
        converted.createdAt = converted.createdAt.toMillis();
      }
      if (converted.updatedAt) {
        converted.updatedAt = converted.updatedAt.toMillis();
      }
      if (converted.date) {
        converted.date = converted.date.toMillis();
      }
      if (converted.dueDate) {
        converted.dueDate = converted.dueDate.toMillis();
      }
      
      return converted as T;
    }
  });
  
  // Client service
  export const clientService = {
    // Create a new client
    async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const userId = getCurrentUserId();
      const clientsRef = collection(db, 'users', userId, 'clients').withConverter(createConverter<Client>());
      const newClientRef = doc(clientsRef);
      
      const now = Date.now();
      const newClient: Client = {
        ...client,
        id: newClientRef.id,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(newClientRef, newClient);
      return newClientRef.id;
    },
    
    // Get a client by ID
    async getClient(id: string): Promise<Client | null> {
      const userId = getCurrentUserId();
      const clientRef = doc(db, 'users', userId, 'clients', id).withConverter(createConverter<Client>());
      const clientDoc = await getDoc(clientRef);
      
      if (clientDoc.exists()) {
        return clientDoc.data();
      }
      
      return null;
    },
    
    // Get all clients
    async getClients(): Promise<Client[]> {
      const userId = getCurrentUserId();
      const clientsRef = collection(db, 'users', userId, 'clients').withConverter(createConverter<Client>());
      const querySnapshot = await getDocs(clientsRef);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Update a client
    async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<void> {
      const userId = getCurrentUserId();
      const clientRef = doc(db, 'users', userId, 'clients', id);
      
      await updateDoc(clientRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    
    // Delete a client
    async deleteClient(id: string): Promise<void> {
      const userId = getCurrentUserId();
      const clientRef = doc(db, 'users', userId, 'clients', id);
      
      await deleteDoc(clientRef);
    },
    
    // Subscribe to clients (real-time updates)
    subscribeToClients(callback: (clients: Client[]) => void): () => void {
      try {
        const userId = getCurrentUserId();
        const clientsRef = collection(db, 'users', userId, 'clients').withConverter(createConverter<Client>());
        
        return onSnapshot(clientsRef, (snapshot) => {
          const clients = snapshot.docs.map(doc => doc.data());
          callback(clients);
        });
      } catch (error) {
        console.error('Error subscribing to clients:', error);
        return () => {};
      }
    },
  };
  
  // Opportunity service
  export const opportunityService = {
    // Create a new opportunity
    async addOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const userId = getCurrentUserId();
      const opportunitiesRef = collection(db, 'users', userId, 'opportunities').withConverter(createConverter<Opportunity>());
      const newOpportunityRef = doc(opportunitiesRef);
      
      const now = Date.now();
      const newOpportunity: Opportunity = {
        ...opportunity,
        id: newOpportunityRef.id,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(newOpportunityRef, newOpportunity);
      return newOpportunityRef.id;
    },
    
    // Get an opportunity by ID
    async getOpportunity(id: string): Promise<Opportunity | null> {
      const userId = getCurrentUserId();
      const opportunityRef = doc(db, 'users', userId, 'opportunities', id).withConverter(createConverter<Opportunity>());
      const opportunityDoc = await getDoc(opportunityRef);
      
      if (opportunityDoc.exists()) {
        return opportunityDoc.data();
      }
      
      return null;
    },
    
    // Get all opportunities
    async getOpportunities(): Promise<Opportunity[]> {
      const userId = getCurrentUserId();
      const opportunitiesRef = collection(db, 'users', userId, 'opportunities').withConverter(createConverter<Opportunity>());
      const querySnapshot = await getDocs(opportunitiesRef);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get opportunities by client
    async getOpportunitiesByClient(clientId: string): Promise<Opportunity[]> {
      const userId = getCurrentUserId();
      const opportunitiesRef = collection(db, 'users', userId, 'opportunities').withConverter(createConverter<Opportunity>());
      const q = query(opportunitiesRef, where('clientId', '==', clientId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Update an opportunity
    async updateOpportunity(id: string, updates: Partial<Omit<Opportunity, 'id' | 'createdAt'>>): Promise<void> {
      const userId = getCurrentUserId();
      const opportunityRef = doc(db, 'users', userId, 'opportunities', id);
      
      await updateDoc(opportunityRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    
    // Delete an opportunity
    async deleteOpportunity(id: string): Promise<void> {
      const userId = getCurrentUserId();
      const opportunityRef = doc(db, 'users', userId, 'opportunities', id);
      
      await deleteDoc(opportunityRef);
    },
    
    // Subscribe to opportunities (real-time updates)
    subscribeToOpportunities(callback: (opportunities: Opportunity[]) => void): () => void {
      try {
        const userId = getCurrentUserId();
        const opportunitiesRef = collection(db, 'users', userId, 'opportunities').withConverter(createConverter<Opportunity>());
        
        return onSnapshot(opportunitiesRef, (snapshot) => {
          const opportunities = snapshot.docs.map(doc => doc.data());
          callback(opportunities);
        });
      } catch (error) {
        console.error('Error subscribing to opportunities:', error);
        return () => {};
      }
    },
  };
  
  // Interaction service
  export const interactionService = {
    // Create a new interaction
    async addInteraction(interaction: Omit<Interaction, 'id'>): Promise<string> {
      const userId = getCurrentUserId();
      const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
      const newInteractionRef = doc(interactionsRef);
      
      const newInteraction: Interaction = {
        ...interaction,
        id: newInteractionRef.id,
      };
      
      await setDoc(newInteractionRef, newInteraction);
      return newInteractionRef.id;
    },
    
    // Get an interaction by ID
    async getInteraction(id: string): Promise<Interaction | null> {
      const userId = getCurrentUserId();
      const interactionRef = doc(db, 'users', userId, 'interactions', id).withConverter(createConverter<Interaction>());
      const interactionDoc = await getDoc(interactionRef);
      
      if (interactionDoc.exists()) {
        return interactionDoc.data();
      }
      
      return null;
    },
    
    // Get all interactions
    async getInteractions(): Promise<Interaction[]> {
      const userId = getCurrentUserId();
      const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
      const q = query(interactionsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get interactions by client
    async getInteractionsByClient(clientId: string): Promise<Interaction[]> {
      const userId = getCurrentUserId();
      const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
      const q = query(interactionsRef, where('clientId', '==', clientId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get interactions by opportunity
    async getInteractionsByOpportunity(opportunityId: string): Promise<Interaction[]> {
      const userId = getCurrentUserId();
      const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
      const q = query(interactionsRef, where('opportunityId', '==', opportunityId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get recent interactions
    async getRecentInteractions(limit_count = 10): Promise<Interaction[]> {
      const userId = getCurrentUserId();
      const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
      const q = query(interactionsRef, orderBy('date', 'desc'), limit(limit_count));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Update an interaction
    async updateInteraction(id: string, updates: Partial<Omit<Interaction, 'id'>>): Promise<void> {
      const userId = getCurrentUserId();
      const interactionRef = doc(db, 'users', userId, 'interactions', id);
      
      await updateDoc(interactionRef, updates);
    },
    
    // Delete an interaction
    async deleteInteraction(id: string): Promise<void> {
      const userId = getCurrentUserId();
      const interactionRef = doc(db, 'users', userId, 'interactions', id);
      
      await deleteDoc(interactionRef);
    },
    
    // Subscribe to interactions (real-time updates)
    subscribeToInteractions(callback: (interactions: Interaction[]) => void): () => void {
      try {
        const userId = getCurrentUserId();
        const interactionsRef = collection(db, 'users', userId, 'interactions').withConverter(createConverter<Interaction>());
        const q = query(interactionsRef, orderBy('date', 'desc'));
        
        return onSnapshot(q, (snapshot) => {
          const interactions = snapshot.docs.map(doc => doc.data());
          callback(interactions);
        });
      } catch (error) {
        console.error('Error subscribing to interactions:', error);
        return () => {};
      }
    },
  };
  
  // Task service
  export const taskService = {
    // Create a new task
    async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      const newTaskRef = doc(tasksRef);
      
      const newTask: Task = {
        ...task,
        id: newTaskRef.id,
        createdAt: Date.now(),
      };
      
      await setDoc(newTaskRef, newTask);
      return newTaskRef.id;
    },
    
    // Get a task by ID
    async getTask(id: string): Promise<Task | null> {
      const userId = getCurrentUserId();
      const taskRef = doc(db, 'users', userId, 'tasks', id).withConverter(createConverter<Task>());
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        return taskDoc.data();
      }
      
      return null;
    },
    
    // Get all tasks
    async getTasks(): Promise<Task[]> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      const q = query(tasksRef, orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get tasks by client
    async getTasksByClient(clientId: string): Promise<Task[]> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      const q = query(tasksRef, where('clientId', '==', clientId), orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get tasks by opportunity
    async getTasksByOpportunity(opportunityId: string): Promise<Task[]> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      const q = query(tasksRef, where('opportunityId', '==', opportunityId), orderBy('dueDate', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get upcoming tasks
    async getUpcomingTasks(days = 7): Promise<Task[]> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      
      const now = Date.now();
      const futureDate = now + days * 24 * 60 * 60 * 1000;
      
      const q = query(
        tasksRef, 
        where('completed', '==', false),
        where('dueDate', '>=', Timestamp.fromMillis(now)),
        where('dueDate', '<=', Timestamp.fromMillis(futureDate)),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Get overdue tasks
    async getOverdueTasks(): Promise<Task[]> {
      const userId = getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
      
      const now = Date.now();
      
      const q = query(
        tasksRef, 
        where('completed', '==', false),
        where('dueDate', '<', Timestamp.fromMillis(now)),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    },
    
    // Update a task
    async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
      const userId = getCurrentUserId();
      const taskRef = doc(db, 'users', userId, 'tasks', id);
      
      await updateDoc(taskRef, updates);
    },
    
    // Toggle task completion
    async toggleTaskCompletion(id: string): Promise<void> {
      const userId = getCurrentUserId();
      const taskRef = doc(db, 'users', userId, 'tasks', id).withConverter(createConverter<Task>());
      
      const taskDoc = await getDoc(taskRef);
      if (taskDoc.exists()) {
        const task = taskDoc.data();
        await updateDoc(taskRef, {
          completed: !task.completed
        });
      }
    },
    
    // Delete a task
    async deleteTask(id: string): Promise<void> {
      const userId = getCurrentUserId();
      const taskRef = doc(db, 'users', userId, 'tasks', id);
      
      await deleteDoc(taskRef);
    },
    
    // Subscribe to tasks (real-time updates)
    subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
      try {
        const userId = getCurrentUserId();
        const tasksRef = collection(db, 'users', userId, 'tasks').withConverter(createConverter<Task>());
        const q = query(tasksRef, orderBy('dueDate', 'asc'));
        
        return onSnapshot(q, (snapshot) => {
          const tasks = snapshot.docs.map(doc => doc.data());
          callback(tasks);
        });
      } catch (error) {
        console.error('Error subscribing to tasks:', error);
        return () => {};
      }
    },
  };