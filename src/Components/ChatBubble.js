import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Constants from "../modules/Constants";
import { useState, useEffect } from "react";
import DataCenter from "../modules/DataCenter";
import formatDate from "../utils/formatDate";
import Avatar from "./Avatar";
import { LesConstants } from "les-im-components";
import IMUserInfoService from "../services/IMUserInfoService";

export const ChatBubble = ({ message, preMessage, userInfo }) => {
  //Calculate time difference and check if it's more than 5 minutes

  // const senderUserInfo = userInfo?.find((user) => user.id === message.senderId);

  const [senderUserInfo, setSenderUserInfo] = useState();
  // console.log(message);

  const showTimestamp = () => {
    if (preMessage) {
      const timeDifference = message.timestamp - preMessage.timestamp;
      return timeDifference >= 5 * 60 * 1000; //difference is in milliseconds
    }
    return true; //Show timestamp for the first message
  };

  // const senderUserInfo = IMUserInfoService.Inst.getUser(message.senderId);

  // useEffect(() => {
  //   const getSenderUserInfo = async () => {
  //     const data = (
  //       await IMUserInfoService.Inst.getUser(message.senderId)
  //     ).pop();
  //     console.log("ddd: ", data);
  //     setSenderUserInfo(data);
  //   };
  //   getSenderUserInfo();
  // }, [message]);

  const getSenderUserInfo = async () => {
    const data = (await IMUserInfoService.Inst.getUser(message.senderId)).pop();
    setSenderUserInfo(data);
  };
  getSenderUserInfo();

  // console.log("sender user info: ", senderUserInfo, message);

  const SpecialMessage = () => {
    let content;
    // const username = userInfo.find(
    //   (user) => user.id === message.recipientId
    // )?.name;
    const username = senderUserInfo?.name;
    switch (message.contentType) {
      case LesConstants.IMMessageContentType.Group_MemberAdded:
        if (message?.senderId === message?.recipientId) {
          content = `${username} has created the group`;
        } else {
          content = `${username} has been invited to the group`;
        }
        break;
      case LesConstants.IMMessageContentType.Group_MemberKick:
        content = `${username} has been kicked from the group`;
        break;
      case LesConstants.IMMessageContentType.Group_MemberQuit:
        content = `${username} has quitted the group`;
        break;
    }
    return (
      <View>
        <Text className="text-white text-center my-[10px]">{content}</Text>
      </View>
    );
  };

  const TimeStamp = ({ date }) => (
    <View className="px-[10px] flex-row items-center">
      <View className="h-[1px] flex-1 bg-[#494949] mr-[5px]" />
      <Text className="text-[12px] text-[#CFCFCF]">{date}</Text>
      <View className="h-[1px] flex-1 bg-[#494949] ml-[5px]" />
    </View>
  );

  // const Avatar = ({ avatar }) => (
  //   <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
  //     <ImageBackground
  //       source={{ uri: avatar }}
  //       className="w-[100%] h-[100%]"
  //       resizeMode="cover"
  //     />
  //   </View>
  // );

  const Bubble = ({ isOwn }) => (
    <View
      className={
        isOwn
          ? "flex-row py-[10px] justify-end"
          : "flex-row py-[10px] justify-start"
      }
    >
      {/* {!isOwn && <Avatar avatar={userInfo.avatar} />} */}
      {!isOwn && (
        <View className=" w-[45px] h-[45px]">
          <Avatar tag={senderUserInfo?.tag} name={senderUserInfo?.name} />
        </View>
      )}
      <View className="justify-evenly">
        <View className="flex-row items-end">
          <Text
            className={
              isOwn
                ? "text-[10px] text-white mr-[5px]"
                : "text-[10px] text-white ml-[5px]"
            }
          >
            {senderUserInfo?.name}
          </Text>
        </View>
        <View
          onTouchEnd={() => { console.log(message)}}
          className={
            isOwn
              ? "flex-row justify-center pr-[30vw] mr-[5px] bg-[#5EB857] px-2 py-2 rounded"
              : "flex-row justify-center pl-[30vw] ml-[5px] bg-[#445465] px-2 py-2 rounded"
          }
        >
          <Text
            className={
              isOwn ? "text-[12px] text-black" : "text-[12px] text-white"
            }
          >
            {message?.content}
          </Text>
          {message?.status === Constants.deliveryState.delivering && (
            <ActivityIndicator
              className={isOwn ? "pr-[10px]" : "pl-[10px]"}
              size={"small"}
              color={"#8D8D8D"}
            />
          )}
        </View>
      </View>
      {/* {isOwn && <Avatar avatar={userInfo.avatar} />} */}
      {isOwn && (
        <View className=" w-[45px] h-[45px]">
          <Avatar tag={senderUserInfo?.tag} name={senderUserInfo?.name} />
        </View>
      )}
    </View>
  );

  return (
    <>
      {showTimestamp() && (
        <TimeStamp date={formatDate(new Date(message?.timestamp))} />
      )}
      {message.contentType !== LesConstants.IMMessageContentType.Text ? (
        <SpecialMessage />
      ) : (
        <Bubble isOwn={message.senderId == DataCenter.userInfo.accountId} />
      )}
    </>
  );
};
