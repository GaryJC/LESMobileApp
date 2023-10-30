import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableHighlight,
} from "react-native";
import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MessageCaches } from "../Models/MessageCaches";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import FriendService from "../services/FriendService";
import Avatar from "./Avatar";
import DatabaseService from "../services/DatabaseService";
import UserBottomSheetHeader from "./UserBottomSheetHeader";
import CommonBottomSheetModal from "./CommonBottomSheetModal";

export default function FriendBottomSheet({
  bottomSheetModalRef,
  selectedFriend,
  onClosed,
  visible,
}) {
  const [isFriend, setIsFriend] = useState(false);
  console.log("selected friend: ", selectedFriend);

  console.log("bbb: ", visible);

  useEffect(() => {
    const checkIsFriend = async () => {
      let friendList = await FriendService.Inst.getFriendList();
      friendList = friendList.map((item) => item.id);
      if (friendList.includes(selectedFriend?.id)) {
        setIsFriend(true);
      } else {
        setIsFriend(false);
      }
    };
    checkIsFriend();
  }, [selectedFriend]);

  // const snapPoints = useMemo(() => ["60%", "50%"]);
  const snapPoints = useMemo(() => ["60%", "80%"]);
  // const bottomSheetRef = useRef(null);
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );
  const navigation = useNavigation();

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleSheetEnd = useCallback(() => {
    console.log("The bottom sheet is now closed");
  }, []);

  const goChatHandler = () => {
    // bottomSheetModalRef.current?.close();
    onClosed();
    const chatId = MessageCaches.MakeChatID(
      selectedFriend?.id,
      DataCenter.userInfo.accountId
    );
    // console.log("go to chat id: ", chatId, selectedFriend.id);
    const chatListItem = DataCenter.messageCache.getChatListItem(chatId);
    // DataCenter.messageCache.setCurChatListItem(chatListItem);
    navigation.navigate("Chats", { chatListItem: chatListItem });
    JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
      // chatId: chatId,
      // targetId: friend?.id,
      chatListItem,
    });
  };

  /**
   * 删除好友时调用
   */
  const removeFriendHandler = () => {
    // JSEvent.emit(UIEvents.User.UserState_UIRefresh);
    FriendService.Inst.removeFriend(selectedFriend?.id)
      .then((res) => {
        console.log("delete friend success! ", res);
        // 刷新好友列表
        JSEvent.emit(UIEvents.User.UserState_UIRefresh);
        const chatId = MessageCaches.MakeChatID(
          selectedFriend?.id,
          DataCenter.userInfo.accountId
        );
        // 移除缓存中对应的聊天列表
        DataCenter.messageCache.removeChatListItem(chatId);
        JSEvent.emit(UIEvents.Message.Message_Chat_List_Removed, chatId);
        //setIsSheetOpen(false);
      })
      .catch((e) => {
        console.log("移除好友失败, code:", e);
      });
  };

  // useEffect(() => {
  //   if (isSheetOpen) {
  //     bottomSheetRef.current?.expand(); // this will snap to the maximum provided point
  //   } else {
  //     bottomSheetRef.current?.close(); // this will slide down the sheet
  //   }
  // }, [isSheetOpen]);

  const BottomSheetButton = ({ handler, children, title }) => (
    <TouchableHighlight
      onPress={handler}
      className="flex-1 h-[80px] rounded-lg overflow-hidden"
    >
      <View className="bg-[#131F2A] items-center justify-center w-[100%] h-[100%]">
        {children}
        <Text className="text-white font-bold text-[15px]">{title}</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    // <BottomSheetModal
    //   ref={bottomSheetModalRef}
    //   index={1}
    //   snapPoints={snapPoints}
    //   onChange={handleSheetChanges}
    //   enablePanDownToClose={true}
    //   backdropComponent={renderBackdrop}
    //   backgroundStyle={{ backgroundColor: "#262F38" }}
    //   handleIndicatorStyle={{ backgroundColor: "white" }}
    // >
    <CommonBottomSheetModal
      visible={visible}
      snapPoints={snapPoints}
      index={0}
      onClosed={onClosed}
    >
      <View className="flex-1">
        {/* <View>
          <ImageBackground
            source={require("../../assets/img/userBg.jpg")}
            className="h-[25vh] items-center relative"
          >
            <View className="w-[100px] h-[100px] absolute bottom-[-75px] left-[5vw]">
              <Avatar tag={selectedFriend?.tag} name={selectedFriend?.name} />
            </View>
          </ImageBackground>
        </View>
        <View className="mt-[55px] ml-[5vw] flex-row items-end">
          <Text className="text-white font-bold text-[18px]">
            {selectedFriend?.name}
          </Text>
          <Text className="text-white font-bold pl-[5px]">
            #{selectedFriend?.tag}
          </Text>
        </View> */}
        <UserBottomSheetHeader user={selectedFriend} isOwn={false} />
        {isFriend && (
          <>
            <View className="flex-row justify-between mt-[10px] mx-[5vw]">
              <BottomSheetButton handler={goChatHandler} title={"Chat"}>
                {
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={30}
                    color="white"
                  />
                }
              </BottomSheetButton>
              {/* <TouchableHighlight
            onPress={() => console.log("yes")}
            className="flex-1 h-[80px] rounded-lg overflow-hidden"
          >
            <View className="bg-[#131F2A] w-[100%] h-[100%] items-center justify-center">
              <MaterialIcons name="group-add" size={32} color="white" />
              <Text className="text-white font-bold text-[15px]">
                Invite to chat
              </Text>
            </View>
          </TouchableHighlight> */}
            </View>
            <TouchableHighlight
              className="mt-[5vh] mx-[5%] rounded-lg overflow-hidden"
              onPress={removeFriendHandler}
            >
              <View className="bg-[#131F2A] h-[35px] justify-center">
                <Text className="text-[#FF0000] font-bold text-center">
                  Remove Friend
                </Text>
              </View>
            </TouchableHighlight>
          </>
        )}
      </View>
    </CommonBottomSheetModal>
    // </BottomSheetModal>
  );
}
