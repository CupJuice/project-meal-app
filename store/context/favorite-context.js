import { createContext, useContext, useEffect, useReducer } from "react";
import { AuthContext } from "./auth-context";
import { fetchFavorites, storeFavorite, deleteFavorite } from "../../util/http";

export const FavoritesContext = createContext({
  ids: [],
  addFavorite: (id) => {},
  removeFavorite: (id) => {},
});

function favoritesReducer(state, action) {
  switch (action.type) {
    case "SET":
      // replace the whole in-memory list, e.g. after fetching from Firebase
      return action.payload;
    case "ADD":
      return state.includes(action.payload)
        ? state
        : [...state, action.payload];
    case "REMOVE":
      return state.filter((id) => id !== action.payload);
    default:
      return state;
  }
}

function FavoritesContextProvider({ children }) {
  const [favoriteMealIds, dispatch] = useReducer(favoritesReducer, []);
  const authCtx = useContext(AuthContext);

  // Whenever the user logs in (or the app auto-logs in), fetch their
  // favorites from the Firebase Realtime Database.
  // Whenever the user logs out, clear the in-memory list.
  useEffect(() => {
    async function loadFavorites() {
      if (!authCtx.isAuthenticated) {
        dispatch({ type: "SET", payload: [] });
        return;
      }
      try {
        const ids = await fetchFavorites(authCtx.userId, authCtx.token);
        dispatch({ type: "SET", payload: ids });
      } catch (error) {
        console.log(
          "Could not fetch favorites from Firebase",
          "status:", error.response?.status,
          "data:", JSON.stringify(error.response?.data),
          "userId:", authCtx.userId
        );
      }
    }

    loadFavorites();
  }, [authCtx.isAuthenticated, authCtx.userId, authCtx.token]);

  function addFavorite(id) {
    // update in-memory context immediately (feels instant to the user)
    dispatch({ type: "ADD", payload: id });
    // then persist to the Firebase Realtime Database (cloud data store)
    if (authCtx.isAuthenticated) {
      storeFavorite(authCtx.userId, id, authCtx.token).catch((error) => {
        console.log("Could not store favorite in Firebase", error);
      });
    }
  }

  function removeFavorite(id) {
    dispatch({ type: "REMOVE", payload: id });
    if (authCtx.isAuthenticated) {
      deleteFavorite(authCtx.userId, id, authCtx.token).catch((error) => {
        console.log("Could not delete favorite from Firebase", error);
      });
    }
  }

  const value = {
    ids: favoriteMealIds,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesContextProvider;