import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";

function OrderItem({
  title,
  imageUrl,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.quantityRow}>
          <Pressable onPress={onDecrease} hitSlop={8}>
            <Ionicons
              name="remove-circle-outline"
              size={24}
              color={Colors.primary800}
            />
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Pressable onPress={onIncrease} hitSlop={8}>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={Colors.primary800}
            />
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={22} color={Colors.error500} />
      </Pressable>
    </View>
  );
}

export default OrderItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  quantityText: {
    marginHorizontal: 14,
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: { padding: 8 },
});
