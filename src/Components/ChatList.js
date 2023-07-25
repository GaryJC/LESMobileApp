import { View, Text, TouchableHighlight, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import { LesConstants } from "les-im-components";
import Avatar from "./Avatar";

export const ChatList = ({
  curChatId,
  // chatId,
  // avatar,
  // targetId,
  chatListItem,
  chatListInfo,
  chatListNewMsgCount,
  onClickChatHandler,
}) => {
  const [newMsgCount, setNewMsgCount] = useState(0);
  // console.log("oooo: ", chatListInfo, chatListItem);

  useEffect(() => {
    const count =
      chatListNewMsgCount.find((item) => chatListItem?.chatId === item.chatId)
        ?.newMessageCount ?? 0;
    console.log("new msg count: ", count);
    setNewMsgCount(count);
  }, [chatListNewMsgCount]);

  // useEffect(() => {
  //   const res = chatListInfo.find((item) => {
  //     console.log("3232: ", item, chatListItem.targetId);
  //     return item?.id === chatListItem.targetId;
  //   });
  //   console.log("222: ", res);
  // }, [chatListInfo]);

  return (
    // add onPress handler to switch chat recipient
    <TouchableHighlight
      onPress={() =>
        onClickChatHandler({
          chatListItem,
        })
      }
      // onPress={() => console.log(targetId)}
    >
      <View className="relative">
        <View
          className={
            curChatId === chatListItem?.chatId
              ? "border-[#5EB857] border-4 overflow-hidden rounded-full w-[55px] h-[55px] mb-[15px]"
              : "overflow-hidden rounded-full w-[55px] h-[55px] mb-[15px]"
          }
        >
          <ImageBackground
            source={
              chatListItem.type === LesConstants.IMMessageType.Single
                ? {
                    uri: `https://i.pravatar.cc/150?img=${chatListItem?.targetId}`,
                  }
                : { uri: `https://i.pravatar.cc/150?img=${1}` }
            }
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          />
          {/* <Avatar tag={tag} name={name} /> */}
        </View>
        {chatListItem?.chatId !== curChatId && newMsgCount !== 0 && (
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
