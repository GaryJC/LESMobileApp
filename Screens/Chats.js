import {
  View,
  Text,
  TextInput,
  ImageBackground,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { MessageData, ChatListData } from "../Data/dummyData";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useState, useRef, useEffect } from "react";
// import { bottomTabHeight } from "../App";

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
  const flatListRef = useRef();

  return (
    <View className="mt-[5vh] h-[92vh] flex-row mx-auto">
      {/* <View className="h-[100%] w-[30%]"></View> */}
      <View className="w-[25%] h-[80%] items-center">
        <View>
          <FlatList
            data={ChatListData}
            renderItem={({ item }) => ChatList(item.chatId, item.chatAvatar)}
            keyExtractor={(item) => item.chatId}
          />
        </View>
        <View className="h-[20%] justify-evenly">
          <View className="overflow-hidden w-[45px] h-[45px] bg-white rounded-full">
            <ImageBackground />
          </View>
          <View className="overflow-hidden w-[45px] h-[45px] bg-white rounded-full">
            <ImageBackground />
          </View>
        </View>
      </View>
      <View className="bg-[#262F38] w-[75%] flex-col flex-1 rounded-lg p-[15]">
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
        <View className="flex-1">
          <View className="flex-row justify-between">
            <Text className="text-white text-[20px] font-bold">Tony</Text>
            <Text className="text-white">...</Text>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-auto"
            // style={styles.keyboardView}
          >
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
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                onLayout={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
              />
            </View>

            {/* <View className="flex-1 h-[10%] justify-center border-t-2 border-[#575757]"> */}
            <View>
              <TextInput
                className="bg-[#1B1B1B] rounded-lg w-[100%] px-[20]"
                placeholderTextColor="#CACACA"
                // value={searchText}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}

// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
// } from "react-native";

// const Chats = () => {
//   const [messages, setMessages] = useState([
//     "Hello",
//     "Hi",
//     "How are you?",
//     "How are you?",
//     "How are you?",
//     // "How are you?",
//     // "How are you?",
//     // "How are you?",
//     // "How are you?",
//     // "How are you?",
//     // "How are you?",
//     "How are youuuu?",
//   ]);
//   const [newMessage, setNewMessage] = useState("");
//   const flatListRef = useRef();

//   const sendMessage = () => {
//     if (newMessage) {
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//       setNewMessage("");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Person's Name</Text>
//       </View>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.keyboardView}
//       >
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
//           keyExtractor={(item, index) => index.toString()}
//           onContentSizeChange={() =>
//             flatListRef.current.scrollToEnd({ animated: true })
//           }
//           onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
//         />
//         <View style={styles.inputContainer}>
//           <TextInput
//             value={newMessage}
//             onChangeText={(text) => setNewMessage(text)}
//             style={styles.input}
//             onSubmitEditing={sendMessage}
//           />
//           <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//             <Text>Send</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { padding: 16, backgroundColor: "#f8f8f8" },
//   headerText: { fontSize: 20, fontWeight: "bold" },
//   keyboardView: { flex: 1 },
//   message: {
//     color: "white",
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     margin: 10,
//   },
//   inputContainer: { flexDirection: "row", alignItems: "center", margin: 10 },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginRight: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   sendButton: { padding: 10, backgroundColor: "skyblue", borderRadius: 5 },
// });

// export default Chats;
