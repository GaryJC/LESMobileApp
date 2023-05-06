import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ImageBackground,
  Image,
  Button,
  TouchableHighlight,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GamesData } from "../Data/dummyData";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
// import GameCard from "../Components/GameCard";

const GameCard = ({ gameId, gameImg, gameName }) => {
  const navigation = useNavigation();

  const onPress = (gameId) => {
    console.log(gameId);
    navigation.navigate("GameDetails", { gameId: gameId });
  };

  return (
    <Pressable onPress={() => onPress(gameId)}>
      <View className="rounded-2xl h-[250] w-[100%] my-[20] relative">
        <ImageBackground
          source={require("../assets/img/gameCardBg.jpg")}
          resizeMode="cover"
          className="w-[100%] h-[100%] rounded-2xl overflow-hidden"
        ></ImageBackground>
        <View className="absolute rounded-b-2xl bottom-0 h-[70] bg-[#131F2A] w-[100%] flex flex-row items-center justify-between">
          <Text className="text-white text-[20px] font-bold ml-[20]">
            {gameName}
          </Text>
          {/*download or play*/}
          {/* <Button title="Download" className="ml-[20]" /> */}
          <TouchableHighlight>
            <View className="bg-[#6E56DB] p-[10] mr-[20]">
              <Text>Download</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </Pressable>
  );
};

export default function Games() {
  const [searchText, setSearchText] = useState();

  return (
    <View className="w-[90%] mx-auto">
      {/* add event handler for submitting search */}
      <TextInput
        className="bg-[#414141] h-[45] rounded-full w-[100%] my-[20] px-[20]"
        placeholder="Search for games"
        placeholderTextColor="#CACACA"
        value={searchText}
      />
      {/* <View> */}
      <FlatList
        data={GamesData}
        renderItem={({ item }) => (
          <GameCard
            gameId={item.gameId}
            gameImg={item.gameImg}
            gameName={item.gameName}
          />
        )}
        keyExtractor={(item) => item.gameId}
        // className="flex justify-center"
      />
      {/* </View> */}
    </View>
  );
}
