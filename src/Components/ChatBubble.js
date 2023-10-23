import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Constants from "../modules/Constants";
import React, { useState, useEffect } from "react";
import DataCenter from "../modules/DataCenter";
import formatDate from "../utils/formatDate";
import Avatar from "./Avatar";
import { LesConstants } from "les-im-components";
import IMUserInfoService from "../services/IMUserInfoService";

const showTimestamp = (preMessage, message) => {
  if (preMessage) {
    const timeDifference = message.timestamp - preMessage.timestamp;
    return timeDifference >= 5 * 60 * 1000; //difference is in milliseconds
  }
  return true; //Show timestamp for the first message
};

const SpecialMessage = ({ message }) => {
  let content;
  // const username = userInfo.find(
  //   (user) => user.id === message.recipientId
  // )?.name;
  const [recipient, sender] = IMUserInfoService.Inst.getCachedUser([
    message.recipientId,
    message.senderId,
  ]);

  switch (message?.contentType ?? 0) {
    case LesConstants.IMMessageContentType.Group_MemberAdded:
      if (message?.senderId === message?.recipientId) {
        content = `${sender?.name} has created the group`;
      } else {
        content = `${recipient?.name} has been invited to the group`;
      }
      break;
    case LesConstants.IMMessageContentType.Group_MemberKick:
      content = `${recipient?.name} has been kicked from the group`;
      break;
    case LesConstants.IMMessageContentType.Group_MemberQuit:
      content = `${recipient?.name} has quitted the group`;
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
    <Text className=" text-[#CFCFCF]" style={{ fontSize: DataCenter.userInfo.userSetting.getChatFontSize() }}>{date}</Text>
    <View className="h-[1px] flex-1 bg-[#494949] ml-[5px]" />
  </View>
);

const Bubble = ({ isOwn, senderUserInfo, message }) => {
  const fontSize = DataCenter.userInfo.userSetting.getChatFontSize();
  return <View
    className={
      isOwn
        ? "flex-row py-[10px] justify-end"
        : "flex-row py-[10px] justify-start"
    }
  >
    {/* {!isOwn && <Avatar avatar={userInfo.avatar} />} */}
    {!isOwn && (
      <View className=" w-[45px] h-[45px]">
        <Avatar
          tag={senderUserInfo?.tag}
          name={senderUserInfo?.name}
          size={{ w: 45, h: 45, font: 20 }}
        />
      </View>
    )}

    <View className={
      isOwn
        ? "flex items-end"
        : "flex items-start"
    }>
      <View className={
        isOwn
          ? "flex-row items-end justify-end pr-[1px]"
          : "flex-row items-end justify-start"
      }>
        <Text
          className={
            isOwn
              ? "text-white mr-[5px]"
              : "text-white ml-[5px]"
          }
          style={{ fontSize: fontSize }}
        >
          {senderUserInfo?.name}
        </Text>
      </View>
      <View
        className={
          isOwn
            ? "flex-row justify-center pr-[30vw] mr-[5px] bg-[#5EB857] px-2 py-2 rounded"
            : "flex-row justify-center pl-[30vw] ml-[5px] bg-[#445465] px-2 py-2 rounded"
        }
      >
        <Text
          className={
            isOwn ? "text-black max-w-[50vw]" : "text-white max-w-[50vw]"
          }
          style={{ fontSize: fontSize }}
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
        <Avatar
          tag={senderUserInfo?.tag}
          name={senderUserInfo?.name}
          size={{ w: 45, h: 45, font: 20 }}
        />
      </View>
    )}
  </View>
};

export const ChatBubbleV2 = React.memo(
  ({ message, preMessage }) => {
    const [senderUserInfo, setSender] = useState(
      message == null
        ? null
        : IMUserInfoService.Inst.getCachedUser(message.senderId).pop()
    );

    useEffect(() => {
      const sender =
        message == null
          ? null
          : IMUserInfoService.Inst.getCachedUser(message.senderId).pop();
      setSender(sender);
    }, [message]);

    return (
      <>
        {message.contentType !== LesConstants.IMMessageContentType.Text ? (
          <SpecialMessage message={message} />
        ) : (
          <Bubble
            isOwn={message.senderId == DataCenter.userInfo.accountId}
            message={message}
            senderUserInfo={senderUserInfo}
          />
        )}
        {showTimestamp(preMessage, message) && (
          <TimeStamp date={formatDate(new Date(message?.timestamp))} />
        )}
      </>
    );
  },
  (prev, next) => {
    if (prev.message != null && next.message != null) {
      return (
        prev.message.messageId == next.message.messageId &&
        prev.message.status == next.message.status
      );
    } else {
      return prev.message == next.message;
    }
  }
);

export const ChatBubble = ({ message, preMessage, userInfo }) => {
  //Calculate time difference and check if it's more than 5 minutes

  // const senderUserInfo = userInfo?.find((user) => user.id === message.senderId);

  const [senderUserInfo, setSenderUserInfo] = useState(
    IMUserInfoService.Inst.getCachedUser(message.senderId).pop()
  );

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
    if (senderUserInfo == null) {
      console.log("update sender user info...");
      const data = (
        await IMUserInfoService.Inst.getUser(message.senderId)
      ).pop();
      setSenderUserInfo(data);
    }
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
      {showTimestamp(preMessage, message) && (
        <TimeStamp
          date={formatDate(new Date(message?.timestamp), {
            year: "0-digit",
            month: "0-digit",
            day: "0-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      )}
      {message.contentType !== LesConstants.IMMessageContentType.Text ? (
        <SpecialMessage />
      ) : (
        <Bubble isOwn={message.senderId == DataCenter.userInfo.accountId} />
      )}
    </>
  );
};
