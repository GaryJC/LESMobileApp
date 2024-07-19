import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  ImageBackground,
  Text,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import { ActivitiesData } from "../../Data/dummyData";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import axios from "axios";

const { width: windowWidth } = Dimensions.get("window");

const NewsGenre = Constants.News.Genre.News;

const NewsCard = ({ title, image }) => (
  <Pressable className="w-full">
    <ImageBackground
      source={{ uri: API.fetchImage(image) }}
      resizeMode="cover"
      className="w-full h-full relative"
    >
      <View className="w-[100%] h-[30%] bg-[#182634]/[0.8] absolute bottom-[0] justify-evenly">
        <Text className="text-white text-[16px] font-bold mx-[5vw]">
          {title}
        </Text>
        {/* <Text className="text-white text-[12px] mx-[5vw]">{activityDate}</Text> */}
      </View>
    </ImageBackground>
  </Pressable>
);

const NewsCarousel = () => {
  //   const [activitiesData, setActivitiesData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      index.current = (index.current + 1) % newsData.length;
      flatListRef.current.scrollToOffset({
        offset: index.current * windowWidth,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [newsData.length]);

  useEffect(() => {
    const getNewsData = async () => {
      try {
        const res = await axios.get(API.News.getNewsList(NewsGenre));
        const data = res.data;
        if (data.code == 0) {
          const newsData = data.data.slice(0, 5);
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

  console.log("newsData:", newsData);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={newsData}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            className="flex justify-center items-center rounded-xl overflow-hidden"
            style={{ width: windowWidth, height: 250 }}
          >
            <NewsCard image={item.image} title={item.title} />
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
      <View className="flex-row justify-center items-center mt-2">
        {newsData.map((_, i) => {
          const inputRange = [
            (i - 1) * windowWidth,
            i * windowWidth,
            (i + 1) * windowWidth,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={{ transform: [{ scale }] }}
              className="h-[10px] w-[10px] bg-white rounded-full mx-1"
            />
          );
        })}
      </View>
    </View>
  );
};

export default NewsCarousel;
