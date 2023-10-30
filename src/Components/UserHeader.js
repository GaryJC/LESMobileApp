import { useEffect, useState } from "react";
import DataCenter from "../modules/DataCenter";
import { DataEvents, UIEvents } from "../modules/Events";
import Avatar from "./Avatar";
import { Pressable, Text, View } from "react-native";
import { StateIndicator, makeStateReadable } from "./StateIndicator";
import { LesConstants } from "les-im-components";
import JSEvent from "../utils/JSEvent";
import { Ionicons } from "@expo/vector-icons";

const UserHeader = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: "",
    accountId: "",
    state: "",
    onlineState: "",
    tag: "",
    avatar: "",
  });

  const updateUnreadCountHandler = () => {
    const count = DataCenter.notifications?.unreadCount();
    setUnreadCount(count);
  };

  const setUserHandler = () => {
    setUserInfo((pre) => {
      return {
        ...pre,
        name: DataCenter.userInfo.imUserInfo.name,
        accountId: DataCenter.userInfo.accountId,
        tag: DataCenter.userInfo.imUserInfo.tag,
        avatar: DataCenter.userInfo.imUserInfo.avatar,
        state: DataCenter.userInfo.imUserInfo.state,
        onlineState: DataCenter.userInfo.imUserInfo.onlineState,
      };
    });
  };

  useEffect(() => {
    setUserHandler();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, setUserHandler);
    JSEvent.on(DataEvents.User.UserInfo_Current_Updated, setUserHandler);
    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateUnreadCountHandler
      );
      JSEvent.remove(DataEvents.User.UserState_IsLoggedin, setUserHandler);
      JSEvent.remove(DataEvents.User.UserInfo_Current_Updated, setUserHandler);
    };
  }, []);

  const stateStr = makeStateReadable(userInfo.state);

  return (
    <Pressable
      className="flex flex-row justify-start items-center "
      onPress={() => {
        JSEvent.emit(UIEvents.Drawer.Drawer_Open);
      }}
    >
      <Avatar
        tag={userInfo.tag}
        name={userInfo.name}
        avatar={userInfo.avatar}
        size={{ w: 40, h: 40, font: 18 }}
      >
        <View className="absolute right-[-3px] bottom-[-3px]">
          <StateIndicator
            state={userInfo.state}
            onlineState={userInfo.onlineState}
            bgColor={"#080F14"}
            size={16}
          />
        </View>
        {unreadCount !== 0 && (
          <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full absolute top-[-5px] right-[-5px]  flex justify-center items-center">
            <Text className="font-bold text-white text-xs">{unreadCount}</Text>
          </View>
        )}
      </Avatar>
      <View className="flex justify-center items-start pl-[6px]">
        <Text
          className="text-white font-extrabold text-lg"
          style={{ lineHeight: 24 }}
        >
          {userInfo.name}
        </Text>
        <View className="flex flex-row items-center justify-center">
          <Text className="text-white text-sm" style={{ lineHeight: 14 }}>
            {stateStr}
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            color="white"
            size={16}
          ></Ionicons>
        </View>
      </View>
    </Pressable>
  );
};

export default UserHeader;
