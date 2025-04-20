import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Auth actions
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Helper function to convert Firebase user to our User type
const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get additional user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role: userData?.role || 'user',
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      register: async (email, password, displayName) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update profile with display name
          await updateProfile(userCredential.user, { displayName });
          
          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email,
            displayName,
            role: 'user',
            createdAt: new Date().toISOString(),
          });
          
          // Map Firebase user to our User type and set in store
          const user = await mapFirebaseUser(userCredential.user);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Map Firebase user to our User type and set in store
          const user = await mapFirebaseUser(userCredential.user);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Sign out from Firebase Auth
          await signOut(auth);
          
          // Clear user from store
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          // Send password reset email
          await sendPasswordResetEmail(auth, email);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      
      updateUserProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          if (!get().user) {
            throw new Error('User not authenticated');
          }
          
          // Update user document in Firestore
          await setDoc(doc(db, 'users', get().user!.uid), data, { merge: true });
          
          // Update user in store
          set({ 
            user: { ...get().user!, ...data },
            isLoading: false
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  const { setUser, setLoading } = useAuthStore.getState();
  
  try {
    if (firebaseUser) {
      const user = await mapFirebaseUser(firebaseUser);
      setUser(user);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    setUser(null);
  } finally {
    setLoading(false);
  }
});