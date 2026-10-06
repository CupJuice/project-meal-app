import { View, Text, Image, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return isoString;
  }
}

// order = { id, createdAt, meals: [{ id, title, imageUrl, quantity }] }
function OrderHistoryItem({ order }) {
  const totalItems = order.meals.reduce((sum, m) => sum + m.quantity, 0);
  const shortId = String(order.id).slice(-6).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNo}>คำสั่งซื้อ #{shortId}</Text>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </View>

      {order.meals.map((meal) => (
        <View key={meal.id} style={styles.row}>
          <Image source={{ uri: meal.imageUrl }} style={styles.image} />
          <Text style={styles.title} numberOfLines={1}>
            {meal.title}
          </Text>
          <Text style={styles.quantity}>x{meal.quantity}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.status}>สั่งซื้อแล้ว</Text>
        <Text style={styles.total}>รวม {totalItems} รายการ</Text>
      </View>
    </View>
  );
}

export default OrderHistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary100,
  },
  orderNo: { fontWeight: "bold", fontSize: 15, color: Colors.primary800 },
  date: { fontSize: 12, color: "#666" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  image: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  title: { flex: 1, fontSize: 14 },
  quantity: { fontWeight: "bold", fontSize: 14, marginLeft: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.primary100,
  },
  status: { color: "#2e7d32", fontWeight: "bold", fontSize: 13 },
  total: { fontWeight: "bold", fontSize: 14, color: Colors.primary800 },
});