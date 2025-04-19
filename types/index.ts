export type Client = {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    position: string;
    email: string;
    phone: string;
    address?: string;
    status: 'lead' | 'prospect' | 'customer' | 'inactive';
    notes?: string;
    createdAt: number;
    updatedAt: number;
    avatar?: string;
  };
  
  export type Opportunity = {
    id: string;
    title: string;
    clientId: string;
    value: number;
    stage: 'lead' | 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
    probability?: number;
    expectedCloseDate?: number;
    notes?: string;
    createdAt: number;
    updatedAt: number;
  };
  
  export type Interaction = {
    id: string;
    clientId: string;
    opportunityId?: string;
    type: 'call' | 'message' | 'meeting' | 'email' | 'note';
    date: number;
    duration?: number; // For calls/meetings (in minutes)
    notes?: string;
    outcome?: string;
    followUpDate?: number;
  };
  
  export type Task = {
    id: string;
    title: string;
    description?: string;
    clientId?: string;
    opportunityId?: string;
    dueDate: number;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: number;
  };