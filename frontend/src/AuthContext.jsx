import { createContext, useContext, useEffect, useState } from "react";
import { auth, fetchMe, login as apiLogin, logout as apiLogout } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!auth.access && !auth.refresh) { setBooting(false); return; }
    fetchMe()
      .then(setUser)
      .catch(() => auth.clear())
      .finally(() => setBooting(false));
  }, []);

  const login = async (email, password) => {
    const u = await apiLogin(email, password);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, booting, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}