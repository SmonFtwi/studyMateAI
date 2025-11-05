'use client';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserAuth } from '@/lib/apicall/user';

// This code sets up an authentication context for a Next.js application.
// It provides user authentication state and a logout function.
// The AuthProvider component handles token management using local storage and URL parameters.
// It verifies the token by calling an authentication API endpoint.
// If the token is invalid, it redirects the user to the login page.
// The useAuthContext hook allows components to access the authentication state.



const urlPath = process.env.NEXT_PUBLIC_backend_url;

interface UserTypes {
  username: string;
  email: string;
  role: string;
  id:number;
  profile_image:string;
}

interface AuthContextState {
  user: UserTypes | null;
  logout: () => void;
  isAuthenticated: boolean;
  
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserTypes | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenReady, setIsTokenReady] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const getTokenFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token');
    };

    const tokenFromURL = getTokenFromURL();
    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      setToken(tokenFromURL);
    } else {
      const tokenFromStorage = localStorage.getItem('token');
      if (tokenFromStorage) {
        setToken(tokenFromStorage);
      }
    }
    setIsTokenReady(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        console.error('Token is undefined or null');
        router.push('/login');
        return;
      }
  
      try {
        const res = await checkUserAuth(token);
        console.log("user", res)
  
        if (res) {
          console.log('Authenticated user:', res);
          setUser(res);
        } else {
          console.warn('Token invalid or user not found');
         //outer.push('/login');
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        //router.push('/login');
      }
    };
  
    if (isTokenReady) {
      checkAuth();
    }
  }, [token, isTokenReady, router]);
  

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const contextValue: AuthContextState = {
    user,
    logout,
    isAuthenticated: !!user,
    
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
