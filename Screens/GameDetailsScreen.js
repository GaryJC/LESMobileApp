import { View, Text, Button, ImageBackground, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from "react";
import { GameDetailsData, GamesData } from "../Data/dummyData";
import { Ionicons } from "@expo/vector-icons";

const PrimaryButton = (title, icon, key) => (
  <View
    key={key}
    className="bg-[#131F2A] rounded items-center justify-center h-[12vh] flex-[0.45]"
  >
    {/* <Image
      source={icon}
      className="w-[35px] h-[35px] mb-[10px]"
      // resizeMode="scale"
    /> */}
    <Ionicons
      name={icon}
      size={35}
      color={"white"}
      className="mb-[10px]"
    ></Ionicons>
    <Text className="text-white font-bold ">{title}</Text>
  </View>
);

const CommunityButton = (title, icon, key) => (
  <View
    key={key}
    className="bg-[#131F2A] rounded items-center justify-center h-[10vh] flex-[0.3]"
  >
    <Image
      source={icon}
      className="w-[25px] h-[25px]"
      // resizeMode="scale"
    />
    <Text className="text-white">{title}</Text>
  </View>
);

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // useEffect(() => {
  //   navigation.setOptions({
  //     title: () => {
  //       return <Text className="text-white">Back</Text>;
  //     },
  //   });
  // }, [navigation]);

  //   console.log(route.params.gameId);
  const [gameId, setGameId] = useState(route.params.gameId);

  const [primaryButtonContent, setPrimaryButtonContent] = useState([
    { title: "Website", icon: "browsers-outline" },
    { title: "Patch Notes", icon: "bandage-outline" },
  ]);

  const [communityButtonContent, setCommunityButtonContent] = useState([
    { title: "Twitter", icon: require("../assets/img/twitter_icon.png") },
    { title: "Discord", icon: require("../assets/img/discord_icon.png") },
    { title: "Telegram", icon: require("../assets/img/telegram_icon.png") },
  ]);
  const [gameName, setGameName] = useState();
  const [aboutContent, setAboutContent] = useState();

  useEffect(() => {
    // 调用API获得指定游戏的详细信息
    // const gameName = "MetaVirus";
    // const aboutContent =
    //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";
    // const websiteLink = "";
    // const patchLink = "";
    // const twitterLink = "";
    // const discordLink = "";
    // const telegramLink = "";
    // console.log(GameDetailsData);
    const gameName = GameDetailsData.gameName;
    const aboutContent = GameDetailsData.about;
    const websiteLink = GameDetailsData.websiteLink;
    const patchLink = GameDetailsData.patchNotes;
    const twitterLink = GameDetailsData.twitterLink;
    const discordLink = GameDetailsData.discordLink;
    const telegramLink = GameDetailsData.telegramLink;

    setGameName(gameName);
    setAboutContent(aboutContent);
    setPrimaryButtonContent((pre) => [
      { ...pre[0], link: websiteLink },
      { ...pre[1], link: [patchLink] },
    ]);

    setCommunityButtonContent((pre) => [
      { ...pre[0], link: twitterLink },
      { ...pre[1], link: discordLink },
      { ...pre[2], link: telegramLink },
    ]);
  }, []);

  return (
    <View className="flex-1">
      <View>
        <ImageBackground
          source={require("../assets/img/gameDetailsBg.jpg")}
          resizeMode="cover"
          className="h-[45vh] relative"
        >
          <View className="absolute left-[5vw] top-[5vh]">
            <Ionicons
              name="chevron-back-outline"
              color={"white"}
              size={32}
              onPress={() => navigation.goBack()}
            ></Ionicons>
          </View>
          {/* <View className="">
            <Button title="Back" onPress={() => navigation.goBack()} />
          </View> */}
          <Text className="text-white text-[35px] font-bold absolute bottom-[-2.5vh] left-[5vw]">
            {gameName}
          </Text>
          <View className="bg-[#49B05E] p-[10px] absolute bottom-[-2.5vh] right-[5vw] h-[5vh] flex justify-center rounded-lg">
            {/* download or play */}
            <Text className="text-white font-bold">Download</Text>
          </View>
        </ImageBackground>
      </View>
      <View className="w-[90vw] mx-auto mt-[5vh]">
        <View className="flex-row justify-between ">
          {primaryButtonContent.map((item, index) =>
            PrimaryButton(item.title, item.icon, index)
          )}
        </View>
        <View className="mt-[3vh]">
          <Text className="text-white font-bold text-[20px]">About</Text>
          <Text className="text-white">{aboutContent}</Text>
        </View>
        <Text className="text-white font-bold text-[20px] mt-[3vh] ">
          Community
        </Text>
        <View className="flex-row justify-between flex-wrap mt-[1vh]">
          {/* <Text className="basis-full">Community</Text> */}
          {/* <View className="basis-full"> */}
          {communityButtonContent.map((item, index) =>
            CommunityButton(item.title, item.icon, index)
          )}
          {/* </View> */}
        </View>
      </View>
      {/* <Text className="text-white">GameId: {route.params.gameId}</Text> */}
    </View>
  );
}
