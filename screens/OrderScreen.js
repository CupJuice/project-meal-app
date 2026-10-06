import { useContext, useState } from "react";
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from "react-native";
import { OrderContext } from "../store/context/order-context";
import { MEALS } from "../data/meal-data";
import OrderItem from "../components/OrderItem";
import OrderHistoryItem from "../components/OrderHistoryItem";
import Colors from "../constants/colors";

// join [{ id, quantity }] with the meal catalog to get title/image
function attachMeals(items) {
  return items
    .map((item) => {
      const meal = MEALS.find((m) => m.id === item.id);
      return meal ? { ...meal, quantity: item.quantity } : null;
    })
    .filter((meal) => meal !== null);
}

export default function OrderScreen() {
  const orderCtx = useContext(OrderContext);
  const [tab, setTab] = useState("cart"); // "cart" | "history"

  const orderMeals = attachMeals(orderCtx.items);
  const totalItems = orderMeals.reduce((sum, meal) => sum + meal.quantity, 0);

  const placedOrders = orderCtx.placedOrders
    .map((order) => ({ ...order, meals: attachMeals(order.items) }))
    .filter((order) => order.meals.length > 0);

  function placeOrderHandler() {
    console.log("placeOrderHandler pressed, totalItems:", totalItems);
    Alert.alert(
      "ยืนยันคำสั่งซื้อ",
      `คุณต้องการสั่งอาหารทั้งหมด ${totalItems} รายการใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "สั่งซื้อ",
          onPress: async () => {
            try {
              await orderCtx.placeOrder();
              // สลับแท็บหลังกด "ตกลง" เพื่อไม่ให้ชนกับการล้างตะกร้า
              Alert.alert("สำเร็จ", "คำสั่งซื้อของคุณถูกส่งเรียบร้อยแล้ว!", [
                { text: "ตกลง", onPress: () => setTab("history") },
              ]);
            } catch (error) {
              console.log(
                "placeOrder failed:",
                error.message,
                "status:", error.response?.status,
                "data:", JSON.stringify(error.response?.data)
              );
              Alert.alert(
                "เกิดข้อผิดพลาด",
                "ไม่สามารถส่งคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง"
              );
            }
          },
        },
      ]
    );
  }

  function renderTabs() {
    return (
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "cart" && styles.tabActive]}
          onPress={() => setTab("cart")}
        >
          <Text style={[styles.tabText, tab === "cart" && styles.tabTextActive]}>
            ตะกร้า{totalItems > 0 ? ` (${totalItems})` : ""}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "history" && styles.tabActive]}
          onPress={() => setTab("history")}
        >
          <Text
            style={[styles.tabText, tab === "history" && styles.tabTextActive]}
          >
            สั่งซื้อแล้ว{placedOrders.length > 0 ? ` (${placedOrders.length})` : ""}
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderCart() {
    if (orderMeals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.text}>ยังไม่มีรายการอาหารในตะกร้า</Text>
          <Text style={styles.subText}>
            กดไอคอนรถเข็นในหน้ารายละเอียดเมนู เพื่อเพิ่มอาหารลงตะกร้า
          </Text>
        </View>
      );
    }

    return (
      <>
        <FlatList
          data={orderMeals}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={false}
          renderItem={({ item }) => (
            <OrderItem
              title={item.title}
              imageUrl={item.imageUrl}
              quantity={item.quantity}
              onIncrease={() => orderCtx.addToOrder(item.id)}
              onDecrease={() => orderCtx.decreaseFromOrder(item.id)}
              onRemove={() => orderCtx.removeFromOrder(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>รวมทั้งหมด {totalItems} รายการ</Text>
          <Pressable
            style={({ pressed }) => [
              styles.orderButton,
              pressed && styles.orderButtonPressed,
            ]}
            onPress={placeOrderHandler}
          >
            <Text style={styles.orderButtonText}>สั่งซื้อ</Text>
          </Pressable>
        </View>
      </>
    );
  }

  function renderHistory() {
    if (placedOrders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.text}>ยังไม่มีคำสั่งซื้อที่สั่งไปแล้ว</Text>
          <Text style={styles.subText}>
            เมื่อกดสั่งซื้อจากตะกร้า รายการจะมาแสดงที่นี่
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={placedOrders}
        keyExtractor={(order) => order.id}
        removeClippedSubviews={false}
        renderItem={({ item }) => <OrderHistoryItem order={item} />}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <View style={styles.container}>
      {renderTabs()}
      {tab === "cart" ? (
        <View key="cart" style={styles.content}>
          {renderCart()}
        </View>
      ) : (
        <View key="history" style={styles.content}>
          {renderHistory()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  content: { flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: { color: "white", fontSize: 16, textAlign: "center", marginBottom: 8 },
  subText: { color: Colors.primary100, fontSize: 13, textAlign: "center" },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.primary800,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  tabActive: { backgroundColor: Colors.primary500 },
  tabText: { color: Colors.primary100, fontWeight: "bold" },
  tabTextActive: { color: Colors.primary800 },
  listContent: { paddingBottom: 8 },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.primary100,
  },
  summaryText: { color: "white", fontSize: 16, fontWeight: "bold" },
  orderButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  orderButtonPressed: { opacity: 0.7 },
  orderButtonText: {
    color: Colors.primary800,
    fontWeight: "bold",
    fontSize: 16,
  },
});