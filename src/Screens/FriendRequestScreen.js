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

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "GET__NOTIFICATIONS":
      return action.payload;
    case "UPDATE_NOTIFICATIONS":
      console.log("noti state: ", state);
      const notification = action.payload;
      // 用户点击accept以后也需要从列表里移除
      // if (
      //   notification.state ===
      //   (LesConstants.IMNotificationState.Rejected ||
      //     LesConstants.IMNotificationState.Canceled)
      // ) {
      //   return state.filter((item) => item.id !== notification.id);
      // }
      // return DataCenter.notifications.getAllNotifications();
      return state.filter((item) => item.id !== notification.id);
  }
};

export default function FriendRequestScreen() {
  const [notifications, dispatchNotifications] = useReducer(
    notificationReducer,
    []
  );

  useEffect(() => {
    // 挂载时获取所有推送信息
    // const allNotifications = DataCenter.notifications.getAllNotifications();
    let friendInvitations = DataCenter.notifications.getAllNotifications(
      LesConstants.IMNotificationType.FriendInvitation
    );
    // const invitations = allNotifications.filter(
    //   (item) =>
    //     item.type !== 0 &&
    //     item.mode === Constants.Notification.NotificationMode.Recipient
    // );
    friendInvitations = friendInvitations.filter(
      (item) => item.mode === Constants.Notification.NotificationMode.Recipient
    );
    dispatchNotifications({
      type: "GET__NOTIFICATIONS",
      payload: friendInvitations,
    });

    const onNotiUpdatedHandler = (notification) => {
      if (notification.type !== 0) {
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
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        onNotiUpdatedHandler
      );
    };
  }, []);

  // useEffect(() => {}, [selectedTab]);

  return (
    <View className="flex-1 mx-[5vw]">
      <View className="mt-[20px]">
        <FlatList
          data={notifications}
          renderItem={({ item }) => <InvitationList item={item} />}
          // renderItem={({ item }) => console.log(item)}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}
