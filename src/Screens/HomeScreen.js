import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Pressable,
  Image,
  SafeAreaView,
} from "react-native";
// import { StatusBar } from "expo-status-bar";
import { ActivitiesData } from "../Data/dummyData";
import { NewsData } from "../Data/dummyData";
import { useEffect, useState } from "react";
import NewsCarousel from "../Components/Home/NewsCarousel";
import LaunchpadList from "../Components/Home/LaunchpadList";

// add onPress event handler
const Activity = ({ activityImg, activityIntro, activityTitle }) => (
  <Pressable className="w-[70vw] h-[25vh] bg-[#ffffff] rounded-2xl mr-[10vw] overflow-hidden">
    <ImageBackground
      source={activityImg}
      resizeMode="cover"
      className="w-[100%] h-[100%] rounded-2xl relative"
    >
      <View className="w-[100%] h-[30%] bg-[#182634]/[0.8] absolute bottom-[0] justify-evenly">
        <Text className="text-white text-[16px] font-bold mx-[5vw]">
          {activityTitle}
        </Text>
        <Text className="text-white text-[12px] mx-[5vw]">{activityIntro}</Text>
      </View>
    </ImageBackground>
  </Pressable>
);

// add onPress event handler
const News = ({ newsTitle, newsDate, newsImg }) => (
  <Pressable className="my-[5px] mx-[15px] border-b-2 border-[#5C5C5C] h-[10vh] flex-row justify-between items-center">
    <View>
      <Text className="text-white font-bold text-[16px]">{newsTitle}</Text>
      <Text className="text-white">{newsDate}</Text>
    </View>
    <Image source={newsImg} className="w-[50px] h-[50px]" />
  </Pressable>
);

export default function HomeScreen() {
  const [activitiesData, setActivitiesData] = useState([]);
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    setActivitiesData(ActivitiesData);
    setNewsData(NewsData);
  }, []);

  return (
    <SafeAreaView>
      <View className="w-full">
        <NewsCarousel />
        <LaunchpadList />
        {/* <View>
        <FlatList
          // data={ActivitiesData}
          data={activitiesData}
          renderItem={({ item }) => (
            <Activity
              activityImg={item.activityImg}
              activityTitle={item.activityTitle}
              activityIntro={item.activityIntro}
            />
          )}
          keyExtractor={(item) => item.activityId.toString()}
          horizontal={true}
        />
      </View>
      <Text className="text-white font-bold text-[20px] mt-[5vh] mb-[2vh]">
        News
      </Text>
      <View className="bg-[#131F2B] rounded-lg">
        <FlatList
          // data={NewsData}
          data={newsData}
          renderItem={({ item }) => (
            <News
              newsTitle={item.newsTitle}
              newsDate={item.newsDate}
              newsImg={item.newsImg}
            />
          )}
          keyExtractor={(item) => item.newsId.toString()}
        />
      </View> */}
      </View>
    </SafeAreaView>
  );
}
