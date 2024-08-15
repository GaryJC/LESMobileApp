import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import API from "../../modules/Api";
import {
  renderChainIcon,
  renderGameGenre,
  renderGameStatusIcon,
  renderGameStatusName,
  renderPlatformIcon,
} from "../../utils/render";
import Icon from "react-native-vector-icons/MaterialIcons";

const fetchImage = API.fetchImage;

export const PlatFormIcons = ({ platforms }) => {
  if (!platforms.length) {
    return <Icon name="more-horiz" size={24} color="white" />;
  } else {
    return platforms.map((platform, index) => (
      <View key={index} className="mr-1">
        {renderPlatformIcon(platform)}
      </View>
    ));
  }
};

export default function GameCard({ item }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      className="items-center mb-4 w-[100vw]"
      onPress={() =>
        navigation.navigate("GameDetails_new", {
          id: item.id,
          title: item.name,
        })
      }
    >
      <View className="bg-[#202126] rounded-lg overflow-hidden">
        <Image
          source={{ uri: fetchImage(item.image.preview) }}
          //   className="object-cover"
          resizeMode="cover"
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          cover
        />
        <View className="p-2 items-center mb-1">
          <View className="flex-row items-center justify-center mb-1">
            <Text className="text-white text-lg font-bold">{item.name}</Text>
            <View className="flex-row ml-2">
              {item.chain.map((chainItem, index) => (
                <View key={index}>{renderChainIcon(chainItem, 20, 20)}</View>
              ))}
            </View>
          </View>
          <Text className="text-gray-300 mb-2">
            {renderGameGenre(item.genre)}
          </Text>
          <View className="flex-row">
            <PlatFormIcons platforms={item.platform} />
          </View>
        </View>
        <View className="flex-row justify-center bg-[#292A2F] gap-2">
          {renderGameStatusIcon(item.status)}

          <Text className="text-gray-200 text-center">
            {renderGameStatusName(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
