import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null,
  signIn: () => undefined,
  signOut: () => undefined,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = useCallback((nextUser) => {
    setUser(nextUser || null);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
