import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Animated,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";

const { width: windowWidth } = Dimensions.get("window");
const NewsGenre = Constants.News.Genre.News;

// NewsCard component to render each news item
const NewsCard = ({ title, image }) => (
  <View className="w-full rounded-xl overflow-hidden">
    <ImageBackground
      source={{ uri: API.fetchImage(image) }}
      resizeMode="cover" // Changed to 'cover' for better image fit
      className="w-full h-full relative"
    >
      <View className="w-full h-[30%] bg-[#182634]/[0.8] absolute bottom-0 justify-center">
        <Text className="text-white text-[16px] font-bold mx-[5vw]">
          {title}
        </Text>
        {/* You can add more content here if needed */}
      </View>
    </ImageBackground>
  </View>
);

const NewsCarousel = () => {
  const [newsData, setNewsData] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const index = useRef(0);

  const navigation = useNavigation();

  useEffect(() => {
    // Function to automatically scroll through the news items
    const interval = setInterval(() => {
      if (newsData.length > 0) {
        index.current = (index.current + 1) % newsData.length;
        flatListRef.current.scrollToOffset({
          offset: index.current * windowWidth,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [newsData.length]);

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

  console.log("newsData:", newsData);

  return (
    <View>
      <View className="flex-row justify-between items-end px-3 mb-2">
        <Text className="text-white text-2xl font-bold">News</Text>
        <TouchableOpacity onPress={() => navigation.navigate("NewsList")}>
          <Text className="text-white text-lg font-bold">View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={newsData}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            className="flex justify-center items-center px-3"
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
