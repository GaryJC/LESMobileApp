import { useEffect, useState } from "react";
import { getSpecificGameData } from "../../Components/Games/handler";
import {
  ActivityIndicator,
  SafeAreaView,
  Image,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import GameDetailsCard from "../../Components/Games/GameDetailsCard";
import Carousel from "../../Components/Carousel";
import API from "../../modules/Api";
import GameDetailsTabs from "../../Components/Games/GameDetailsTabs";

const { width: windowWidth } = Dimensions.get("window");

export default function GameDetailScreen({ route }) {
  const id = route.params.id;
  console.log("id", id);

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSpecificGameData(id)
      .then((data) => {
        setGame(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  console.log("game", game);

  const renderItem = ({ item }) => {
    console.log("item", item, API.fetchImage(item));
    return (
      <Image
        source={{ uri: API.fetchImage(item) }}
        style={{ width: windowWidth, height: 300 }}
        resizeMode="cover"
        // defaultSource={require("../../../assets/img/unknown.png")}
        onError={(error) =>
          console.log("Error loading image:", error.nativeEvent.error)
        }
      />
    );
  };

  return (
    <SafeAreaView>
      {loading || !game ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          <View className="mb-2">
            <Carousel
              data={game.image.slides}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              autoScroll={true}
              autoScrollInterval={3000}
            />
          </View>
          <GameDetailsCard gameData={game} />
          <GameDetailsTabs gameDetail={game.detail} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
