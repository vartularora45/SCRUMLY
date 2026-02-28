import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedTeams = localStorage.getItem("teams");
    const storedActiveTeam = localStorage.getItem("activeTeam");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
    if (storedTeams) setTeams(JSON.parse(storedTeams));
    if (storedActiveTeam) setActiveTeam(JSON.parse(storedActiveTeam));
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);

    const userTeams = userData?.teams || [];

    setTeams(userTeams);
    setActiveTeam(userTeams[0] || null);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    localStorage.setItem("teams", JSON.stringify(userTeams));
    if (userTeams[0]) {
      localStorage.setItem("activeTeam", JSON.stringify(userTeams[0]));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTeams([]);
    setActiveTeam(null);

    localStorage.clear();
  };

  const switchTeam = (team) => {
    setActiveTeam(team);
    localStorage.setItem("activeTeam", JSON.stringify(team));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        teams,
        activeTeam,
        login,
        logout,
        switchTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);