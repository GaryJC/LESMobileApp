import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableHighlight,
} from "react-native";
import { useRef, useCallback, useMemo, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MessageCaches } from "../Models/MessageCaches";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import FriendService from "../services/FriendService";

export default function FriendBottomSheet({
  isSheetOpen,
  setIsSheetOpen,
  selectedFriend,
}) {
  const snapPoints = useMemo(() => ["70%", "60%"]);
  const bottomSheetRef = useRef(null);
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
    setIsSheetOpen(false);
  }, []);

  const goChatHandler = () => {
    navigation.navigate("Chats");
    const chatId = MessageCaches.MakeChatID(
      selectedFriend.id,
      DataCenter.userInfo.accountId
    );
    console.log("go to chat id: ", chatId, selectedFriend.id);
    JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
      chatId: chatId,
      targetId: selectedFriend.id,
    });
  };

  /**
   * 删除好友时调用
   */
  const removeFriendHandler = () => {
    console.log("delete");
    // JSEvent.emit(UIEvents.User.UserState_UIRefresh);
    FriendService.Inst.removeFriend(selectedFriend.id)
      .then((res) => {
        console.log("delete friend success! ", res);
        // 刷新好友列表
        JSEvent.emit(UIEvents.User.UserState_UIRefresh);
        const chatId = MessageCaches.MakeChatID(
          selectedFriend.id,
          DataCenter.userInfo.accountId
        );
        // 移除缓存中对应的聊天列表
        DataCenter.messageCache.removeChatListItem(chatId);
        // 刷新好友列表
        JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated, {
          chatId: chatId,
          action: "delete",
        });
        setIsSheetOpen(false);
      })
      .catch((e) => {
        console.log("移除好友", recipientId, "失败, code:", code.toString(16));
      });
  };

  useEffect(() => {
    if (isSheetOpen) {
      bottomSheetRef.current?.expand(); // this will snap to the maximum provided point
    } else {
      bottomSheetRef.current?.close(); // this will slide down the sheet
    }
  }, [isSheetOpen]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // 0 refers to the first snap point ('25%')
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      onClose={handleSheetEnd}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#262F38" }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      //   handleStyle={{ opacity: 0 }}
    >
      <View>
        <ImageBackground
          source={require("../../assets/img/userBg.jpg")}
          className="h-[25vh] items-center relative"
        >
          <Image
            source={{
              uri: `https://i.pravatar.cc/?img=${selectedFriend?.id}`,
            }}
            className="w-[100px] h-[100px] rounded-full absolute bottom-[-50px] left-[25px]"
          />
        </ImageBackground>
      </View>
      <View className="mt-[55px] ml-[20px] flex-row items-end">
        <Text className="text-white font-bold text-[18px]">
          {selectedFriend?.name}
        </Text>
        <Text className="text-white font-bold pl-[5px]">
          #{selectedFriend?.id}
        </Text>
      </View>
      <View className="flex-row justify-between mt-[10px] mx-[5%]">
        <TouchableHighlight
          onPress={goChatHandler}
          className="w-[45%] h-[80px] rounded-lg overflow-hidden"
        >
          <View className="bg-[#131F2A] items-center justify-center w-[100%] h-[100%]">
            <Ionicons name="chatbox-ellipses-outline" size={30} color="white" />
            <Text className="text-white font-bold text-[15px]">Chat</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => console.log("yes")}
          className="w-[45%] h-[80px] rounded-lg overflow-hidden"
        >
          <View className="bg-[#131F2A] w-[100%] h-[100%] items-center justify-center">
            <MaterialIcons name="group-add" size={32} color="white" />
            <Text className="text-white font-bold text-[15px]">
              Invite to chat
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      <TouchableHighlight
        className="mt-[20px] mx-[5%] rounded-lg overflow-hidden"
        onPress={removeFriendHandler}
      >
        <View className="bg-[#131F2A] h-[35px] justify-center">
          <Text className="text-[#FF0000] font-bold text-center">Delete</Text>
        </View>
      </TouchableHighlight>
    </BottomSheet>
  );
}
