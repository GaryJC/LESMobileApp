import { FlatList, Pressable, Text, View } from "react-native";
import { useState, useEffect } from "react";
import LaunchpadItem from "../Launchpad/LauchpadItem";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const LaunchpadGenre = Constants.Launchpad.Genre.Token;
const LaunchpadStatus = Constants.Launchpad.IDOStatus.Upcoming;

const queryString = new URLSearchParams({
  genre: LaunchpadGenre,
  status: LaunchpadStatus,
}).toString();

const LaunchpadList = () => {
  const [launchpadData, setLaunchpadData] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchLaunchpadData = async () => {
      try {
        const res = await axios.get(
          API.Launchpad.getLaunchpadList(queryString)
        );
        const data = res.data;
        if (data.code == 0) {
          setLaunchpadData(data.data);
        } else {
          console.log(data.msg);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchLaunchpadData();
  }, []);

  console.log("launchpadData", launchpadData);

  return (
    <View className="my-3">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-white text-2xl font-bold">Launchpad</Text>
        <Pressable
          onPress={() => navigation.navigate("LaunchpadList")}
          className="border-gray-400 border-2 rounded-lg p-2"
        >
          <Text className="text-gray-300">More</Text>
        </Pressable>
      </View>
      <FlatList
        data={launchpadData}
        renderItem={({ item }) => (
          <View className="mr-5">
            <LaunchpadItem item={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
      />
    </View>
  );
};

export default LaunchpadList;
