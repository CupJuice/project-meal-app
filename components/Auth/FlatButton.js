import { Pressable, StyleSheet, Text } from "react-native";
import Colors from "../../constants/colors";

function FlatButton({ children, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

export default FlatButton;

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: "center",
    color: Colors.primary100,
  },
});
