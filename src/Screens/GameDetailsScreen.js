import {
  View,
  Text,
  Button,
  ImageBackground,
  Image,
  TouchableHighlight,
  Pressable,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from "react";
import { GameDetailsData, GamesData } from "../Data/dummyData";
import { Ionicons } from "@expo/vector-icons";
import { AppInfoMap } from "../modules/AppInfo";
import Constants from "../modules/Constants";
import { renderPlatformIcon } from "../utils/renderIcon";

const PrimaryButton = ({ title, icon, onPress }) => (
  <TouchableHighlight
    onPress={onPress}
    className="bg-[#131F2A] rounded items-center justify-center h-[12vh] flex-[0.45]"
  >
    <View className="bg-[#131F2A] rounded items-center justify-center h-[12vh] flex-[0.45]">
      <Ionicons
        name={icon}
        size={35}
        color={"white"}
        className="mb-[10px]"
      ></Ionicons>
      <Text className="text-white font-bold ">{title}</Text>
    </View>
  </TouchableHighlight>
);

const CommunityButton = ({ title, icon, onPress }) => (
  <TouchableHighlight
    onPress={onPress}
    className="bg-[#131F2A] rounded items-center justify-center h-[10vh] flex-[0.3]"
  >
    <View className="bg-[#131F2A] rounded items-center justify-center h-[10vh] flex-[0.3]">
      <Image
        source={icon}
        className="w-[25px] h-[25px]"
        // resizeMode="scale"
      />
      <Text className="text-white">{title}</Text>
    </View>
  </TouchableHighlight>
);

const MainInfoCard = () => {
  const dummyData = {
    platforms: [1, 2],
    community: [1, 2, 3],
    developer: "MetaVirus",
    chain: "Binance Smart Chain",
    status: "Active",
  };

  const { platforms, community, developer, chain, status } = dummyData;

  const MainInfoLayout = ({ title, children }) => (
    <View className="flex-row justify-between items-center my-1">
      <Text className="text-white font-bold text-[16px]">{title}</Text>
      <View className="flex-row gap-2">{children}</View>
    </View>
  );
  return (
    <View className="bg-[#131F2A] rounded p-3">
      <MainInfoLayout title={"Platform"}>
        {platforms.length ? (
          platforms.map((platform, index) => (
            <View key={index}>{renderPlatformIcon(platform, 24)}</View>
          ))
        ) : (
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        )}
      </MainInfoLayout>
      <MainInfoLayout title={"Community"}>
        {community.length ? (
          community.map((platform, index) => (
            <Image
              source={Constants.Icons.getSystemIcon(platform)}
              key={index}
              className="w-[24px] h-[24px]"
            />
          ))
        ) : (
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        )}
      </MainInfoLayout>
      <MainInfoLayout title={"Developer"}>
        <Text className="text-white text-[16px] font-bold">{developer}</Text>
      </MainInfoLayout>
      <MainInfoLayout title={"Chain"} />
      <MainInfoLayout title="Status" />
    </View>
  );
};

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [gameId, setGameId] = useState(route.params.gameId);
  const [game, setGame] = useState(null);

  useEffect(() => {
    const g = AppInfoMap.getApp(gameId);
    setGame(g);
  }, [gameId]);

  //   console.log(route.params.gameId);

  const [communityButtonContent, setCommunityButtonContent] = useState([
    { title: "Twitter", icon: require("../../assets/img/twitter_icon.png") },
    { title: "Discord", icon: require("../../assets/img/discord_icon.png") },
    { title: "Telegram", icon: require("../../assets/img/telegram_icon.png") },
  ]);

  return (
    <View className="flex-1">
      <View>
        <ImageBackground
          source={require("../../assets/img/gameDetailsBg.jpg")}
          resizeMode="cover"
          className="h-[45vh] relative"
        >
          <Pressable
            className="absolute left-[5vw] w-full h-[50px] top-[50px] justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back-outline"
              color={"white"}
              size={32}
            ></Ionicons>
          </Pressable>

          <View className="flex w-full justify-center items-center absolute top-[170px]">
            <View
              className="flex p-1 rounded-full mb-[50px] "
              style={{ backgroundColor: game?.iconBorder }}
            >
              <Image
                source={Constants.Icons.getSystemIcon(game?.icon)}
                className="w-[80px] h-[80px] rounded-full"
              />
            </View>
          </View>

          {/* <View className="">
            <Button title="Back" onPress={() => navigation.goBack()} />
          </View> */}
          <Text className="text-white text-[35px] font-bold absolute bottom-[-2.5vh] left-[5vw]">
            {game?.name}
          </Text>
          <View className="absolute bottom-[-2.5vh] right-[5vw] h-[5vh] flex justify-center">
            <GameButton game={game} />
          </View>
        </ImageBackground>
      </View>
      <View className="mx-[5vw] mt-[5vh]">
        <View className="flex-row justify-between ">
          <PrimaryButton
            title={"Website"}
            icon={"browsers-outline"}
            onPress={() => Linking.openURL(game?.web)}
          />
          <PrimaryButton title={"Patch Notes"} icon={"bandage-outline"} />
        </View>
        <View className="mt-[3vh]">
          <Text className="text-white font-bold text-[20px]">About</Text>
          <Text className="text-white">{game?.desc}</Text>
        </View>
        {/* <Text className="text-white font-bold text-[20px] mt-[3vh] ">
          Community
        </Text>
        <View className="flex-row justify-between flex-wrap mt-[1vh]">
          <CommunityButton
            title="Twitter"
            icon={require("../../assets/img/twitter_icon.png")}
          />
          <CommunityButton
            title="Discord"
            icon={require("../../assets/img/discord_icon.png")}
          />
          <CommunityButton
            title="Telegram"
            icon={require("../../assets/img/telegram_icon.png")}
          />
        </View> */}
        <MainInfoCard />
      </View>
      {/* <Text className="text-white">GameId: {route.params.gameId}</Text> */}
    </View>
  );
}
