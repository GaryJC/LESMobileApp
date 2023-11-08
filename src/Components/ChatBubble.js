import { LesConstants } from "les-im-components";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import IMUserInfoService from "../services/IMUserInfoService";
import formatDate from "../utils/formatDate";
import Avatar from "./Avatar";

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
    <Text
      className=" text-[#CFCFCF]"
      style={{ fontSize: DataCenter.userInfo.userSetting.getChatFontSize() }}
    >
      {date}
    </Text>
    <View className="h-[1px] flex-1 bg-[#494949] ml-[5px]" />
  </View>
);

//没用了，移动到了MessagePanel.js中
// const BubbleBottomSheet = ({
//   visible,
//   onOpen,
//   onClosed,
//   senderName,
//   message,
// }) => {
//   const msg = Constants.splitContent(message);
//   const bubbleContent = `${senderName}: ${msg.message}`;

//   const { quote, setQuote } = useContext(BubbleContext);

//   const BubbleOption = ({ title, icon }) => {
//     const optionHander = () => {
//       switch (title) {
//         case "Copy":
//           Clipboard.setString(bubbleContent);
//           break;
//         case "Quote":
//           setQuote(bubbleContent);
//           break;
//       }
//       onClosed();
//     };

//     return (
//       <>
//         <TouchableOpacity onPress={optionHander}>
//           <View className="flex-row items-center">
//             {icon}
//             <Text className="ml-[5px] font-bold text-[15px] text-white">
//               {title}
//             </Text>
//           </View>
//         </TouchableOpacity>
//         <Divider />
//       </>
//     );
//   };

//   return (
//     <CommonBottomSheetModal
//       visible={visible}
//       onOpen={onOpen}
//       onClosed={onClosed}
//       snapPoints={["40%"]}
//       index={0}
//       title={"Quote"}
//     >
//       <View className="flex-1 mx-[5%]">
//         <View className="flex flex-row justify-start items-center bg-clr-gray-dark p-[5px] mt-[5px] rounded-[4px]">
//           <Text numberOfLines={5} className="text-white flex-1 mr-1">{bubbleContent}</Text>
//         </View>
//         <Divider />
//         <BubbleOption
//           title={"Copy"}
//           icon={<MaterialIcons name="file-copy" size={24} color="white" />}
//         />
//         <BubbleOption
//           title={"Quote"}
//           icon={<MaterialIcons name="format-quote" size={24} color="white" />}
//         />
//       </View>
//     </CommonBottomSheetModal>
//   );
// };

const Bubble = ({ isOwn, senderUserInfo, message, onAvatarPressed, onContentLongPressed }) => {
  const fontSize = DataCenter.userInfo.userSetting.getChatFontSize();

  // const [ownProfileVisible, setOwnProfileVisible] = useState(false);
  // const [otherProfileVisible, setOtherProfileVisible] = useState(false);

  // const [bubbleVisible, setBubbleVisible] = useState(false);

  // const onOwnProfileOpen = () => {
  //   setOwnProfileVisible(true);
  // };

  // const onOwnProfileClosed = () => {
  //   setOwnProfileVisible(false);
  // };

  // const onOtherProfileOpen = () => {
  //   setOtherProfileVisible(true);
  // };

  // const onOtherProfileClosed = () => {
  //   setOtherProfileVisible(false);
  // };

  /*
  const BubbleMenu = () => {
    return (
        <View className="absolute left-[-70px] bottom-0 bg-[#757171] w-[60px] py-[10px] items-center rounded-lg">
          <Text className="text-white font-bold">Quote</Text>
        </View>
    );
  };
  */

  // const openBubbleSheet = () => {
  //   setBubbleVisible(true);
  // };

  // const closeBubbleSheet = () => {
  //   setBubbleVisible(false);
  // };

  const msg = Constants.splitContent(message?.content);

  return (
    <View
      className={
        isOwn
          ? "flex-row py-[10px] justify-end"
          : "flex-row py-[10px] justify-start"
      }
    >
      {/* {!isOwn && <Avatar avatar={userInfo.avatar} />} */}
      {!isOwn && (
        <TouchableOpacity onPress={onAvatarPressed}>
          <View className=" w-[45px] h-[45px]">
            <Avatar
              tag={senderUserInfo?.tag}
              name={senderUserInfo?.name}
              avatar={senderUserInfo?.avatar}
              size={{ w: 45, h: 45, font: 20 }}
            />
          </View>
        </TouchableOpacity>
      )}

      <View className={isOwn ? "flex items-end" : "flex items-start"}>
        <View
          className={
            isOwn
              ? "flex-row items-end justify-end pr-[1px]"
              : "flex-row items-end justify-start"
          }
        >
          <Text
            className={isOwn ? "text-white mr-[10px]" : "text-white ml-[10px]"}
            style={{ fontSize: fontSize }}
          >
            {senderUserInfo?.name}
          </Text>
        </View>
        <Pressable onLongPress={onContentLongPressed}>
          <View className="flex flex-row">
            {!isOwn && <View style={{
              width: 0,
              height: 0,
              marginTop: 7,
              borderTopWidth: 6,
              borderTopColor: 'transparent',
              borderRightWidth: 6,
              borderRightColor: '#445465',
              borderLeftWidth: 3,
              borderLeftColor: 'transparent',
              borderBottomWidth: 6,
              borderBottomColor: 'transparent',
            }} />}
            <View
              className={
                isOwn
                  ? "flex-row justify-center pr-[30vw] bg-[#5EB857] px-2 py-2 rounded"
                  : "flex-row justify-center pl-[30vw] bg-[#445465] px-2 py-2 rounded"
              }
              style={{ position: "relative" }}
            >
              <Text
                className={
                  isOwn ? "text-black max-w-[50vw]" : "text-white max-w-[52vw]"
                }
                style={{ fontSize: fontSize }}
              >
                {msg.message}
              </Text>
              {message?.status === Constants.deliveryState.delivering && (
                <ActivityIndicator
                  className={isOwn ? "pr-[10px]" : "pl-[10px]"}
                  size={"small"}
                  color={"#8D8D8D"}
                />
              )}
            </View>
            {isOwn && <View style={{
              width: 0,
              height: 0,
              marginTop: 7,
              borderTopWidth: 6,
              borderTopColor: 'transparent',
              borderRightWidth: 3,
              borderRightColor: 'transparent',
              borderLeftWidth: 6,
              borderLeftColor: '#5EB857',
              borderBottomWidth: 6,
              borderBottomColor: 'transparent',
            }} />}
          </View>
        </Pressable>
        {msg.quote != null && msg.quote.length > 0 ?
          <View className={ //#202A32
            isOwn
              ? "mr-[10px] mt-1 rounded bg-[#1D2730] max-w-[52vw] p-2"
              : "ml-[10px] mt-1 rounded bg-[#1D2730] max-w-[52vw] p-2"
          }>
            <Text className="text-clr-gray-light">{msg.quote}</Text>
          </View> : <></>}
        {/* {menuVisible && <BubbleMenu />} */}
      </View>

      {/* {isOwn && <Avatar avatar={userInfo.avatar} />} */}
      {isOwn && (
        <TouchableOpacity onPress={onAvatarPressed}>
          <View className=" w-[45px] h-[45px]">
            <Avatar
              tag={senderUserInfo?.tag}
              name={senderUserInfo?.name}
              avatar={senderUserInfo?.avatar}
              size={{ w: 45, h: 45, font: 20 }}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const ChatBubbleV2 = React.memo(
  ({ message, preMessage, onAvatarPressed, onContentLongPressed }) => {
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
            onAvatarPressed={() => {
              onAvatarPressed?.call(this, senderUserInfo);
            }}
            onContentLongPressed={() => {
              onContentLongPressed?.call(this, senderUserInfo, message);
            }}
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
