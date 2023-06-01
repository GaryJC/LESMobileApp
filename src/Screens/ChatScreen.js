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
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

// import { bottomTabHeight } from "../App";

const statusBarHeight = StatusBar.currentHeight;
// console.log(statusBarHeight);

const ChatBubble = (
  messageSenderName,
  messageSenderAvatar,
  messageContent,
  messageDate
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
    </View>
  </View>
);

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // 当前选择的聊天对象的id
  const [curRecipientId, setCurRecipientId] = useState(2);
  const [curRecipientName, setCurRecipientName] = useState();

  useEffect(() => {
    const curChatData = MessageData.find(
      (item) => item.recipientId === curRecipientId
    );
    // console.log(curChatData);
    setMessages(curChatData.messages);
    setCurRecipientName(curChatData.recipientName);
  }, [curRecipientId]);

  const flatListRef = useRef();

  const onClickChatHandler = (recipentId) => {
    setCurRecipientId(recipentId);
    console.log(curRecipientId);
    // 切换到指定的窗口
  };

  const sendMessage = () => {
    if (newMessage) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setNewMessage("");
    }
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
            renderItem={({ item }) =>
              ChatBubble(
                item.messageSenderName,
                item.messageSenderAvatar,
                item.messageContent,
                item.messageDate
              )
            }
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
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
              onPress={sendMessage}
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
