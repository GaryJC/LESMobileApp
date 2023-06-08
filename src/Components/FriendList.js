import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StateIndicator } from "./StateIndicator";
import { useNavigation } from "@react-navigation/native";
import { MessageCaches } from "../Models/MessageCaches";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";

export const FriendList = ({ id, name, state, avatar }) => {
  avatar = `https://i.pravatar.cc/?img=${id}`;

  const navigation = useNavigation();

  const goChatHandler = () => {
    navigation.navigate("Chats");
    const chatId = MessageCaches.MakeChatID(id, DataCenter.userInfo.accountId);
    console.log("go to chat id: ", chatId, id);
    JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
      chatId: chatId,
      targetId: id,
    });
  };

  return (
    <View className="flex-row justify-between mb-[10px]">
      <View className="flex-row items-center">
        <View className="relative">
          <View className="w-[55px] h-[55px] rounded-full overflow-hidden mr-[10px]">
            <ImageBackground
              source={{ uri: avatar }}
              className="w-[100%] h-[100%]"
            />
          </View>
          <View className="absolute bottom-[0] right-[5] rounded-full w-[20px] h-[20px] justify-center items-center">
            {/* <View className="bg-[#FF3737] w-[100%] h-[100%] rounded-full"></View> */}
            <StateIndicator state={state} />
          </View>
        </View>
        <Text className="text-white text-[20px] font-bold">{name}</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={goChatHandler}>
          <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center">
            <Ionicons
              name="chatbubble-ellipses-outline"
              color={"white"}
              size={24}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
