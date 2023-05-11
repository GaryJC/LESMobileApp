import {
  View,
  Text,
  TextInput,
  ImageBackground,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { MessageData, ChatListData } from "../Data/dummyData";

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

const ChatList = (chatId, chatAvatar) => (
  // add onPress handler
  <View className="overflow-hidden rounded-full w-[65px] h-[65px] mb-[15px]">
    <ImageBackground
      source={chatAvatar}
      className="w-[100%] h-[100%]"
      resizeMode="cover"
    />
  </View>
);

export default function Chats() {
  return (
    <View className="mt-[5vh] h-[100%] flex-row mx-auto">
      {/* <View className="h-[100%] w-[30%]"></View> */}
      <View className="w-[25%] h-[100%] items-center">
        <FlatList
          data={ChatListData}
          renderItem={({ item }) => ChatList(item.chatId, item.chatAvatar)}
          keyExtractor={(item) => item.chatId}
        />
      </View>
      <View className="bg-[#262F38] w-[75%] h-[100%] rounded-lg p-[15]">
        {/* <View className="flex-row justify-between">
          <Text className="text-white">Direct Message</Text>
          <Text className="text-white">Add</Text>
        </View>
        <TextInput
          className="bg-[#1B1B1B] h-[35] rounded-lg w-[100%] my-[15] px-[20]"
          placeholder="Search for games"
          placeholderTextColor="#CACACA"
          // value={searchText}
        /> */}
        <View className="h-[90%]">
          <View className="flex-row justify-between">
            <Text className="text-white text-[20px]">Friends' name</Text>
            <Text className="text-white">...</Text>
          </View>
          <View className="mt-[10px]">
            <FlatList
              data={MessageData}
              renderItem={({ item }) =>
                ChatBubble(
                  item.messageSenderName,
                  item.messageSenderAvatar,
                  item.messageContent,
                  item.messageDate
                )
              }
              keyExtractor={(item) => item.messageId}
            />
          </View>
        </View>

        <View className="h-[10%]">
          {/* <KeyboardAvoidingView
          behavior="height"
          // contentContainerStyle={{}}
          className="h-[10%]"
        > */}
          <TextInput
            className="bg-[#1B1B1B] h-[35px] rounded-lg w-[100%] px-[20]"
            placeholderTextColor="#CACACA"
            // value={searchText}
          />
          {/* </KeyboardAvoidingView> */}
        </View>
      </View>
      {/* </View> */}
    </View>
  );
}
