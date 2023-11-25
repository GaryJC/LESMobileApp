import { useEffect, useState } from "react";
import {
  FlatList,
  View
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { LesConstants } from "les-im-components";
import SocialListChatButton from "../../Components/SocialListChatButton";
import { MessageCaches } from "../../Models/MessageCaches";
import DataCenter from "../../modules/DataCenter";
import { DataEvents, UIEvents } from "../../modules/Events";
import FriendService from "../../services/FriendService";
import JSEvent from "../../utils/JSEvent";
import { FriendListItemWithGameState } from "../FriendList";

const { IMMessageType } = LesConstants;
/*
const RecommendedFriend = (id, name, avatar) => (
  <View className="flex-row justify-between mb-[10px]">
    <View className="flex-row items-center">
      <View className="w-[55px] h-[55px] rounded-full overflow-hidden mr-[10px]">
        <ImageBackground
          source={{ uri: avatar }}
          className="w-[100%] h-[100%]"
        />
      </View>
      <Text className="text-white text-[20px] font-bold">{name}</Text>
    </View>
    <View className="flex-row items-center">
      <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center mr-[10px]">
        <Ionicons name="close" color={"white"} size={24} />
      </View>
      <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center">
        <Ionicons name="add-outline" color={"white"} size={24} />
      </View>
    </View>
  </View>
);
*/

export default function SocialFriend() {
  const [friendsData, setFriendsData] = useState(null);

  // 可传参数 { id, state, onlineState }
  const onFriendStateUIUpdated = async () => {
    // const offline = FriendService.Inst.getFriendList((f) => f.onlineState.online);
    // const offline = FriendService.Inst.getFriendList((f) => f.onlineState.Offline);

    const friendList = await FriendService.Inst.getFriendList();
    console.log("friend list: ", friendList);
    const online = friendList
      // .filter(
      //   (item) =>
      //     item.onlineState === LesConstants.IMUserOnlineState.Online &&
      //     item.state !== LesConstants.IMUserState.Hiding
      // )
      .sort((a, b) => a.name.localeCompare(b.name, { sensitivity: "base" }));
    // const offline = friendList
    //   .filter(
    //     (item) =>
    //       item.onlineState !== LesConstants.IMUserOnlineState.Online ||
    //       item.state === LesConstants.IMUserState.Hiding
    //   )
    //   .sort((a, b) => a.name.localeCompare(b.name, { sensitivity: "base" }));
    // setFriendsData([
    //   // { title: "Recommended Friends", data: [] },
    //   { title: "Online", data: online },
    //   { title: "Offline", data: offline },
    // ]);
    setFriendsData(online);
  };

  const nav = useNavigation();
  useEffect(() => {
    const initFriendScreen = () => {
      onFriendStateUIUpdated();
    };

    initFriendScreen();

    JSEvent.on(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, initFriendScreen);

    return () => {
      JSEvent.remove(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);
      JSEvent.remove(DataEvents.User.UserState_IsLoggedin, initFriendScreen);
    };
  }, []);

  return (
    <View className="flex-1">
      {/* <Text className="text-white font-bold text-[24px] my-[10px]">
          Friends
        </Text> */}
      {/* <SectionList
            stickySectionHeadersEnabled={false}
            sections={friendsData}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item, section }) =>
              section.title === "Recommended Friends" ? (
                <RecomFriendsData
                  id={item.id}
                  name={item.name}
                  state={item.state}
                  avatar={item.avatar}
                />
              ) : (
                <FriendList
                  friend={item}
                  button={<FriendListChatButton friend={item} />}
                />
              )
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-white font-bold text-[24px] my-[10px]">
                {title}
              </Text>
            )}
          /> */}
      <FlatList
        data={friendsData}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item }) => (
          <FriendListItemWithGameState
            friend={item}
            button={<SocialListChatButton item={item}
            />}
            onNamePressed={item => {
              gotoChat(nav, item.id);
            }}
          />
        )}
      />
    </View>
  );
}


/**
 * 
 * @param {Navigation} navigation 
 * @param {number} targetId 
 * @param {IMMessageType} type 
 */
const gotoChat = (navigation, targetId, type = IMMessageType.Single) => {
  const chatId = MessageCaches.MakeChatID(
    DataCenter.userInfo.accountId,
    targetId,
    type
  );
  const chatListItem = DataCenter.messageCache.getChatListItem(chatId);
  // DataCenter.messageCache.setCurChatListItem(chatListItem);
  navigation.navigate("Chats");
  // JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated, chatId);
  DataCenter.messageCache.touchChatData(chatId);
  JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
    // chatId: chatId,
    // targetId: friend?.id,
    chatListItem,
  });
}