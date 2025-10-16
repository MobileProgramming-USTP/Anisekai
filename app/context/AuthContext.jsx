import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null,
  signIn: () => undefined,
  signOut: () => undefined,
  updateProfile: () => undefined,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = useCallback((nextUser) => {
    setUser(nextUser || null);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates = {}) => {
    setUser((previous) => {
      if (!previous) {
        return previous;
      }
      return { ...previous, ...updates };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      updateProfile,
    }),
    [user, signIn, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
