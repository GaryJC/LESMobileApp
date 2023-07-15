import {
  View,
  Text,
  FlatList,
  ImageBackground,
  SectionList,
  Button,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
//dummy data
import { RecomFriendsData } from "../Data/dummyData";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents, DataEvents } from "../modules/Events";
import FriendService from "../services/FriendService";
import MockServer from "../utils/MockServer";
import { LesPlatformCenter } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import NotificationService from "../services/NotificationService";
import { FriendButton } from "../Components/FriendButton";
import FriendBottomSheet from "../Components/FriendBottomSheet";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const friendButtonContent = [
  { title: "Friends Request", icon: "emoji-people", link: "" },
  { title: "Blocked", icon: "block", link: "" },
];

const RecommendedFriend = (id, name, avatar) => (
  <View className="flex-row justify-between mb-[10px]">
    <View className="flex-row items-center">
      <View className="w-[55px] h-[55px] rounded-full overflow-hidden mr-[10px]">
        <ImageBackground
          source={{ uri: avatar }}
          className="w-[100%] h-[100%]"
        />
      </View>
      <Text className="text-white text-[20px] font-bold">{name}</Text>
    </View>
    <View className="flex-row items-center">
      <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center mr-[10px]">
        <Ionicons name="close" color={"white"} size={24} />
      </View>
      <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center">
        <Ionicons name="add-outline" color={"white"} size={24} />
      </View>
    </View>
  </View>
);

export default function FriendsScreen() {
  // const [onlineFriends, setOnlineFriends] = useState([]);
  // const [offlineFriends, setOfflineFriends] = useState([]);
  const [friendsData, setFriendsData] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 可传参数 { id, state, onlineState }
    const onFriendStateUIUpdated = () => {
      // const online = FriendService.Inst.getFriendList((f) => f.isOnline);
      // const offline = FriendService.Inst.getFriendList((f) => !f.isOnline);
      const friendList = FriendService.Inst.getFriendList();
      console.log("friend list: ", friendList);
      const online = friendList.filter((item) => item.onlineState === 1);
      const offline = friendList.filter((item) => item.onlineState === 2);

      setFriendsData([
        // { title: "Recommended Friends", data: [] },
        { title: "Online", data: online },
        { title: "Offline", data: offline },
      ]);
    };

    onFriendStateUIUpdated();

    const updateUnreadCountHandler = () => {
      const count = DataCenter.notifications.unreadCount();
      setUnreadCount(count);
    };

    updateUnreadCountHandler();

    JSEvent.on(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);
    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );

    return () => {
      JSEvent.remove(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);
      JSEvent.remove(DataEvents.Notification.NotificationState_Updated);
    };
  }, []);

  const temporyAddHander = () => {
    // LesPlatformCenter.IMFunctions.sendFriendInvitation(8)
    NotificationService.Inst.sendFriendInvitation(8)
      .then((res) => {
        console.log("Inivitation success: ", res);
      })
      .catch((e) => console.log("Invitiation failed: ", e));
  };

  const TemporyAddButton = () => (
    <Button title="Add" onPress={temporyAddHander} />
  );

  return (
    <View className="flex-1 px-[5vw]">
      <TemporyAddButton />
      <View>
        {/* {friendButtonContent.map(({ title, icon, link }, index) => (
          <FriendButton title={title} icon={icon} link={link} index={index} />
        ))} */}
        <FriendButton
          title="Friend Request"
          icon="emoji-people"
          link="FriendRequest"
        >
          {unreadCount !== 0 && (
            <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full relative bottom-[15px] right-[5px]">
              <Text className="font-bold text-white text-center">
                {unreadCount}
              </Text>
            </View>
          )}
        </FriendButton>
        <FriendButton title="Blocked" icon="block" link="Blocked" />
      </View>
      <View className="mt-[30px] flex-1">
        {/* <Text className="text-white font-bold text-[24px]">
          Recommended Friends
        </Text> */}
        <View className="flex-1">
          <SectionList
            stickySectionHeadersEnabled={false}
            sections={friendsData}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item, section }) =>
              section.title === "Recommended Friends" ? (
                <RecomFriendsData
                  id={item.id}
                  name={item.name}
                  state={item.state}
                  avatar={item.avatar}
                />
              ) : (
                <FriendList friend={item} />
              )
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-white font-bold text-[24px] my-[10px]">
                {title}
              </Text>
            )}
          />
        </View>
      </View>
    </View>
  );
}
