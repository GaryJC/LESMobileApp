import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Linking,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import Carousel from "../Carousel";

const { width: windowWidth } = Dimensions.get("window");
const NewsGenre = Constants.News.Genre.News;

const NewsCard = ({ title, image }) => (
  <View style={{ width: windowWidth }} className="rounded-xl overflow-hidden">
    <ImageBackground
      source={{ uri: API.fetchImage(image) }}
      resizeMode="cover"
      style={{ width: "100%", height: "100%" }}
    >
      <View className="w-full h-[30%] bg-[#182634]/[0.8] absolute bottom-0 justify-center">
        <Text className="text-white text-[16px] font-bold mx-[5vw]">
          {title}
        </Text>
      </View>
    </ImageBackground>
  </View>
);

const NewsCarousel = () => {
  const [newsData, setNewsData] = useState([]);
  const navigation = useNavigation();

  console.log("NewsData:", newsData);

  useEffect(() => {
    const getNewsData = async () => {
      try {
        const res = await axios.get(API.News.getNewsList(NewsGenre));
        const data = res.data;
        if (data.code === 0) {
          const newsData = data.data.slice(0, 5); // Take the first 5 items
          setNewsData(newsData);
        } else {
          console.log("Error fetching news data:", res.msg);
        }
      } catch (error) {
        console.error("Error fetching news data:", error);
      }
    };
    getNewsData();
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      style={{ width: windowWidth, height: 200 }}
      onPress={() => {
        if (!item.link) {
          navigation.navigate("NewsDetail", { id: item.id });
        } else {
          Linking.openURL(item.link);
        }
      }}
    >
      <NewsCard image={item.image} title={item.title} />
    </Pressable>
  );

  return (
    <View className="">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-white text-2xl font-bold">News</Text>
        <Pressable
          onPress={() => navigation.navigate("NewsList")}
          className="border-gray-400 border-2 rounded-lg p-2"
        >
          <Text className="text-gray-300">More</Text>
        </Pressable>
      </View>

      <Carousel
        data={newsData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        autoScroll={true}
        autoScrollInterval={3000}
      />
    </View>
  );
};

export default NewsCarousel;
