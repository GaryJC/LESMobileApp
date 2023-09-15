import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import IMUserInfoService from "../services/IMUserInfoService";
import formatDate from "../utils/formatDate";
import DataCenter from "../modules/DataCenter";
import DatabaseService from "../services/DatabaseService";
import { MessageCaches } from "../Models/MessageCaches";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import Avatar from "./Avatar";

const ChatSearchList = ({ item, handleSheetEnd }) => {
  const { timestamp, senderId, recipientId, content, timelineId, messageId } =
    item;
  const chatId = MessageCaches.MakeChatID(senderId, recipientId);

  // let userInfo = DataCenter.userInfo.imUserInfo;
  // if (senderId !== userInfo.id) {
  const [userInfo] = IMUserInfoService.Inst.getCachedUser(senderId);
  // }
  console.log("userinfo: ", userInfo);

  const date = formatDate(new Date(timestamp));

  const onClickMsgHandler = async () => {
    const targetId =
      DataCenter.userInfo.id === senderId ? recipientId : senderId;
    const messageList =
      DataCenter.messageCache.getChatDataByChatId(chatId).messageList;
    const count =
      messageList.findIndex((item) => item.timelineId === timelineId) + 5;
    const data = DataCenter.messageCache.getMesssageList(chatId, 0, count);

    JSEvent.emit(UIEvents.Message.Message_Search_Updated, {
      chatId: chatId,
      targetId: targetId,
      messageId: messageId,
      data: data,
    });

    handleSheetEnd();
  };

  return (
    <TouchableOpacity onPress={onClickMsgHandler}>
      <View className="flex-row py-[10px] justify-start border-b-2 border-[#5C5C5C]">
        <View className="w-[30px] h-[30px]">
          <Avatar
            // tag={userInfo?.tag}
            name={userInfo.name}
            size={{ w: 30, h: 30 }}
          />
        </View>

        <View className="justify-evenly pl-[10px]">
          <View className="flex-row items-end">
            <Text className="text-[12px] text-white font-bold">
              {userInfo.name}
            </Text>
            <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">{date}</Text>
          </View>
          <View className="flex-row">
            <Text className="text-[13px] text-white pr-[30vw]">{content}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatSearchList;
