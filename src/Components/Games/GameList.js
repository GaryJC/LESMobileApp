import { useEffect, useState } from "react";
import { getEntireGameList } from "./handler";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import GameCard from "./GameCard";

export default function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEntireGameList()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  console.log("games", games);

  return (
    <SafeAreaView className="items-center mt-5">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={games}
          renderItem={({ item }) => <GameCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          contentContainerStyle={{ width: "90%" }}
        />
      )}
    </SafeAreaView>
  );
}
