import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Constants from "../modules/Constants";
import { useState, useEffect } from "react";
import DataCenter from "../modules/DataCenter";
import formatDate from "../utils/formatDate";

export const ChatBubble = ({ message, preMessage, userInfo }) => {
  //Calculate time difference and check if it's more than 5 minutes
  const showTimestamp = () => {
    if (preMessage) {
      const timeDifference = message.timestamp - preMessage.timestamp;
      return timeDifference >= 5 * 60 * 1000; //difference is in milliseconds
    }
    return true; //Show timestamp for the first message
  };

  const TimeStamp = ({ date }) => (
    <View className="px-[10px] flex-row items-center">
      <View className="h-[1px] flex-1 bg-[#494949] mr-[5px]" />
      <Text className="text-[12px] text-[#CFCFCF]">{date}</Text>
      <View className="h-[1px] flex-1 bg-[#494949] ml-[5px]" />
    </View>
  );

  const Avatar = ({ avatar }) => (
    <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
      <ImageBackground
        source={{ uri: avatar }}
        className="w-[100%] h-[100%]"
        resizeMode="cover"
      />
    </View>
  );

  const Bubble = ({ isOwn }) => (
    <View className={`flex-row py-[10px] justify-${isOwn ? "end" : "start"}`}>
      {!isOwn && <Avatar avatar={userInfo.avatar} />}
      <View className="justify-evenly">
        <View className="flex-row items-end">
          <Text
            className={`text-[10px] text-white ${isOwn ? "mr" : "ml"}-[5px]`}
          >
            {userInfo.name}
          </Text>
        </View>
        <View
          className={`flex-row justify-center ${isOwn ? "pr" : "pl"}-[30vw] ${
            isOwn ? "mr" : "ml"
          }-[5px] ${isOwn ? "bg-[#5EB857]" : "bg-[#445465]"} px-2 py-2 rounded`}
        >
          <Text
            className={`text-[12px] ${isOwn ? "text-black" : "text-white"}`}
          >
            {message?.content}
          </Text>
          {message?.status === Constants.deliveryState.delivering && (
            <ActivityIndicator
              className={`${isOwn ? "pr" : "pl"}-[10px]`}
              size={"small"}
              color={"#8D8D8D"}
            />
          )}
        </View>
      </View>
      {isOwn && <Avatar avatar={userInfo.avatar} />}
    </View>
  );

  return (
    <>
      {showTimestamp() && (
        <TimeStamp date={formatDate(new Date(message?.timestamp))} />
      )}
      <Bubble isOwn={message?.senderId === DataCenter.userInfo.accountId} />
    </>
  );
};
