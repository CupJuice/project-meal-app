import { ScrollView, StyleSheet, Image, Text, View } from "react-native";
import MealDetails from "../components/MealDetails";
import { MEALS } from "../data/meal-data";
import Subtitle from "../components/Subtitle";
import List from "../components/List";
import { useContext, useLayoutEffect } from "react";
import IconButton from "../components/IconButton";
import { FavoritesContext } from "../store/context/favorite-context";
import { OrderContext } from "../store/context/order-context";

export default function MealDetailScreen({ route, navigation }) {
  const favoriteMealsCtx = useContext(FavoritesContext);
  const orderCtx = useContext(OrderContext);

  const mealId = route.params.mealId;
  const selectedMeal = MEALS.find((meal) => meal.id === mealId);

  const mealIsFavorite = favoriteMealsCtx.ids.includes(mealId);

  function changeFavoriteStatusHandler() {
    if (mealIsFavorite) {
      favoriteMealsCtx.removeFavorite(mealId);
    } else {
      favoriteMealsCtx.addFavorite(mealId);
    }
  }

  function addToOrderHandler() {
    orderCtx.addToOrder(mealId);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View style={styles.headerButtons}>
            <IconButton
              icon="cart-outline"
              color="white"
              onPress={addToOrderHandler}
            />
            <IconButton
              icon={mealIsFavorite ? "star" : "star-outline"}
              color="white"
              onPress={changeFavoriteStatusHandler}
            />
          </View>
        );
      },
    });
  }, [navigation, changeFavoriteStatusHandler, addToOrderHandler]);

  return (
    <ScrollView style={styles.rootContainer}>
      <Image style={styles.image} source={{ uri: selectedMeal.imageUrl }} />
      <Text style={styles.title}>{selectedMeal.title}</Text>
      <MealDetails
        duration={selectedMeal.duration}
        complexity={selectedMeal.complexity}
        affordability={selectedMeal.affordability}
        textStyle={styles.detailText}
      />
      <View style={styles.listOuterContainer}>
        <View style={styles.listContainer}>
          <Subtitle>Ingredients</Subtitle>
          <List data={selectedMeal.ingredients} />
          <Subtitle>Steps</Subtitle>
          <List data={selectedMeal.steps} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerButtons: { flexDirection: "row", alignItems: "center" },
  rootContainer: { marginBottom: 32 },
  image: { width: "100%", height: 350 },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    margin: 8,
    textAlign: "center",
    color: "white",
  },
  detailText: { color: "white" },
  listOuterContainer: { alignItems: "center" },
  listContainer: { width: "80%" },
});