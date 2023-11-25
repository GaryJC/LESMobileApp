import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import { StateIndicator } from "./StateIndicator";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import Constants from "../modules/Constants";
import { AppInfoMap } from "../modules/AppInfo";
import { LesConstants } from "les-im-components";
import DataCenter from "../modules/DataCenter";
import { MessageCaches } from "../Models/MessageCaches";

const { IMUserState } = LesConstants;

export const FriendList = ({ friend, button, hasTag, onAvatarPressed }) => {
  // const avatar = `https://i.pravatar.cc/?img=${friend.id}`;

  // const navigation = useNavigation();
  // console.log("ppp: ");

  const [selectedFriend, setSelectedFriend] = useState();

  // friend bottom sheet visible state
  //const [visible, setVisible] = useState(false);

  // const onClosed = () => {
  //   setVisible(false);
  // };

  const onOpen = () => {
    // setVisible(true);
    onAvatarPressed?.call(this, friend);
    JSEvent.emit(UIEvents.Friend.PopupFriendBottomSheet, { friendInfo: friend });
  };

  return (
    <View>
      <View className="flex-row justify-between mb-[10px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onOpen}>
            <View className="flex-row">
              <View className="relative">
                <View className="w-[55px] h-[55px] mr-[10px]">
                  <Avatar
                    tag={friend.tag}
                    name={friend.name}
                    avatar={friend.avatar}
                  >
                    <View className="absolute right-0 bottom-0">
                      <StateIndicator
                        state={friend.state}
                        onlineState={friend.onlineState}
                        bgColor={"#080F14"}
                      />
                    </View>
                  </Avatar>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white text-[20px] font-bold">
                  {friend.name}
                </Text>
                {hasTag && (
                  <Text className="text-white text-[14px]"> #{friend.tag}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
        {button}
      </View>
    </View>
  );
};

const GameStateIcon = ({ user }) => {
  if (user == null) return null;

  const gameState = AppInfoMap.getGameState(user.gameState, user.state);
  if (gameState.state == null) return null;

  let gameDom = null;
  if (gameState.playingGame) {
    const icon = Constants.Icons.getSystemIcon(gameState.icon, null);
    if (icon != null) {
      gameDom = <Image source={icon} className="w-[45px] h-[45px] rounded-full " />
    }
  }

  return <View className="flex justify-center p-[2px] rounded-full w-[49px] h-[49px]" style={{ backgroundColor: gameState.iconBorder }}>
    {gameDom}
  </View>
}

export const FriendListItemWithGameState = ({ friend, subTitle, hasTag, onAvatarPressed, onNamePressed }) => {
  const [chatId, setChatId] = useState([]);

  const onChatUpdated = (p) => {
    const chatId = MessageCaches.MakeChatID(
      friend?.id,
      DataCenter.userInfo.accountId
    );
    if (p == null || p.chatId == chatId) setChatId([chatId]);
  }

  useEffect(() => {
    onChatUpdated();
    var unsub = JSEvent.on(UIEvents.Message.Message_Chat_Updated, onChatUpdated);
    return () => {
      unsub();
    }
  }, [])

  const onOpen = () => {
    // setVisible(true);
    onAvatarPressed?.call(this, friend);
    JSEvent.emit(UIEvents.Friend.PopupFriendBottomSheet, { friendInfo: friend });
  };

  const namePressed = () => {
    onNamePressed?.call(this, friend);
    setChatId([chatId])
  }

  const gameState = AppInfoMap.getGameState(friend?.gameState ?? 0, friend?.state ?? 0);
  const chatListItem = DataCenter.messageCache.getChatListItem(chatId[0]);
  const unreadCount = chatListItem?.newMessageCount ?? 0;

  return (
    <View>
      <View className="flex-row justify-between mb-[10px]">
        <View className="flex-row items-center flex-1">
          <View className="flex-row">
            <View className="w-[55px] h-[55px] mr-[10px]">
              <TouchableOpacity onPress={onOpen}>
                <Avatar
                  tag={friend.tag}
                  name={friend.name}
                  avatar={friend.avatar}
                >
                  <View className="absolute right-0 bottom-0">
                    <StateIndicator
                      state={friend.state}
                      onlineState={friend.onlineState}
                      bgColor={"#080F14"}
                    />
                  </View>
                  {unreadCount != null && unreadCount != 0 && (
                    <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full absolute top-[-5px] right-[-5px]  flex justify-center items-center">
                      <Text className="font-bold text-white text-xs">{unreadCount}</Text>
                    </View>
                  )}
                </Avatar>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={namePressed} className="flex-1 mr-3">
              <View className="flex-col flex-1">
                <View className="flex-row items-start my-1">
                  <Text className="text-white text-[20px] font-bold" numberOfLines={1}>
                    {friend.name}
                  </Text>
                  {hasTag && (
                    <Text className="text-white text-[14px]"> #{friend.tag}</Text>
                  )}
                </View>
                <Text className="text-gray-200 text-sm" numberOfLines={1}>{gameState.playingGame ? gameState.state : chatListItem?.latestMessage}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <GameStateIcon user={friend} />
      </View>
    </View>
  );
}