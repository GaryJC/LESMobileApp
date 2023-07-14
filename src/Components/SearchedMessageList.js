import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import IMUserInfoService from "../services/IMUserInfoService";
import formatDate from "../utils/formatDate";
import DataCenter from "../modules/DataCenter";
import DatabaseService from "../services/DatabaseService";
import { MessageCaches } from "../Models/MessageCaches";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";

const SearchedMessageList = ({ item, handleSheetEnd }) => {
  const [name, setName] = useState();
  const [date, setDate] = useState();
  const [content, setContent] = useState();
  const [senderId, setSenderId] = useState();
  const [recipientId, setRecipientId] = useState();
  const [timelineId, setTimelineId] = useState();
  const [chatId, setChatId] = useState();
  const [messageId, setMessageId] = useState();

  useEffect(() => {
    const { timestamp, senderId, recipientId, content, timelineId, messageId } =
      item;
    setSenderId(senderId);
    setRecipientId(recipientId);
    setContent(content);
    setTimelineId(timelineId);
    setMessageId(messageId);
    setChatId(MessageCaches.MakeChatID(senderId, recipientId));
    let userInfo = DataCenter.userInfo;
    if (senderId === userInfo.accountId) {
      setName(userInfo.imUserInfo.name);
    } else {
      userInfo = IMUserInfoService.Inst.getUser(senderId).pop();
      console.log("uuuuuu: ", userInfo);
      setName(userInfo.name);
    }
    // setAvatar(avatar);
    const date = formatDate(new Date(timestamp)); // Outputs in MM/DD/YY, HH:MM format
    setDate(date);
  }, [item]);

  const onClickMsgHandler = async () => {
    // let data = await DatabaseService.Inst.loadMessagesFromTimelineId(
    //   timelineId,
    // );
    // data.forEach((msg) => DataCenter.messageCache.pushMessage(msg));
    const targetId =
      DataCenter.userInfo.accountId === senderId ? recipientId : senderId;
    // const count =
    //   DataCenter.messageCache.getChatDataByChatId(chatId).messageList.length;
    console.log(
      "ooooo: ",
      DataCenter.messageCache.getChatDataByChatId(chatId).messageList
    );
    const messageList =
      DataCenter.messageCache.getChatDataByChatId(chatId).messageList;
    console.log("searched data: ", data);
    const count =
      messageList.findIndex((item) => item.timelineId === timelineId) + 5;
    console.log("data index: ", count);
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
        <View className="overflow-hidden rounded-full w-[30px] h-[30px]">
          <ImageBackground
            source={{ uri: `https://i.pravatar.cc/?img=${senderId}` }}
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          />
        </View>
        <View className="justify-evenly pl-[10px]">
          <View className="flex-row items-end">
            <Text className="text-[12px] text-white font-bold">{name}</Text>
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

export default SearchedMessageList;
