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
import { MessageData, ChatListData } from "../Data/dummyData";
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

// import { bottomTabHeight } from "../App";

const statusBarHeight = StatusBar.currentHeight;
// console.log(statusBarHeight);

const ChatBubble = (
  messageSenderName,
  messageSenderAvatar,
  messageContent,
  messageDate,
  messageStatus
) => (
  <View className="flex-row py-[10px]">
    <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
      <ImageBackground
        source={messageSenderAvatar}
        className="w-[100%] h-[100%]"
        resizeMode="cover"
      />
    </View>
    <View className="justify-evenly pl-[10px]">
      <View className="flex-row items-end">
        <Text className="text-[17px] text-white font-bold">
          {messageSenderName}
        </Text>
        <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">
          {messageDate}
        </Text>
      </View>
      <Text className="text-[13px] text-white">{messageContent}</Text>
      {messageStatus === Constants.deliveryState.delivering && (
        <Text>Loading</Text>
      )}
    </View>
  </View>
);

// const messageReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_MESSAGE":
//       console.log("add message:", [...state, action.payload]);
//       return [...state, action.payload];
//     case "UPDATE_MESSAGE_STATUS":
//       return state.map((message) =>
//         message.messageId === action.payload.messageId
//           ? { ...message, status: action.payload.status }
//           : message
//       );
//     default:
//       throw new Error();
//   }
// };

const messageReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      console.log("add message:", [...state, action.payload]);
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
    default:
      throw new Error();
  }
};

const ChatScreen = () => {
  // 消息列表
  // const [messages, setMessages] = useState([]);
  // 收到的最新消息
  const [newMessage, setNewMessage] = useState("");
  // 当前选择的聊天对象的id
  const [curRecipientId, setCurRecipientId] = useState(2);
  const [curRecipientName, setCurRecipientName] = useState();

  const [messages, dispatchMessages] = useReducer(messageReducer, []);

  useEffect(() => {
    JSEvent.on(UIEvents.Message.MessageState_UIRefresh, (messageData) => {
      // assuming messageData contains status
      console.log("message recived in chat: ", messageData);
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

    // Don't forget to remove the listener when the component unmounts
    return () => JSEvent.remove(UIEvents.Message.MessageState_UIRefresh);
  }, []);

  useEffect(() => {
    const curChatData = MessageData.find(
      (item) => item.recipientId === curRecipientId
    );
    // console.log(curChatData);
    // setMessages(curChatData.messages);
    // setMessages(DataCenter.messageCaches["1-17"]);
    setCurRecipientName(curChatData.recipientName);
  }, [curRecipientId]);

  const flatListRef = useRef();

  const onClickChatHandler = (recipentId) => {
    // 切换到指定的窗口
    setCurRecipientId(recipentId);
    console.log(curRecipientId);
  };

  const ChatList = (recipientId, chatAvatar) => (
    // add onPress handler to switch chat recipient
    <TouchableHighlight onPress={() => onClickChatHandler(recipientId)}>
      <View className="overflow-hidden rounded-full w-[55px] h-[55px] mb-[15px]">
        <ImageBackground
          source={chatAvatar}
          className="w-[100%] h-[100%]"
          resizeMode="cover"
        />
      </View>
    </TouchableHighlight>
  );

  return (
    <View className="flex-1 flex-row pt-[5vh]">
      <View className="w-[20%] items-center flex-col">
        <View className="flex-1">
          <FlatList
            data={ChatListData}
            renderItem={({ item }) =>
              ChatList(item.recipientId, item.chatAvatar)
            }
            keyExtractor={(item) => item.recipientId}
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
      <View
        // style={styles.container}
        className="flex-1 bg-[#262F38] rounded-lg"
      >
        <View className="flex-row justify-between p-[10px]">
          <Text className="text-white font-bold text-[20px]">
            {curRecipientName}
          </Text>
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
          {/* 这里的头像缓存起来 */}

          <FlatList
            ref={flatListRef}
            // data={MessageData}
            data={messages}
            // renderItem={({ item }) =>
            //   ChatBubble(
            //     item.messageSenderName,
            //     item.messageSenderAvatar,
            //     item.messageContent,
            //     item.messageDate
            //   )
            // }
            renderItem={({ item }) => {
              return ChatBubble(
                item.senderId,
                require("../../assets/img/gameCardBg.jpg"),
                item.content,
                "6/10",
                item.status
              );
            }}
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
              onPress={() => MessageService.Inst.onSendMessage(1, newMessage)}
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
