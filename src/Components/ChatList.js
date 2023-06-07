import { View, TouchableHighlight, ImageBackground } from "react-native";

export const ChatList = ({ chatId, avatar, targetId }, onClickChatHandler) => {
  return (
    // add onPress handler to switch chat recipient
    <TouchableHighlight onPress={() => onClickChatHandler(chatId, targetId)}>
      <View className="overflow-hidden rounded-full w-[55px] h-[55px] mb-[15px]">
        <ImageBackground
          source={{ uri: avatar }}
          className="w-[100%] h-[100%]"
          resizeMode="cover"
        />
      </View>
    </TouchableHighlight>
  );
};
