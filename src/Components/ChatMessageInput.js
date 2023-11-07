import { TextInput, TouchableOpacity, Text, View } from "react-native";
import { useContext, useState } from "react";
import { BubbleContext } from "../Screens/ChatScreenV2";
import { Ionicons } from "@expo/vector-icons";

export const ChatMessageInput = ({ onMessageSendHandler }) => {
  const [newMessage, setNewMessage] = useState("");

  const { quote, setQuote } = useContext(BubbleContext);

  const onPressHandler = () => {
    setNewMessage("");
    if (onMessageSendHandler != null && newMessage.length > 0) {
      onMessageSendHandler(newMessage);
    }
  };

  const [height, setHeight] = useState(34); // Initial height
  const maxHeight = 200;

  const handleContentSizeChange = (event) => {
    setHeight(Math.min(maxHeight, event.nativeEvent.contentSize.height + 5));
  };

  const Quote = () => {
    const clearQuote = () => {
      setQuote("");
    };

    return (
      <View className="flex flex-row justify-between items-center bg-clr-gray-dark p-[5px] mt-[5px] rounded-[4px]">
        <Text numberOfLines={3} className="text-white flex-1 mr-1">{quote}</Text>
        <Ionicons
          name="close-circle"
          size={18}
          color="white"
          onPress={clearQuote}
        />
      </View>
    );
  };

  return (
    <View className="flex-row items-end py-[10px]">
      <View className="flex-1 mr-[10px]">
        <TextInput
          submitBehavior="submit"
          onSubmitEditing={() => {
            onPressHandler();
          }}
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text)
          }}
          className="bg-[#1B1B1B] rounded p-[5px] text-[#CACACA] text-base"
          placeholderTextColor="#CACACA"
          multiline={true}
          onContentSizeChange={handleContentSizeChange}
          style={{ height: Math.max(34, height) }} // Minimum height of 30
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
        />
        {quote && <Quote />}
      </View>
      <TouchableOpacity
        onPress={onPressHandler}
        className="bg-[#6E5EDB] p-[5px] rounded"
      >
        <Text className="text-white font-bold">Send</Text>
      </TouchableOpacity>
    </View>
  );
};
