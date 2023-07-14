import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Constants from "../modules/Constants";
import { useState, useEffect } from "react";
import DataCenter from "../modules/DataCenter";
import formatDate from "../utils/formatDate";

export const ChatBubble = ({
  // senderId,
  // content,
  // timestamp,
  // status,
  message,
  preMessage,
  userInfo,
}) => {
  const [name, setName] = useState();
  const [avatar, setAvatar] = useState();
  const [date, setDate] = useState();

  // console.log("statusss: ", status);

  //Calculate time difference and check if it's more than 5 minutes
  const showTimestamp = () => {
    if (preMessage) {
      const timeDifference = message.timestamp - preMessage.timestamp;
      return timeDifference >= 5 * 60 * 1000; //difference is in milliseconds
    }
    return true; //Show timestamp for the first message
  };

  const TimeStamp = () => (
    <View className="px-[10px] flex-row items-center">
      <View className="h-[1px] flex-1 bg-[#494949] mr-[5px]" />
      <Text className="text-[12px] text-[#CFCFCF]">{date}</Text>
      <View className="h-[1px] flex-1 bg-[#494949] ml-[5px]" />
    </View>
  );

  useEffect(() => {
    // console.log("user info: ", userInfo, senderId, content);
    const { name, avatar } = userInfo.find(
      (item) => item.id === message?.senderId
    );
    setName(name);
    setAvatar(avatar);

    const date = formatDate(new Date(message?.timestamp)); // Outputs in MM/DD/YY, HH:MM format
    setDate(date);
  }, [message]);

  const Avatar = () => (
    <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
      <ImageBackground
        source={{ uri: avatar }}
        className="w-[100%] h-[100%]"
        resizeMode="cover"
      />
    </View>
  );

  const OwnBubbles = () => (
    <View className="flex-row py-[10px] justify-end">
      <View>
        <View className="flex-row justify-end items-end">
          <Text className="text-[10px] text-white mr-[5px]">{name}</Text>
          {/* <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">{date}</Text> */}
        </View>
        <View className="flex-row justify-center pl-[30vw] mr-[5px] bg-[#5EB857] px-2 py-2 rounded-lg">
          <Text className="text-[12px] text-black">{message?.content}</Text>
          {message?.status === Constants.deliveryState.delivering && (
            <ActivityIndicator
              className="pl-[10px]"
              size={"small"}
              color={"#8D8D8D"}
            />
          )}
        </View>
      </View>
      <Avatar />
    </View>
  );

  const OtherBubbles = () => (
    <View className="flex-row py-[10px] justify-start">
      <Avatar />
      <View className="justify-evenly pl-[10px]">
        <View className="flex-row items-end">
          <Text className="text-[10px] text-white ml-[5px]">{name}</Text>
          {/* <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">{date}</Text> */}
        </View>
        <View className="flex-row justify-center pr-[30vw] ml-[5px] bg-[#445465] px-2 py-2 rounded-lg">
          <Text className="text-[12px] text-white">{message?.content}</Text>
          {message?.status === Constants.deliveryState.delivering && (
            <ActivityIndicator
              className="pl-[10px"
              size={"small"}
              color={"#8D8D8D"}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <>
      {showTimestamp() && <TimeStamp />}
      {message?.senderId === DataCenter.userInfo.accountId ? (
        <OwnBubbles />
      ) : (
        <OtherBubbles />
      )}
    </>
  );
};
