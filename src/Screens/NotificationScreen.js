import { useEffect, useReducer, useState, useCallback } from "react";
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
import GroupSelfSentInviteList from "../Components/GroupSelfSentInviteList";
import TabButton from "../Components/TabButton";
import Divider from "../Components/Divider";

const NotificationType = Constants.Notification.NotificationType;
const NotificationMode = Constants.Notification.NotificationMode;

const notificationReducer = (state, action) => {
  console.log(console.log("noti state: ", state, action));
  switch (action.type) {
    case "GET_NOTIFICATIONS":
      return action.payload;
    case "UPDATE_NOTIFICATIONS":
      const notification = action.payload;
      // 用户点击accept以后也需要从列表里移除
      // if (
      //   notification.state ===
      //   (LesConstants.IMNotificationState.Rejected ||
      //     LesConstants.IMNotificationState.Canceled)
      // ) {

      const isExisted = state.find((item) => item.id === notification.id);
      return isExisted
        ? state.filter((item) => item.id !== notification.id)
        : [...state, notification];
    // }
  }
};

export default function NotificationScreen() {
  const [selectedTab, setSelectedTab] = useState(NotificationType.Invitations);

  // const [noticiations, setNotifications] = useState([]);
  const [notifications, dispatchNotifications] = useReducer(
    notificationReducer,
    []
  );

  const [unreadCount, setUnreadCount] = useState({
    notiCount: 0,
    invitCount: 0,
  });

  const getSelfSent = () => {
    const allNotifications = DataCenter.notifications.getAllNotifications();
    const { selfSentGroupInvits, selfSentFriendInvits } =
      allNotifications.reduce(
        (acc, item) => {
          if (
            item.type === LesConstants.IMNotificationType.GroupInvitation &&
            item.mode === NotificationMode.Sender
          ) {
            const groupId = item.groupInfo.id;
            if (!acc.selfSentGroupInvits[groupId]) {
              acc.selfSentGroupInvits[groupId] = {
                id: groupId,
                data: [item],
                type: LesConstants.IMNotificationType.GroupInvitation,
                mode: NotificationMode.SelfSentGroup,
              };
            } else {
              acc.selfSentGroupInvits[groupId].data.push(item);
            }
          } else if (
            item.type === LesConstants.IMNotificationType.FriendInvitation &&
            item.mode === NotificationMode.Sender
          ) {
            acc.selfSentFriendInvits.push(item);
          }
          return acc;
        },
        { selfSentGroupInvits: {}, selfSentFriendInvits: [] }
      );
    const selfSentNotifications = [
      ...selfSentFriendInvits,
      ...Object.values(selfSentGroupInvits),
    ];
    console.log("self sent notifs ", selfSentNotifications);
    dispatchNotifications({
      type: "GET_NOTIFICATIONS",
      payload: selfSentNotifications,
    });
  };

  const switchTabHandler = useCallback(
    (tab) => {
      if (tab !== selectedTab) {
        setSelectedTab(tab);
        if (tab === NotificationType.Notifications) {
          dispatchNotifications({
            type: "GET_NOTIFICATIONS",
            payload: DataCenter.notifications.getAllNotifications(
              LesConstants.IMNotificationType.Notification
            ),
          });
        } else if (tab === NotificationType.Invitations) {
          const invitations = DataCenter.notifications
            .getAllNotifications()
            .filter(
              (item) =>
                item.mode === NotificationMode.Recipient &&
                item.type !== LesConstants.IMNotificationType.Notification
            );
          dispatchNotifications({
            type: "GET_NOTIFICATIONS",
            payload: invitations,
          });
        } else {
          getSelfSent();
        }
      }
    },
    [selectedTab]
  );

  useEffect(() => {
    // 挂载时获取所有推送信息
    // 默认选项是推送（不包括邀请）
    const notifications = DataCenter.notifications.getAllNotifications();

    dispatchNotifications({
      type: "GET_NOTIFICATIONS",
      payload: notifications.filter(
        (item) =>
          item.mode === NotificationMode.Recipient &&
          item.type !== LesConstants.IMNotificationType.Notification
      ),
    });
    console.log("all noticiations: ", notifications);

    const updateUnreadCountHandler = () => {
      const notiCount = DataCenter.notifications.unreadCount(
        LesConstants.IMNotificationType.Notification
      );
      const friendInvitCount = DataCenter.notifications.unreadCount(
        LesConstants.IMNotificationType.FriendInvitation
      );
      const groupInviteCount = DataCenter.notifications.unreadCount(
        LesConstants.IMNotificationType.GroupInvitation
      );

      // setUnreadCount({
      //   NotificationT : notiCount,
      //   invitCount: friendInvitCount + groupInviteCount,
      // });
      setUnreadCount((pre) => ({
        ...pre,
        [NotificationType.Notifications]: notiCount,
        [NotificationType.Invitations]: friendInvitCount + groupInviteCount,
        [NotificationType.SelfSent]: 0,
      }));
    };

    updateUnreadCountHandler();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );

    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateUnreadCountHandler
      );
    };
  }, []);

  useEffect(() => {
    const onNotiUpdatedHandler = (notification) => {
      console.log("updated noti: ", notification);
      // const curType =
      //   notification.type == LesConstants.IMNotificationType.Notification
      //     ? NotificationType.Notifications
      //     : NotificationType.Invitations;
      let curType;
      if (notification.mode == NotificationMode.Sender) {
        curType = NotificationType.SelfSent;
      } else if (
        notification.type == LesConstants.IMNotificationType.Notification
      ) {
        curType = NotificationType.Notifications;
      } else {
        curType = NotificationType.Invitations;
      }

      if (curType === selectedTab) {
        if (selectedTab === NotificationType.SelfSent) {
          getSelfSent();
        } else {
          dispatchNotifications({
            type: "UPDATE_NOTIFICATIONS",
            payload: notification,
          });
        }
      }
    };

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      onNotiUpdatedHandler
    );
    return () =>
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        onNotiUpdatedHandler
      );
  }, [selectedTab]);
  // useEffect(() => {}, [selectedTab]);

  /*
  const TabButton = ({ type, title, handler }) => (
    <TouchableOpacity className="flex-1" onPress={() => handler(type)}>
      <View
        className={
          selectedTab === type
            ? "h-[100%] rounded-lg bg-[#535F6A] justify-center"
            : ""
        }
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-white font-bold text-center">{title}</Text>
          {unreadCount[type] !== 0 && (
            <View className="w-[10px] h-[10px] ml-[10px] bg-[#FF3737] rounded-full"></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  */

  const UnreadIndicator = () => (
    <View className="w-[10px] h-[10px] ml-[10px] bg-[#FF3737] rounded-full" />
  );

  return (
    <View className="flex-1 mx-[5vw]">
      <View className="flex-row justify-between bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TabButton
          type={NotificationType.Invitations}
          selectedTab={selectedTab}
          title="Invitations"
          handler={switchTabHandler}
        >
          {unreadCount[NotificationType.Invitations] !== 0 && (
            <UnreadIndicator />
          )}
        </TabButton>
        <TabButton
          type={NotificationType.Notifications}
          selectedTab={selectedTab}
          title="Notifications"
          handler={switchTabHandler}
        >
          {unreadCount[NotificationType.Notifications] !== 0 && (
            <UnreadIndicator />
          )}
        </TabButton>
        <TabButton
          type={NotificationType.SelfSent}
          selectedTab={selectedTab}
          title="Self-Sent"
          handler={switchTabHandler}
        >
          {unreadCount[NotificationType.SelfSent] !== 0 && <UnreadIndicator />}
        </TabButton>
      </View>
      <View className="mt-[20px] h-[80vh]">
        <FlatList
          data={notifications}
          renderItem={
            selectedTab === NotificationType.Notifications
              ? ({ item }) => <NotificationList item={item} />
              : ({ item }) =>
                  item.mode === NotificationMode.SelfSentGroup ? (
                    <GroupSelfSentInviteList item={item} />
                  ) : (
                    <InvitationList item={item} />
                  )
          }
          // renderItem={({ item }) => console.log(item)}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={Divider}
        />
      </View>
    </View>
  );
}
