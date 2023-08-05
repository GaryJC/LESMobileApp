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

const NotificationType = Constants.Notification.NotificationType;
const NotificationMode = Constants.Notification.NotificationMode;

const notificationReducer = (state, action) => {
  console.log(console.log("noti state: ", state, action));
  switch (action.type) {
    case "GET_NOTIFICATIONS":
      console.log("aaa", action.payload);
      return action.payload;
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
  }
};

export default function NotificationScreen() {
  const [selectedTab, setSelectedTab] = useState(
    NotificationType.Notifications
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
          const allNotifications =
            DataCenter.notifications.getAllNotifications();
          const { selfSentGroupInvits, selfSentFriendInvits } =
            allNotifications.reduce(
              (acc, item) => {
                if (
                  item.type ===
                    LesConstants.IMNotificationType.GroupInvitation &&
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
                  item.type ===
                    LesConstants.IMNotificationType.FriendInvitation &&
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
        }

        // switch (tab) {
        //   case NotificationType.Notifications:
        //     dispatchNotifications({
        //       type: "GET_NOTIFICATIONS",
        //       payload: allNotifications.filter((item) => item.type === 0),
        //     });
        //     break;
        //   case NotificationType.SelfSent:
        //     dispatchNotifications({
        //       type: "GET_NOTIFICATIONS",
        //       payload: allNotifications.filter(
        //         (item) =>
        //           item.mode === NotificationMode.Sender ||
        //           item.mode === NotificationMode.SelfSentGroup
        //       ),
        //     });
        //     break;
        //   case NotificationType.Invitations:
        //     dispatchNotifications({
        //       type: "GET_NOTIFICATIONS",
        //       payload: allNotifications.filter(
        //         (item) =>
        //           item.type !== 0 &&
        //           item.mode !== NotificationMode.SelfSentGroup
        //       ),
        //     });
        //     break;
        // }
      }
    },
    [selectedTab]
  );

  useEffect(() => {
    // 挂载时获取所有推送信息
    // 默认选项是推送（不包括邀请）
    const notifications = DataCenter.notifications.getAllNotifications(
      LesConstants.IMNotificationType.Notification
    );
    dispatchNotifications({
      type: "GET_NOTIFICATIONS",
      payload: notifications.filter((item) => item.type === 0),
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
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateUnreadCountHandler
      );
    };
  }, []);

  useEffect(() => {
    console.log("oooo: ", selectedTab);
    const onNotiUpdatedHandler = (notification) => {
      console.log("updated noti: ", notification);
      const curType =
        notification.type == LesConstants.IMNotificationType.Notification
          ? NotificationType.Notifications
          : NotificationType.Invitations;

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
    return () =>
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        onNotiUpdatedHandler
      );
  }, [selectedTab]);
  // useEffect(() => {}, [selectedTab]);

  const TabButton = ({ notiType, title }) => (
    <TouchableOpacity
      className="flex-1"
      onPress={() => switchTabHandler(notiType)}
    >
      <View
        className={
          selectedTab === notiType
            ? "h-[100%] rounded-lg bg-[#535F6A] justify-center"
            : ""
        }
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-white font-bold text-center">{title}</Text>
          {unreadCount.notiCount !== 0 && (
            <View className="w-[10px] h-[10px] ml-[10px] bg-[#FF3737] rounded-full"></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 mx-[5vw]">
      <View className="flex-row justify-between bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TabButton
          notiType={NotificationType.Notifications}
          title="Notifications"
        />
        <TabButton
          notiType={NotificationType.Invitations}
          title="Invitations"
        />
        <TabButton notiType={NotificationType.SelfSent} title="Self-Sent" />
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
        />
      </View>
    </View>
  );
}
