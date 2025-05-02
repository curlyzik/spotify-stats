import { useState, useEffect, createContext, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loginWithPopup, exchangeCodeForTokens } from "@/lib/spotifyAuth";

// Types for our auth context
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scope: string;
}

interface User {
  id: string;
  display_name: string;
  images?: { url: string }[];
  external_urls?: {
    spotify: string;
  };
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

// Create our context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_STORAGE_KEY = "spotify_receipt_user";
const TOKENS_STORAGE_KEY = "spotify_receipt_tokens";

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on initial render
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedTokens = localStorage.getItem(TOKENS_STORAGE_KEY);

        if (storedUser && storedTokens) {
          setUser(JSON.parse(storedUser));
          setTokens(JSON.parse(storedTokens));
        }
      } catch (error) {
        console.error("Error loading auth from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  // Check if token needs refresh
  const refreshTokenIfNeeded = async (): Promise<string | null> => {
    if (!tokens?.refreshToken) return null;

    // Check if token is expired or will expire soon (within 5 minutes)
    const isExpired = tokens.expiresAt < Date.now();
    const willExpireSoon = tokens.expiresAt < Date.now() + 5 * 60 * 1000;

    if (isExpired || willExpireSoon) {
      try {
        const refreshResponse = await apiRequest(
          "POST",
          "/api/spotify/refresh",
          {
            refreshToken: tokens.refreshToken,
          }
        );
        const newTokens = await refreshResponse.json();

        // Update tokens in state and localStorage
        setTokens(newTokens);
        localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(newTokens));

        return newTokens.accessToken;
      } catch (error) {
        console.error("Error refreshing token", error);
        // If refresh fails, log out the user
        logout();
        return null;
      }
    }

    return tokens.accessToken;
  };

  // Login function using popup
  const login = async () => {
    try {
      setIsLoading(true);

      // Open popup and get authorization code
      const code = await loginWithPopup();

      if (!code) {
        throw new Error("Authentication was cancelled or failed.");
      }

      // Exchange code for tokens
      const data = await exchangeCodeForTokens(code);

      // Set user and tokens in state
      setUser(data.user);
      setTokens(data.tokens);

      // Store in localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(data.tokens));

      toast({
        title: "Successfully connected",
        description: "Your Spotify account has been connected.",
      });
    } catch (error) {
      console.error("Error during authentication", error);
      toast({
        title: "Authentication Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to authenticate with Spotify",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKENS_STORAGE_KEY);
  };

  // Function to get a valid access token
  const getAccessToken = async (): Promise<string | null> => {
    if (!tokens) return null;
    return refreshTokenIfNeeded();
  };

  const value = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
