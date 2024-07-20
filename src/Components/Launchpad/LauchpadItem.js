import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import FlagSvg from "../../../assets/img/flag.svg";
import {
  renderCommunityIcon,
  renderPrice,
  renderTotoalRaised,
} from "../../utils/renderIcon";
import { Linking } from "react-native";

const { fetchImage } = API;

const { Launchpad } = Constants;
const windowWidth = Dimensions.get("window").width;

const LaunchpadItem = ({ item }) => {
  const navigation = useNavigation();
  const { idoPlatform, idoInfo } = item;

  let [month, day] = moment(item.postTime)
    .format("ll")
    .split(",")[0]
    .split(" ");

  day = parseInt(day) < 10 ? "0" + day : day;

  const Flag = () => (
    <>
      {item.status == Launchpad.IDOStatus.Upcoming ? (
        <View className="absolute top-2 left-2 w-[100px] h-[50px] bg-[#FD7B43] flex justify-center items-center rounded-lg shadow-2xl">
          <Text className="font-bold text-white">ONGOING</Text>
        </View>
      ) : (
        <View className="absolute">
          <FlagSvg width={100} height={100} className="shadow-2xl" />
          <View className="w-full absolute">
            <Text className="text-lg font-bold text-center">
              {item.status === Launchpad.IDOStatus.Upcoming ? "Start" : "Ended"}
            </Text>
            <Text className="text-xl text-center font-bold">{day}</Text>
            <Text className="text-lg text-center text-gray-400">
              {month.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View className="bg-[#292A2F] rounded-xl overflow-hidden mr-5">
      <TouchableOpacity
        onPress={() =>
          idoPlatform.name === "NexGami"
            ? navigation.navigate("LaunchpadDetail", { id: item.id })
            : null
        }
        className="relative"
      >
        <Image
          source={{ uri: fetchImage(item.image) }}
          style={{ width: windowWidth * 0.65, aspectRatio: 8 / 5 }}
        />
        <Flag />
      </TouchableOpacity>
      <View className="p-2 text-white">
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold text-white">{item.name}</Text>
          <Image
            source={{ uri: fetchImage(item.token.icon) }}
            style={{ width: 30, height: 30 }}
            className="ml-2 object-contain"
          />
        </View>
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            {item.communities.map((community, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(community.link)}
                className="mr-2"
              >
                <Image
                  source={renderCommunityIcon(community.id)}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() =>
              idoPlatform.name === "NexGami"
                ? navigation.navigate("Home")
                : Linking.openURL(idoPlatform.link)
            }
          >
            <View className="flex-row items-center">
              <Image
                source={require("../../../assets/img/nexgami.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text className="ml-1 text-white">{idoPlatform.name}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mt-3">
          <Text className="text-white">{renderPrice(idoInfo.price)}</Text>
          <Text className="ml-2 text-white">
            {renderTotoalRaised(idoInfo.totalRaised)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LaunchpadItem;
