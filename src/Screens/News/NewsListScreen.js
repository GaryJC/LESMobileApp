import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  FlatList,
  SafeAreaView,
} from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import API from "../../modules/Api";
import axios from "axios";
import TabButton from "../../Components/TabButton";
import Constants from "../../modules/Constants";

const NewsGenre = Constants.News.Genre;

export default function NewsListScreen() {
  const navigation = useNavigation();

  const [newsData, setNewsData] = useState([]);

  const [selectedTab, setSelectedTab] = useState(NewsGenre.News);

  useEffect(() => {
    const getNewsData = async () => {
      try {
        const res = await axios.get(API.News.getNewsList(selectedTab));
        const data = res.data;
        if (data.code == 0) {
          const newsData = data.data;
          setNewsData(newsData);
        } else {
          console.log("Error fetching news data:", res.msg);
        }
      } catch (error) {
        console.error("Error fetching news data:", error);
      }
    };
    getNewsData();
  }, [selectedTab]);

  const switchTabHandler = (tab) => {
    setSelectedTab(tab);
  };

  console.log("newsData:", newsData);

  return (
    <SafeAreaView>
      <View className="flex-row justify-between bg-[#262F38] h-[4vh] rounded-lg items-center mb-2">
        <TabButton
          type={NewsGenre.News}
          selectedTab={selectedTab}
          title="News"
          handler={switchTabHandler}
        />
        <TabButton
          type={NewsGenre.Guide}
          selectedTab={selectedTab}
          title="Guide"
          handler={switchTabHandler}
        />
      </View>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.link == null || item.link == "") {
                navigation.navigate("NewsDetail", { id: item.id });
              } else {
                Linking.openURL(item.link);
              }
            }}
            style={{ marginVertical: 10 }}
          >
            <View className="flex-row">
              <Image
                source={{ uri: API.fetchImage(item.image) }}
                style={{
                  width: "35%",
                  height: "auto",
                  borderRadius: 10,
                  aspectRatio: 4 / 3,
                  resizeMode: "cover",
                }}
                alt="news"
              />
              <View style={{ flex: 9.5, paddingLeft: 10 }}>
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  {item.game.id > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <Image
                        source={{ uri: API.fetchImage(item.game.icon) }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          marginRight: 5,
                        }}
                        alt="icon"
                      />
                      <Text className="text-white">{item.game.name}</Text>
                    </View>
                  )}
                  <Text
                    className="text-white text-lg font-bold"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text className="text-white text-xs">
                  {moment(item.time).format("LLL")}
                </Text>
              </View>
            </View>
            <View
              style={{ height: 1, backgroundColor: "#fff", marginTop: 20 }}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
