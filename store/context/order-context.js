import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { AuthContext } from "./auth-context";
import {
  fetchOrder,
  storeOrderItem,
  deleteOrderItem,
  clearOrder as clearOrderApi,
  fetchPlacedOrders,
  storePlacedOrder,
} from "../../util/http";

export const OrderContext = createContext({
  items: [], // [{ id, quantity }]
  addToOrder: (id) => {},
  decreaseFromOrder: (id) => {},
  removeFromOrder: (id) => {},
  clearOrder: () => {},
  placedOrders: [], // [{ id, createdAt, items: [{ id, quantity }] }] newest first
  placeOrder: async () => {},
});

function orderReducer(state, action) {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD": {
      const existing = state.find((item) => item.id === action.payload);
      if (existing) {
        return state.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { id: action.payload, quantity: 1 }];
    }
    case "DECREASE": {
      const existing = state.find((item) => item.id === action.payload);
      if (!existing) return state;
      if (existing.quantity <= 1) {
        return state.filter((item) => item.id !== action.payload);
      }
      return state.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    }
    case "REMOVE":
      return state.filter((item) => item.id !== action.payload);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function OrderContextProvider({ children }) {
  const [orderItems, dispatch] = useReducer(orderReducer, []);
  const [placedOrders, setPlacedOrders] = useState([]);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function loadOrder() {
      if (!authCtx.isAuthenticated) {
        dispatch({ type: "SET", payload: [] });
        setPlacedOrders([]);
        return;
      }
      try {
        const items = await fetchOrder(authCtx.userId, authCtx.token);
        dispatch({ type: "SET", payload: items });
      } catch (error) {
        console.log(
          "Could not fetch order from Firebase",
          "status:", error.response?.status,
          "data:", JSON.stringify(error.response?.data),
          "userId:", authCtx.userId
        );
      }
    }

    async function loadPlacedOrders() {
      if (!authCtx.isAuthenticated) return;
      try {
        const orders = await fetchPlacedOrders(authCtx.userId, authCtx.token);
        setPlacedOrders(orders);
      } catch (error) {
        console.log(
          "Could not fetch placed orders from Firebase",
          "status:", error.response?.status,
          "data:", JSON.stringify(error.response?.data)
        );
      }
    }

    loadOrder();
    loadPlacedOrders();
  }, [authCtx.isAuthenticated, authCtx.userId, authCtx.token]);

  function addToOrder(id) {
    const existing = orderItems.find((item) => item.id === id);
    const newQuantity = existing ? existing.quantity + 1 : 1;

    dispatch({ type: "ADD", payload: id });
    if (authCtx.isAuthenticated) {
      storeOrderItem(authCtx.userId, id, newQuantity, authCtx.token).catch(
        (error) => {
          console.log("Could not store order item in Firebase", error);
        }
      );
    }
  }

  function decreaseFromOrder(id) {
    const existing = orderItems.find((item) => item.id === id);
    if (!existing) return;

    dispatch({ type: "DECREASE", payload: id });
    if (authCtx.isAuthenticated) {
      if (existing.quantity <= 1) {
        deleteOrderItem(authCtx.userId, id, authCtx.token).catch((error) => {
          console.log("Could not delete order item from Firebase", error);
        });
      } else {
        storeOrderItem(
          authCtx.userId,
          id,
          existing.quantity - 1,
          authCtx.token
        ).catch((error) => {
          console.log("Could not update order item in Firebase", error);
        });
      }
    }
  }

  function removeFromOrder(id) {
    dispatch({ type: "REMOVE", payload: id });
    if (authCtx.isAuthenticated) {
      deleteOrderItem(authCtx.userId, id, authCtx.token).catch((error) => {
        console.log("Could not delete order item from Firebase", error);
      });
    }
  }

  function clearOrder() {
    dispatch({ type: "CLEAR" });
    if (authCtx.isAuthenticated) {
      clearOrderApi(authCtx.userId, authCtx.token).catch((error) => {
        console.log("Could not clear order in Firebase", error);
      });
    }
  }

  // Move everything in the cart into the order history, then empty the cart.
  // Throws if saving fails, so the cart is kept and the screen can show an error.
  async function placeOrder() {
    if (orderItems.length === 0) return;

    const createdAt = new Date().toISOString();
    const itemsSnapshot = orderItems.map((item) => ({ ...item }));

    let orderId = `local-${Date.now()}`;
    if (authCtx.isAuthenticated) {
      const itemsObj = {};
      itemsSnapshot.forEach((item) => {
        itemsObj[item.id] = item.quantity;
      });
      orderId = await storePlacedOrder(
        authCtx.userId,
        { createdAt, items: itemsObj },
        authCtx.token
      );
    }

    setPlacedOrders((current) => [
      { id: orderId, createdAt, items: itemsSnapshot },
      ...current,
    ]);
    clearOrder();
  }

  const value = {
    items: orderItems,
    addToOrder: addToOrder,
    decreaseFromOrder: decreaseFromOrder,
    removeFromOrder: removeFromOrder,
    clearOrder: clearOrder,
    placedOrders: placedOrders,
    placeOrder: placeOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export default OrderContextProvider;