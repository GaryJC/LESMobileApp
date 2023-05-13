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
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GamesData } from "../Data/dummyData";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
// import GameCard from "../Components/GameCard";

const GameCard = ({ gameId, gameImg, gameName }) => {
  const navigation = useNavigation();

  const onPress = (gameId) => {
    console.log(gameId);
    navigation.navigate("GameDetails", { gameId: gameId });
  };

  return (
    <Pressable onPress={() => onPress(gameId)}>
      <View className="rounded-2xl h-[250] w-[100%] my-[20] relative overflow-hidden">
        <ImageBackground
          source={require("../assets/img/gameCardBg.jpg")}
          resizeMode="cover"
          className="w-[100%] h-[100%] rounded-2xl"
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
    <View className="w-[90%] mx-auto flex-1">
      {/* add event handler for submitting search */}
      {/* <View>
        <TextInput
          className="bg-[#414141] h-[45] rounded-full w-[100%] my-[20] px-[20] text-[#CACACA]"
          placeholder="Search for games"
          placeholderTextColor="#CACACA"
          value={searchText}
        >
          <Ionicons
            name="search-outline"
            color={"#CACACA"}
            size={24}
          ></Ionicons>
        </TextInput>
      </View> */}
      <View className="flex-row items-center bg-[#414141] h-12 rounded-full w-full my-5 px-5">
        <Ionicons name="search-outline" color="#CACACA" size={24} />
        <TextInput
          className="text-gray-300 ml-3 flex-1"
          placeholder="Search for games"
          placeholderTextColor="#CACACA"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>
      <View className="flex-1">
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
        />
      </View>
    </View>
  );
}
