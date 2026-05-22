import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../utils/api";
import { type User } from "../types";
// import axios from "axios";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const storedToken = localStorage.getItem("access_token");
  //   if (storedToken) {
  //     setToken(storedToken);
  //     fetchUserProfile(storedToken);
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      setTimeout(() => {
        fetchUserProfile();
        // storedToken
      }, 0);
    } else {
      setIsLoading(false);
    }
  }, []);

  // const fetchUserProfile = async (accessToken: string) => {
  //   try {
  //     const response = await authAPI.getProfile();
  //     setUser(response.data);
  //   } catch (error) {
  //     console.error("Failed to fetch user profile:", error);
  //     localStorage.removeItem("access_token");
  //     setToken(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const fetchUserProfile = async (
  //   // accessToken: string
  // )=> {
  const fetchUserProfile = async () => {
    try {
      // Используем axios напрямую с токеном
      // const response = await axios.get(
      //   `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem("access_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // const login = async (email: string, password: string) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await authAPI.login(email, password);
  //     const { access_token } = response.data;

  //     localStorage.setItem('access_token', access_token);
  //     setToken(access_token);

  //     const profileResponse = await authAPI.getProfile();
  //     setUser(profileResponse.data);
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { access_token, refresh_token } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      setToken(access_token);

      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);

      console.log("Токен сохранён:", access_token?.substring(0, 20) + "...");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string,
  ) => {
    setIsLoading(true);
    try {
      await authAPI.register({ email, password, full_name: fullName });
      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    if (refresh_token) {
      await authAPI.logout(refresh_token);
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    window.location.href = "/";
  }
};

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
