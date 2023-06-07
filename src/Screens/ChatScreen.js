import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
// import { MessageData, ChatListData } from "../Data/dummyData";
import { useState, useRef, useEffect, useReducer } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";
import FriendService from "../services/FriendService";
import MessageService from "../services/MessageService";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import IMUserInfoService from "../services/IMUserInfoService";
import { ChatBubble } from "../Components/ChatBubble";
import { ChatList } from "../Components/ChatList";

// import { bottomTabHeight } from "../App";

const statusBarHeight = StatusBar.currentHeight;
// console.log(statusBarHeight);

const messageReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return [...state, action.payload];

    case "UPDATE_MESSAGE_STATUS":
      console.log(state);
      let updatedState = state.map((message) =>
        message.messageId === action.payload.messageId
          ? { ...message, status: action.payload.status }
          : message
      );
      // Check if the message already exists in the state using find
      let messageExists = state.find(
        (message) => message.messageId === action.payload.messageId
      );
      // If message with the 'delivered' status does not exist in the state, add it
      if (
        !messageExists &&
        action.payload.status === Constants.deliveryState.delivered
      ) {
        updatedState = [...updatedState, action.payload];
      }
      console.log("updatedState: ", updatedState);
      return updatedState;

    case "RESET_AND_ADD_MESSAGES":
      return action.payload.reduce((accumulator, messageData) => {
        if (messageData.status === Constants.deliveryState.delivered) {
          // Check if the message already exists in the state using find
          let messageExists = accumulator.find(
            (message) => message.messageId === messageData.messageId
          );
          // If message with the 'delivered' status does not exist in the state, add it
          if (
            !messageExists &&
            messageData.status === Constants.deliveryState.delivered
          ) {
            return [...accumulator, messageData];
          } else {
            return accumulator.map((message) =>
              message.messageId === messageData.messageId
                ? { ...message, status: messageData.status }
                : message
            );
          }
        } else {
          return [...accumulator, messageData];
        }
      }, []);
    default:
      throw new Error();
  }
};

const ChatScreen = () => {
  // 输入框输入的消息
  const [newMessage, setNewMessage] = useState("");
  // 当前chatid
  const [curChatId, setCurChatId] = useState();
  // 当前选择的聊天对象的id
  const [curRecipientId, setCurRecipientId] = useState();
  // 当前聊天对象的名字
  const [curRecipientName, setCurRecipientName] = useState([]);
  // 当前聊天窗口的的头像
  const [curChatAvatar, setCurChatAvatar] = useState([]);
  const [curUserInfo, setCurUserInfo] = useState([]);
  // 聊天列表
  const [chatListData, setChatListData] = useState([]);
  // 当前聊天窗口的聊天记录
  const [messages, dispatchMessages] = useReducer(messageReducer, []);

  /**
   * 指定对话有数据更新时执行
   * @param {string} chatId
   */
  const msgListener = (chatId) => {
    // 如果当前chatId和接受到的信息chatId匹配就直接更新UI
    console.log("chat id: ", curChatId, chatId);
    if (curChatId === chatId) {
      const messageList = DataCenter.messageCache.getMesssageList(
        chatId,
        0,
        10
      );
      console.log("Message data received: ", messageList);
      messageList.forEach((messageData) => {
        if (messageData.status === Constants.deliveryState.delivered) {
          dispatchMessages({
            type: "UPDATE_MESSAGE_STATUS",
            payload: messageData,
          });
        } else {
          dispatchMessages({
            type: "ADD_MESSAGE",
            payload: messageData,
          });
        }
      });
    }
  };

  /**
   * 将获取的chatList数据转换成UI需要的格式
   * @returns {array}
   */
  const handleChatListData = (chatList) => {
    // 将原始的数据转换成UI所需要的数据
    const chatListData = chatList.map((item) => {
      const targetId = item.targetId;
      // 目前头像为空，先用placeholder
      // const avatar = IMUserInfoService.Inst.getUser(targetId).avatar;
      const avatar = `https://i.pravatar.cc/150?img=${targetId}`;
      const chatId = item.chatId;
      return {
        chatId: chatId,
        targetId: targetId,
        avatar: avatar,
        name: targetId,
      };
    });
    return chatListData;
  };

  /**
   * 对话列表有数据更新时执行
   * @param {string | null} chatId
   */
  const chatListListener = (chatId) => {
    const chatList = DataCenter.messageCache.getChatList();
    setChatListData(handleChatListData(chatList));
    console.log("chat list listener updated id: ", chatId, chatList);
  };

  /**
   * 返回一个用户名组成的数组
   * @param {number|number[]} targetId 可以是一个或多个id
   * @returns {usernames}
   */
  const getUsernames = (targetId) => {
    const usernames = IMUserInfoService.Inst.getUser(targetId).map((item) => {
      item.name;
    });
    return usernames;
  };

  /**
   * 返回一个对象组成的数组，对象内含有用户对应的id, avatar
   * @param {number|number[]} targetId 可以是一个或多个id
   * @returns {avatars}
   */
  const getUserAvatars = (targetId) => {
    // 目前头像为空，先用placeholder
    let avatars = IMUserInfoService.Inst.getUser(targetId).map((item) => {
      return {
        id: item.id,
        avatar: `https://i.pravatar.cc/150?img=${item.id}`,
      };
    });
    // 加入用户自己的头像
    avatars = [
      ...avatars,
      {
        id: DataCenter.userInfo.accountId,
        avatar: `https://i.pravatar.cc/150?img=${DataCenter.userInfo.accountId}`,
      },
    ];
    return avatars;
  };

  /**
   * 获取当前聊天窗口所有对象的信息
   * @param {number|number[]} targetId
   * @returns {userInfo}
   */
  const getUserInfo = (targetId) => {
    // 目前头像为空，先用placeholder
    let userInfo = IMUserInfoService.Inst.getUser(targetId).map((item) => {
      return {
        id: item.id,
        avatar: `https://i.pravatar.cc/150?img=${item.id}`,
        name: item.name,
      };
    });
    // 加入用户自己的信息
    userInfo = [
      ...userInfo,
      {
        id: DataCenter.userInfo.accountId,
        avatar: `https://i.pravatar.cc/150?img=${DataCenter.userInfo.accountId}`,
        name: DataCenter.userInfo.imUserInfo.name,
      },
    ];
    return userInfo;
  };

  useEffect(() => {
    /**
     * 返回打开界面时默认的聊天信息，列表数据
     * @returns {object}
     */
    const getInitData = () => {
      // 获取所有的对话列表数据
      const chatList = DataCenter.messageCache.getChatList();
      console.log("所有的对话列表数据： ", chatList);

      // 获取头部的对话列表
      const initChatListData = chatList[0];

      // 获取初始对话列表的chatId
      const chatId = initChatListData.chatId;
      console.log("initial chat id: ", chatId);
      // 是群聊的话获取所有用户的id?
      const targetId = initChatListData.targetId;

      console.log("targetId: ", targetId);

      // const names = getUsernames(targetId);
      // const avatars = getUserAvatars(targetId);
      const userInfo = getUserInfo(targetId);

      return { chatList, chatId, targetId, names, avatars, userInfo };
    };

    const { chatList, chatId, targetId, names, avatars, userInfo } =
      getInitData();

    setCurChatId(chatId);
    msgListener(chatId);
    setCurUserInfo(userInfo);
    const chatListData = handleChatListData(chatList);
    setChatListData(chatListData);
    // console.log("chat list data: ", chatListData);

    setCurRecipientId(targetId);
    // setCurRecipientName(names);
    // setCurChatAvatar(avatars);
  }, []);

  useEffect(() => {
    JSEvent.on(UIEvents.Message.Message_Chat_Updated, msgListener);
    JSEvent.on(UIEvents.Message.Message_Chat_List_Updated, chatListListener);

    return () => {
      JSEvent.remove(UIEvents.Message.Message_Chat_Updated, msgListener);
      JSEvent.remove(
        UIEvents.Message.Message_Chat_List_Updated,
        chatListListener
      );
    };
  }, [curChatId]);

  const flatListRef = useRef();

  /**
   * 点击chatList切换聊天对象时更新UI
   * @param {string} chatId
   * @param {string} name
   * @param {number} targetId
   */
  const onClickChatHandler = (chatId, targetId) => {
    setCurChatId(chatId);
    const usernames = getUsernames(targetId);
    // setCurRecipientName(usernames);
    const userAvatars = getUserAvatars(targetId);
    const userInfo = getUserInfo(targetId);
    setCurUserInfo(userInfo);
    // setCurChatAvatar(userAvatars);
    setCurRecipientId(targetId);
    dispatchMessages({
      type: "RESET_AND_ADD_MESSAGES",
      payload: DataCenter.messageCache.getMesssageList(chatId, 0, 10),
    });
    console.log("switched chat id: ", chatId);
  };

  return (
    <View className="flex-1 flex-row pt-[5vh]">
      <View className="w-[20%] items-center flex-col">
        <View className="flex-1">
          <FlatList
            data={chatListData}
            renderItem={
              ({ item }) => ChatList(item, onClickChatHandler)
              // <ChatList
              //   recipientId={item.recipentId}
              //   chatAvatar={item.chatAvatar}
              // />
            }
            keyExtractor={(item) => item.targetId}
          />
        </View>
        <View className="flex-2 justify-evenly border-t-2 border-[#575757] p-[5px]">
          <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
            {/* <ImageBackground /> */}
            <Ionicons name="search-outline" color="#5FB54F" size={24} />
          </View>
          <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
            <Ionicons name="add-outline" color="#5FB54F" size={24}></Ionicons>
          </View>
        </View>
      </View>
      <View className="flex-1 bg-[#262F38] rounded-lg">
        <View className="flex-row justify-between p-[10px]">
          {curUserInfo
            .filter((item) => item.id !== DataCenter.userInfo.accountId)
            .map((item, index) => (
              <Text key={index} className="text-white font-bold text-[20px]">
                {item.name}
              </Text>
            ))}
          <Ionicons
            name="ellipsis-horizontal"
            color="white"
            size={24}
          ></Ionicons>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // behavior="position"
          className="flex-1 px-[10px]"
          // keyboardVerticalOffset={-400}
          // keyboardVerticalOffset={140}
        >
          {/* <KeyboardAwareFlatList
          className="flex-1"
          // keyboardShouldPersistTaps="always"
        > */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <ChatBubble
                senderId={item.senderId}
                avatar={curChatAvatar}
                content={item.content}
                date={"6/10"}
                status={item.status}
                userInfo={curUserInfo}
              />
            )}
            ListEmptyComponent={<Text>No messages to display</Text>}
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() =>
              messages.length > 0 &&
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              messages.length > 0 &&
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View className="flex-row items-center py-[10px] h-[50px]">
            <TextInput
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              className="flex-1 bg-[#1B1B1B] rounded h-[100%] mr-[10px] p-[5px] text-[#CACACA]"
              // onSubmitEditing={sendMessage}
              placeholderTextColor="#CACACA"
            />
            <TouchableOpacity
              // onPress={sendMessage}
              onPress={() =>
                MessageService.Inst.sendMessage(curRecipientId, newMessage)
              }
              className="bg-[#5EB857] p-[5px] rounded"
            >
              <Text className="text-white font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {/* </KeyboardAwareFlatList> */}
      </View>
    </View>
  );
};

export default ChatScreen;
