import { View, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function GameDetails() {
  const route = useRoute();
  //   console.log(route.params.gameId);
  return (
    <View>
      <Text className="text-white">GameId: {route.params.gameId}</Text>
    </View>
  );
}
