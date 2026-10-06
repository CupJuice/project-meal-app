import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: "",
  userId: "",
  isAuthenticated: false,
  isTryingLogin: true,
  authenticate: (token, userId) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [authUserId, setAuthUserId] = useState();
  const [isTryingLogin, setIsTryingLogin] = useState(true);

  // useEffect executes once when app starts -> check if a token was
  // stored on the device sandbox from a previous session (auto login)
  useEffect(() => {
    async function fetchToken() {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");

        // Only auto-login if BOTH values were actually persisted.
        // If userId is missing (e.g. write hadn't finished before the
        // app restarted), treat it as "not logged in" instead of
        // logging in with a null userId (which silently fetches the
        // wrong Firebase path and looks like empty favorites/orders).
        if (storedToken && storedUserId) {
          setAuthToken(storedToken);
          setAuthUserId(storedUserId);
        } else {
          await AsyncStorage.multiRemove(["token", "userId"]);
        }
      } catch (error) {
        console.log("Could not fetch stored token", error);
      }
      setIsTryingLogin(false);
    }

    fetchToken();
  }, []);

  async function authenticate(token, userId) {
    setAuthToken(token);
    setAuthUserId(userId);
    // Await both writes so the values are guaranteed to be persisted
    // before this function resolves (previously these were
    // fire-and-forget, which could race with an app restart/reload).
    await AsyncStorage.multiSet([
      ["token", token],
      ["userId", userId],
    ]);
  }

  function logout() {
    setAuthToken(null);
    setAuthUserId(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("userId");
  }

  const value = {
    token: authToken,
    userId: authUserId,
    isAuthenticated: !!authToken, // convert to boolean
    isTryingLogin: isTryingLogin,
    authenticate: authenticate,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export default AuthContextProvider;