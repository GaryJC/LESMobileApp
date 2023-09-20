import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Button,
  ImageBackground,
  FlatList,
  SectionList,
  Text,
  View,
} from "react-native";
//dummy data
import { FriendButton } from "../Components/FriendButton";
import { FriendList } from "../Components/FriendList";
import FriendListChatButton from "../Components/SocialListChatButton";
import DataCenter from "../modules/DataCenter";
import { DataEvents, UIEvents } from "../modules/Events";
import FriendService from "../services/FriendService";
import JSEvent from "../utils/JSEvent";
import { LesConstants } from "les-im-components";
import { BackHandler } from "react-native";
import GroupListItem from "../Components/Social/GroupListItem";
import SocialGroup from "../Components/Social/SocialGroup";
import SocialListChatButton from "../Components/SocialListChatButton";
import SocialFriend from "../Components/Social/SocialFriend";
import TabButton from "../Components/TabButton";
import Constants from "../modules/Constants";

export default function FriendsScreen() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState(
    Constants.SocialTabButtonType.Friends
  );

  useEffect(() => {
    const handleBackPress = () => {
      // Prevent back button default behavior
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const updateUnreadCountHandler = () => {
    // const count =
    //   DataCenter.notifications?.unreadCount(
    //     LesConstants.IMNotificationType.FriendInvitation
    //   ) ?? 0;
    const count = DataCenter.notifications?.unreadCount();
    setUnreadCount(count);
  };

  const switchTabHandler = (type) => {
    setSelectedTab(type);
  };

  useEffect(() => {
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

  return (
    <View className="flex-1 px-[5vw]">
      <View>
        <FriendButton
          title="You Have Pending Requests"
          icon="emoji-people"
          link="Notification"
          unreadCount={unreadCount}
        />
        {/* <FriendButton title="Blocked" icon="block" link="Blocked" /> */}
      </View>
      <View className="flex-row justify-between my-[15px] bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TabButton
          title={Constants.SocialTabButtonType.Friends}
          selectedTab={selectedTab}
          type={Constants.SocialTabButtonType.Friends}
          handler={switchTabHandler}
        />
        <TabButton
          title={Constants.SocialTabButtonType.Groups}
          selectedTab={selectedTab}
          type={Constants.SocialTabButtonType.Groups}
          handler={switchTabHandler}
        />
      </View>
      {selectedTab === Constants.SocialTabButtonType.Friends ? (
        <SocialFriend />
      ) : (
        <SocialGroup />
      )}
    </View>
  );
}
