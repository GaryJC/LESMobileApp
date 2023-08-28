import { TextInput, TouchableOpacity, Text, View } from "react-native";
import { useState } from "react";

export const ChatMessageInput = ({ onMessageSendHandler }) => {
  const [newMessage, setNewMessage] = useState("");
  const onPressHandler = () => {
    setNewMessage("");
    if (onMessageSendHandler != null && newMessage.length > 0) {
      onMessageSendHandler(newMessage);
    }
  };
  return (
    <View className="flex-row items-center py-[10px] h-[50px]">
      <TextInput
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
        className="flex-1 bg-[#1B1B1B] rounded h-[100%] mr-[10px] p-[5px] text-[#CACACA]"
        // onSubmitEditing={sendMessage}
        placeholderTextColor="#CACACA"
      />
      <TouchableOpacity
        onPress={onPressHandler}
        className="bg-[#6E5EDB] p-[5px] rounded"
      >
        <Text className="text-white font-bold">Send</Text>
      </TouchableOpacity>
    </View>
  );
};
