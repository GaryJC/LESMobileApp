import { View, Text, TouchableHighlight, ImageBackground } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { LesConstants } from "les-im-components";
import Avatar from "./Avatar";
import Constants from "../modules/Constants";
import IMUserInfoService from "../services/IMUserInfoService";
import ChatGroupService from "../services/ChatGroupService";

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

  useEffect(() => {
    const count =
      chatListNewMsgCount.find((item) => chatListItem?.chatId === item.chatId)
        ?.newMessageCount ?? 0;
    console.log("new msg count: ", count);
    setNewMsgCount(count);
  }, [chatListNewMsgCount]);

  const [info, setInfo] = useState();

  // useEffect(() => {
  //   const data = chatListInfo.find((item) => item.id == chatListItem.targetId);
  //   console.log("ddddd: ", chatListInfo, data, chatListItem);
  //   setInfo(data);
  // }, [chatListInfo, chatListItem]);

  // const info = chatListInfo.find((item) => item.id == chatListItem.targetId);
  // console.log("iiii: ", info, chatListInfo, chatListItem);
  // const chatType = chatListItem.type;

  useEffect(() => {
    const getUserInfo = async () => {
      console.log("nnn: ", chatListItem);
      const chatType = chatListItem.type;
      let userInfo;
      if (chatType === LesConstants.IMMessageType.Single) {
        userInfo = (
          await IMUserInfoService.Inst.getUser(chatListItem.targetId)
        ).pop();
      } else if (chatType === LesConstants.IMMessageType.Group) {
        userInfo = await ChatGroupService.Inst.getChatGroup(
          chatListItem.targetId
        ).pop();
      }
      // return userInfo;
      console.log("kkkk: ", chatType, userInfo);
      setInfo(userInfo);
    };
    getUserInfo();
  }, [chatListItem]);

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
            chatListItem?.type !== Constants.ChatListType.Group &&
            curChatId === chatListItem?.chatId
              ? "border-[#5EB857] border-4 rounded-full w-[55px] h-[55px] mb-[15px] relative"
              : chatListItem?.type === Constants.ChatListType.Group &&
                curChatId === chatListItem?.chatId
              ? "border-[#5EB857] border-4 rounded-2xl w-[55px] h-[55px] mb-[15px] relative"
              : "w-[55px] h-[55px] mb-[15px]"
          }
        >
          {/* <Avatar
            tag={
              chatListItem?.type === Constants.ChatListType.Group
                ? info?.id
                : info?.tag
            }
            name={info?.name}
            isGroup={
              chatListItem?.type === Constants.ChatListType.Group && true
            }
          /> */}
          <Avatar
            tag={info?.tag}
            name={info?.name}
            isGroup={
              chatListItem?.type === Constants.ChatListType.Group && true
            }
          />

          {chatListItem?.type === Constants.ChatListType.Group && (
            <View className="w-[20px] h-[20px] rounded-tr-xl rounded-bl-lg bg-[#6E5EDB] absolute right-0 justify-center items-center">
              <Text className="text-white">G</Text>
            </View>
          )}
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
