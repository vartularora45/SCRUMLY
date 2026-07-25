import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,       setUser]       = useState(null);
  const [token,      setToken]      = useState(null);
  const [teams,      setTeams]      = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedUser       = localStorage.getItem("user");
      const storedToken      = localStorage.getItem("token");
      const storedTeams      = localStorage.getItem("teams");
      const storedActiveTeam = localStorage.getItem("activeTeam");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setTeams(storedTeams ? JSON.parse(storedTeams) : []);
        if (storedActiveTeam) setActiveTeam(JSON.parse(storedActiveTeam));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for global auth events from the API interceptor
  useEffect(() => {
    const handleTokenRefresh = (e) => setToken(e.detail);
    const handleForceLogout = () => logout();

    window.addEventListener('token_refreshed', handleTokenRefresh);
    window.addEventListener('force_logout', handleForceLogout);

    return () => {
      window.removeEventListener('token_refreshed', handleTokenRefresh);
      window.removeEventListener('force_logout', handleForceLogout);
    };
  }, []);

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    const userTeams = userData?.teams || [];
    setTeams(userTeams);
    const firstTeam = userTeams[0] || null;
    setActiveTeam(firstTeam);

    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    localStorage.setItem("teams", JSON.stringify(userTeams));
    if (firstTeam) {
      localStorage.setItem("activeTeam", JSON.stringify(firstTeam));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails, clear client state
    }
    setUser(null);
    setToken(null);
    setTeams([]);
    setActiveTeam(null);
    localStorage.clear();
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  const switchTeam = useCallback((team) => {
    setActiveTeam(team);
    localStorage.setItem("activeTeam", JSON.stringify(team));
  }, []);

  const setActiveTeamWithStorage = useCallback((team) => {
    setActiveTeam(team);
    if (team) {
      localStorage.setItem("activeTeam", JSON.stringify(team));
    } else {
      localStorage.removeItem("activeTeam");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        teams,
        activeTeam,
        isLoading,
        login,
        logout,
        updateUser,
        switchTeam,
        setActiveTeam: setActiveTeamWithStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);