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
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppInfoMap } from "../modules/AppInfo";
import { GamesData } from "../Data/dummyData";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HighlightButton from "../Components/HighlightButton";
import Constants from "../modules/Constants";
import GameButton from "../Components/GameButton";
// import GameCard from "../Components/GameCard";

const GameCard = ({ appInfo, gameId, gameImg, gameName }) => {
  const navigation = useNavigation();

  const onPress = (gameId) => {
    console.log(gameId);
    navigation.navigate("GameDetails", { gameId: gameId });
  };

  return (
    <Pressable onPress={() => onPress(gameId)}>
      <View className="rounded-2xl h-[250] w-[100%] my-[20] relative overflow-hidden">
        <ImageBackground
          source={require("../../assets/img/gameCardBg.jpg")}
          resizeMode="cover"
          className="w-[100%] h-[100%] rounded-2xl"
        >
          <View className="flex w-full h-full justify-center items-center">
            <View className="flex p-1 rounded-full mb-[50px] " style={{ backgroundColor: appInfo.iconBorder }}>
              <Image
                source={Constants.Icons.getSystemIcon(appInfo.icon)}
                className="w-[80px] h-[80px] rounded-full"
              />
            </View>
          </View>
        </ImageBackground>
        <View className="absolute rounded-b-2xl bottom-0 h-[70] bg-[#131F2A] w-[100%] flex flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold ml-[20]">
            {appInfo.name}
          </Text>
          {/*download or play*/}
          {/* <Button title="Download" className="ml-[20]" /> */}
          <GameButton
            game={appInfo}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default function GamesScreen() {
  const [searchText, setSearchText] = useState();

  return (
    <View className="mx-[5vw] flex-1">
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
      {/* <View
        className="flex-row items-center bg-[#414141
      ] h-12 rounded-full w-full my-5 px-5"
      >
        <Ionicons name="search-outline" color="#CACACA" size={24} />
        <TextInput
          className="text-gray-300 ml-3 flex-1"
          placeholder="Search for games"
          placeholderTextColor="#CACACA"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View> */}
      <View className="flex-1">
        <FlatList
          data={AppInfoMap.getApps()}
          renderItem={({ item }) => (
            <GameCard
              appInfo={item}
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
