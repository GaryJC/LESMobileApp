import { View, Text, TouchableHighlight, ImageBackground } from "react-native";
import { useState, useEffect } from "react";

export const ChatList = ({
  curChatId,
  chatId,
  avatar,
  targetId,
  chatListNewMsgCount,
  onClickChatHandler,
}) => {
  const [newMsgCount, setNewMsgCount] = useState(0);

  useEffect(() => {
    const count =
      chatListNewMsgCount.find((item) => chatId === item.chatId)
        ?.newMessageCount ?? 0;
    console.log("new msg count: ", count);
    setNewMsgCount(count);
  }, [chatListNewMsgCount]);

  return (
    // add onPress handler to switch chat recipient
    <TouchableHighlight
      onPress={() => onClickChatHandler({ chatId: chatId, targetId: targetId })}
    >
      <View className="relative">
        <View className="overflow-hidden rounded-full w-[55px] h-[55px] mb-[15px]">
          <ImageBackground
            source={{ uri: avatar }}
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          />
        </View>
        {chatId !== curChatId && newMsgCount !== 0 && (
          <View className="absolute bottom-[10] right-[0] rounded-full w-[20px] h-[20px] bg-[#FF3737] justify-center items-center">
            <Text className="text-white font-bold text-[12px]">
              {newMsgCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
};
