import {
  View,
  Text,
  FlatList,
  ImageBackground,
  SectionList,
  Button,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
//dummy data
import { RecomFriendsData } from "../Data/dummyData";
// import { FriendsData } from "../Data/dummyData";
// import { FriendListData } from "../modules/DataCenter";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
import FriendService from "../services/FriendService";
import MockServer from "../utils/MockServer";
import { LesPlatformCenter } from "les-im-components";
import { FriendList } from "../Components/FriendList";

const primaryButtonContent = [
  { title: "Friends Request", icon: "emoji-people", link: "" },
  { title: "Blocked", icon: "block", link: "" },
];

const PrimaryButton = (title, icon, link, index) => (
  <View
    key={index}
    className="bg-[#131F2A] h-[100px] px-[20px] flex-row justify-between mb-[10px]"
  >
    <View className="flex-row items-center">
      <MaterialIcons name={icon} color="white" size={34} />
      <Text className="text-white font-bold text-[20px] pl-[10px]">
        {title}
      </Text>
    </View>
    <View className="justify-center">
      <Ionicons
        name="chevron-forward-outline"
        color="white"
        size={34}
      ></Ionicons>
    </View>
  </View>
);

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

const Friend = (id, name, avatar) => (
  <View className="flex-row justify-between mb-[10px]">
    <View className="flex-row items-center">
      <View className="relative">
        <View className="w-[55px] h-[55px] rounded-full overflow-hidden mr-[10px]">
          <ImageBackground
            source={{ uri: avatar }}
            className="w-[100%] h-[100%]"
          />
        </View>
        <View className="absolute bottom-[10] right-[10] w-[20px] h-[20px]">
          <View className="bg-[#FF3737] w-[100%] h-[100%] rounded-full"></View>
        </View>
      </View>
      <Text className="text-white text-[20px] font-bold">{name}</Text>
    </View>
    <View className="flex-row items-center">
      <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center">
        <Ionicons
          name="chatbubble-ellipses-outline"
          color={"white"}
          size={24}
        />
      </View>
    </View>
  </View>
);

const handleFriendData = (friendData) => {
  const data = friendData.map((item) => {
    return { ...item, state: item.state, avatar: item.avatar };
  });
  return data;
};

export default function FriendsScreen() {
  // const [onlineFriends, setOnlineFriends] = useState([]);
  // const [offlineFriends, setOfflineFriends] = useState([]);
  const [friendsData, setFriendsData] = useState([]);

  useEffect(() => {
    const onFriendStateUIUpdated = () => {
      console.log("friend state update");
      const online = FriendService.Inst.getFriendList((f) => f.isOnline);
      const offline = FriendService.Inst.getFriendList((f) => !f.isOnline);
      console.log("processed friend data: ", online);
      // const online = DataCenter.friendListData.filter(
      //   (item) => item.friendState === 0 || item.friendState === 2
      // );
      // const offline = DataCenter.friendListData.filter(
      //   (item) => item.friendState === 1
      // );
      setFriendsData([
        { title: "Recommended Friends", data: [] },
        { title: "Online", data: online },
        { title: "Offline", data: offline },
      ]);
    };

    onFriendStateUIUpdated();

    JSEvent.on(UIEvents.Friend.FriendState_UIRefresh, onFriendStateUIUpdated);
    JSEvent.on(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);

    return () => {
      JSEvent.remove(
        UIEvents.Friend.FriendState_UIRefresh,
        onFriendStateUIUpdated
      );
      JSEvent.remove(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);
    };
  }, []);

  const temporyAddHander = () => {
    LesPlatformCenter.IMFunctions.sendFriendInvitation(36)
      .then((res) => {
        console.log("Inivitation success: ", res);
      })
      .catch((e) => console.log("Invitiation failed: ", e));
  };

  const TemporyAddButton = () => (
    <Button title="Add" onPress={temporyAddHander} />
  );

  return (
    <View className="flex-1 w-[90vw] mx-auto">
      <TemporyAddButton />
      <View>
        {primaryButtonContent.map(({ title, icon, link }, index) =>
          PrimaryButton(title, icon, link, index)
        )}
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
            // renderItem={({ item, section }) =>
            //   section.title === "Recommended Friends"
            //     ? RecommendedFriend(item.id, item.name, item.avatar)
            //     : Friend(item.id, item.name, item.avatar)
            // }
            renderItem={({ item, section }) =>
              section.title === "Recommended Friends" ? (
                <RecomFriendsData
                  id={item.id}
                  name={item.name}
                  state={item.state}
                  avatar={item.avatar}
                />
              ) : (
                <FriendList
                  id={item.id}
                  name={item.name}
                  state={item.state}
                  avatar={item.avatar}
                />
              )
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-white font-bold text-[24px] my-[10px]">
                {title}
              </Text>
            )}
          />
          {/* <FlatList
            data={RecommendedFriendsData}
            renderItem={({ item }) =>
              RecommendedFriend(
                item.friendId,
                item.friendName,
                item.friendAvatar
              )
            }
            keyExtractor={(item) => item.friendId}
          />
        </View> */}
        </View>
      </View>
    </View>
  );
}
