import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import MealsOverviewScreen from "./screens/MealsOverviewScreen";
import CategoriesScreen from "./screens/CategoriesScreen";
import MealDetailScreen from "./screens/MealDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import OrderScreen from "./screens/OrderScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import IconButton from "./components/IconButton";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import FavoritesContextProvider from "./store/context/favorite-context";
import OrderContextProvider from "./store/context/order-context";
import AuthContextProvider, {
  AuthContext,
} from "./store/context/auth-context";

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

// ---------------------------------------------------------------------
// Screens shown when the user is NOT authenticated yet
// ---------------------------------------------------------------------
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#351401" },
        headerTintColor: "white",
        contentStyle: { backgroundColor: "#3f2f25" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------
// Screens shown when the user IS authenticated (the original meals app)
// ---------------------------------------------------------------------
function BottomTabNavigator() {
  const authCtx = useContext(AuthContext);

  return (
    <BottomTab.Navigator
      sceneContainerStyle={{ backgroundColor: "#3f2f25" }}
      screenOptions={{
        headerStyle: { backgroundColor: "#351401" },
        headerTintColor: "white",
        tabBarStyle: { backgroundColor: "#351401" },
        tabBarActiveTintColor: "#e2b497",
        tabBarInactiveTintColor: "#ccc",
        headerRight: ({ tintColor }) => (
          <IconButton
            icon="exit"
            color={tintColor}
            onPress={authCtx.logout}
          />
        ),
      }}
    >
      <BottomTab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: "All Categories",
          tabBarLabel: "All Categories",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" color={color} size={size} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      initialRouteName="BottomTab"
      screenOptions={{
        headerStyle: { backgroundColor: "#351401" },
        headerTintColor: "white",
        contentStyle: { backgroundColor: "#3f2f25" },
      }}
    >
      <Stack.Screen
        name="BottomTab"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MealsOverview" component={MealsOverviewScreen} />
      <Stack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={{ title: "About the Meal" }}
      />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------------
// Switch between AuthStack / AuthenticatedStack depending on login state
// ---------------------------------------------------------------------
function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const authCtx = useContext(AuthContext);

  // while we're checking AsyncStorage for a previously stored token
  if (authCtx.isTryingLogin) {
    return <LoadingOverlay message="Loading..." />;
  }

  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <FavoritesContextProvider>
          <OrderContextProvider>
            <Root />
          </OrderContextProvider>
        </FavoritesContextProvider>
      </AuthContextProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
});