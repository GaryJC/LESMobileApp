import { useEffect, useState } from "react";
import {
  View
} from "react-native";
//dummy data
import SocialFriend from "../Components/Social/SocialFriend";
import SocialGroup from "../Components/Social/SocialGroup";
import TabButton from "../Components/TabButton";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import FriendBottomSheet from "../Components/FriendBottomSheet";
import FriendData from "../Models/Friends";

export default function FriendsScreen() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState(
    Constants.SocialTabButtonType.Friends
  );
  const [popUser, setPopUser] = useState(null);

  /*
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
  */

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

  /**
   * 
   * @param {{friendInfo:FriendData}} event 
   */
  const onPopupFriend = event => {
    console.log("popup friend:", event.friendInfo);
    setPopUser(event.friendInfo);
  }

  useEffect(() => {
    JSEvent.on(DataEvents.Notification.NotificationState_Updated, updateUnreadCountHandler);
    const unsubPopup = JSEvent.on(UIEvents.Friend.PopupFriendBottomSheet, onPopupFriend);

    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateUnreadCountHandler
      );
      unsubPopup();
    };
  }, []);

  return (
    <View className="flex-1 px-[5vw]">
      <View>
        {/* <FriendButton
          title="You Have Pending Requests"
          icon="emoji-people"
          link="Notification"
          unreadCount={unreadCount}
        /> */}
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

      {/**
       * 全局统一弹出使用的FriendBottomSheet
       */
      }
      <FriendBottomSheet
        visible={popUser != null}
        onClosed={() => setPopUser(null)}
        selectedFriend={popUser}
      />
    </View>
  );
}
