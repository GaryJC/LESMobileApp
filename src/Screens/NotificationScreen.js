import { useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Notifications } from "../Models/Notifications";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import DataCenter from "../modules/DataCenter";
import { LesConstants } from "les-im-components";
import Constants from "../modules/Constants";
import NotificationList from "../Components/NotificationList";
import InvitationList from "../Components/InvitationList";

const notificationTab = Constants.Notification.NotificationTab;

const notificationReducer = (state, action) => {
  console.log(console.log("noti state: ", state, action));
  switch (action.type) {
    case "GET_NOTIFICATIONS":
      return action.payload;
    // case "ADD_NOTIFICATIONS":
    //   return [...state, action.payload];
    case "UPDATE_NOTIFICATIONS":
      const notification = action.payload;
      // 用户点击accept以后也需要从列表里移除
      if (
        notification.state ===
        (LesConstants.IMNotificationState.Rejected ||
          LesConstants.IMNotificationState.Canceled)
      ) {
        return state.filter((item) => item.id !== notification.id);
      }
      // const isExisted = state.find((item) => item.id === notification.id);
      // console.log("is existed? ", isExisted);
      // return isExisted
      //   ? state.map((item) =>
      //       item.id === notification.id ? notification : item
      //     )
      //   : [...state, notification];
      return DataCenter.notifications.getAllNotifications();
  }
};

export default function Notification() {
  const [selectedTab, setSelectedTab] = useState(
    Constants.Notification.NotificationTab.Notifications
  );

  // const [noticiations, setNotifications] = useState([]);
  const [notifications, dispatchNotifications] = useReducer(
    notificationReducer,
    []
  );

  const [unreadCount, setUnreadCount] = useState({
    notiCount: 0,
    invitCount: 0,
  });

  const switchTab = (tab) => {
    console.log(
      "switch tab: ",
      tab,
      selectedTab,
      notificationTab.Notifications
    );
    if (tab !== selectedTab) {
      setSelectedTab(tab);
      const allNotifications = DataCenter.notifications.getAllNotifications();
      tab === notificationTab.Notifications
        ? dispatchNotifications({
            type: "GET_NOTIFICATIONS",
            payload: allNotifications.filter((item) => item.type === 0),
          })
        : dispatchNotifications({
            type: "GET_NOTIFICATIONS",
            payload: allNotifications.filter((item) => item.type !== 0),
          });
    }
  };

  useEffect(() => {
    // 挂载时获取所有推送信息
    // 默认选项是推送（不包括邀请）
    const allNotifications = DataCenter.notifications.getAllNotifications();
    dispatchNotifications({
      type: "GET_NOTIFICATIONS",
      payload: allNotifications.filter((item) => item.type === 0),
    });
    console.log("all noticiations: ", allNotifications);

    const updateUnreadCountHandler = () => {
      const notiCount = DataCenter.notifications.unreadCount(0);
      const friendInvitCount = DataCenter.notifications.unreadCount(1);
      const groupInviteCount = DataCenter.notifications.unreadCount(2);
      setUnreadCount({
        notiCount: notiCount,
        invitCount: friendInvitCount + groupInviteCount,
      });
    };

    updateUnreadCountHandler();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );

    return () => {
      JSEvent.remove(DataEvents.Notification.NotificationState_Updated);
    };
  }, []);

  useEffect(() => {
    const onNotiUpdatedHandler = (notification) => {
      console.log("updated noti: ", notification);
      const curType =
        notification.type == 0
          ? notificationTab.Notifications
          : notificationTab.Invitations;
      if (curType === selectedTab) {
        dispatchNotifications({
          type: "UPDATE_NOTIFICATIONS",
          payload: notification,
        });
      }
    };

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      onNotiUpdatedHandler
    );
    return () => {
      JSEvent.remove(DataEvents.Notification.NotificationState_Updated);
    };
  }, [selectedTab]);
  // useEffect(() => {}, [selectedTab]);

  return (
    <View className="flex-1 mx-[5vw]">
      <View className="flex-row justify-between bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TouchableOpacity
          className="flex-1"
          onPress={() => switchTab(notificationTab.Notifications)}
        >
          <View
            className={
              selectedTab === notificationTab.Notifications
                ? "h-[100%] rounded-lg bg-[#535F6A] justify-center"
                : ""
            }
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-center">
                Notifications
              </Text>
              {unreadCount.notiCount !== 0 && (
                <View className="w-[10px] h-[10px] ml-[10px] bg-[#FF3737] rounded-full"></View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1"
          onPress={() => switchTab(notificationTab.Invitations)}
        >
          <View
            className={
              selectedTab === notificationTab.Invitations
                ? "h-[100%] rounded-lg bg-[#535F6A] justify-center"
                : ""
            }
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-center">
                Invitations
              </Text>
              {unreadCount.invitCount !== 0 && (
                <View className="w-[10px] h-[10px] ml-[5px] bg-[#FF3737] rounded-full"></View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View className="mt-[20px]">
        <FlatList
          data={notifications}
          renderItem={
            selectedTab === notificationTab.Notifications
              ? ({ item }) => <NotificationList item={item} />
              : ({ item }) => <InvitationList item={item} />
          }
          // renderItem={({ item }) => console.log(item)}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}
