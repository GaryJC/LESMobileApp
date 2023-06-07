import { View, Text, ImageBackground } from "react-native";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";

export const ChatBubble = ({ senderId, content, date, status, userInfo }) => {
  //   const senderAvatar = avatar.find((item) => item.id === senderId).avatar;
  console.log("userInfo: ", userInfo);
  const { name, avatar } = userInfo.find((item) => item.id === senderId);
  //   const senderAvatar = userInfo.find((item))
  return (
    <View className="flex-row py-[10px]">
      <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
        <ImageBackground
          source={{ uri: avatar }}
          className="w-[100%] h-[100%]"
          resizeMode="cover"
        />
      </View>
      <View className="justify-evenly pl-[10px]">
        <View className="flex-row items-end">
          <Text className="text-[17px] text-white font-bold">{name}</Text>
          <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">{date}</Text>
        </View>
        <Text className="text-[13px] text-white">{content}</Text>
        {status === Constants.deliveryState.delivering && <Text>Loading</Text>}
      </View>
    </View>
  );
};
