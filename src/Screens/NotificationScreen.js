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
    case "GET_ALL_NOTIFICATIONS":
      return action.payload;
    case "UPDATE_NOTIFICATIONS":
      console.log("noti state: ", state);
      const notification = action.payload;
      if (
        notification.state ===
        (LesConstants.IMNotificationState.Rejected ||
          LesConstants.IMNotificationState.Canceled)
      ) {
        return state.filter((item) => item.id !== notification.id);
      }
      const isExisted = state.find((item) => item.id === notification.id);
      console.log("is existed? ", isExisted);
      return isExisted
        ? state.map((item) =>
            item.id === notification.id ? notification : item
          )
        : [...state, notification];
  }
};

export default function Notification() {
  const [selectedTab, setSelectedTab] = useState(
    Constants.NotificationTab.Notification
  );

  // const [noticiations, setNotifications] = useState([]);
  const [notifications, dispatchNotifications] = useReducer(
    notificationReducer,
    []
  );

  const switchTab = (tab) => {
    if (tab !== selectedTab) {
      console.log("switch tab: ", tab, selectedTab);
      setSelectedTab(tab);
    }
  };

  useEffect(() => {
    const notifications = DataCenter.notifications.getAllNotifications();
    dispatchNotifications({
      type: "GET_ALL_NOTIFICATIONS",
      payload: notifications,
    });
    // setNotifications(notifications);

    console.log("all noticiations: ", notifications);

    const onNotiUpdatedHandler = (notification) => {
      console.log("updated noti: ", notification);
      dispatchNotifications({
        type: "UPDATE_NOTIFICATIONS",
        payload: notification,
      });
    };

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      onNotiUpdatedHandler
    );
  }, []);

  // useEffect(() => {}, [selectedTab]);

  return (
    <View className="flex-1">
      <View className="flex-row justify-between w-[90vw] mx-auto bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TouchableOpacity
          className="flex-1"
          onPress={() => switchTab(Constants.NotificationTab.Notification)}
        >
          <View>
            <Text className="text-white font-bold text-center">
              Notifications
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1"
          onPress={() => switchTab(Constants.NotificationTab.Invitation)}
        >
          <View>
            <Text className="text-white font-bold text-center">
              Invitations
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          data={notifications}
          renderItem={
            selectedTab === Constants.NotificationTab.Notification
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
