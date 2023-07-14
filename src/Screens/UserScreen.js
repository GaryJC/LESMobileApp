import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { UserData } from "../Data/dummyData";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import StatusBottomSheet from "../Components/StatusBottomSheet";
import {
  StateIndicator,
  makeStateReadable,
} from "../Components/StateIndicator";
import DataCenter from "../modules/DataCenter";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

const userOptions = [
  { id: 1, title: "Account", link: "" },
  { id: 2, title: "Referral Code", link: "" },
  { id: 3, title: "Settings", link: "" },
];

const UserOptionButton = (key, title, link) => (
  <View key={key} className="py-[15px]">
    <Text className="text-white text-[15px]">{title}</Text>
  </View>
);

export default function UserScreen() {
  // const [userData, setUserData] = useState();
  const [userStatus, setUserStatus] = useState(
    DataCenter.userInfo.imUserInfo.state
  );
  // const [username, setUsername] = useState();
  // const [userId, setUserId] = useState();
  const [userInfo, setUserInfo] = useState({
    name: "",
    accountId: "",
    state: "",
    // avatar:"",
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation = useNavigation();

  const openSheet = useCallback(() => {
    // bottomSheetRef.current?.expand(); // 1 refers to the second snap point ('50%')
    setIsSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    // bottomSheetRef.current?.expand(); // 1 refers to the second snap point ('50%')
    setIsSheetOpen(false);
  }, []);

  useEffect(() => {
    setUserStatus(DataCenter.userInfo.imUserInfo.state);

    const updateUnreadCountHandler = () => {
      const count = DataCenter.notifications.unreadCount();
      setUnreadCount(count);
    };

    updateUnreadCountHandler();

    const retriveUserInfoHandler = () => {
      console.log("user name: ", DataCenter.userInfo.name);
      console.log("user email: ", DataCenter.userInfo.email);
      setUserInfo((pre) => {
        return {
          ...pre,
          name: DataCenter.userInfo.imUserInfo.name,
          accountId: DataCenter.userInfo.accountId,
          // avatar:DataCenter.userInfo.accountId
        };
      });
    };

    retriveUserInfoHandler();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );

    JSEvent.on(DataEvents.User.UserState_IsLoggedin, retriveUserInfoHandler);

    return () => {
      JSEvent.remove(DataEvents.Notification.NotificationState_Updated);
      JSEvent.remove(DataEvents.User.UserState_IsLoggedin);
    };
  }, []);

  const SwitchStatusButton = () => (
    <TouchableHighlight onPress={openSheet}>
      <View className="w-[25vw] h-[5vh] bg-[#853DFB] rounded-lg flex-row justify-evenly items-center">
        <StateIndicator state={userStatus} />
        <Text className="text-white text-[16px] font-bold">
          {makeStateReadable(userStatus)}
        </Text>
      </View>
    </TouchableHighlight>
  );

  const onLogoutHandler = async () => {
    try {
      await deleteAuthCache();
      // (DataCenter.userInfo = {
      //   accountId: "",
      //   email: "",
      //   loginKey: "",

      //   /**
      //    * im用户信息
      //    */
      //   imUserInfo: {
      //     name: "",
      //     tag: 0,
      //     state: 0,
      //   },
      // }),
      navigation.navigate("Login");
    } catch {
      (e) => {
        console.log("log out error: ", e);
      };
    }
  };

  const navigateToNotification = () => {
    navigation.navigate("Notification");
  };

  const deleteAuthCache = async () => {
    const delAccountId = SecureStore.deleteItemAsync("accountId");
    const delLoginKey = await SecureStore.deleteItemAsync("loginKey");
    const delEmail = await SecureStore.deleteItemAsync("email");
    await Promise.all(delAccountId, delLoginKey, delEmail);
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={UserData.userBgImg}
        className="w-[100vw] h-[30vh] items-center relative"
      >
        <View className="overflow-hidden rounded-full w-[100px] h-[100px] absolute bottom-[-50px]">
          <ImageBackground
            source={{ uri: `https://i.pravatar.cc/?img=${userInfo.accountId}` }}
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          onPress={navigateToNotification}
          className="absolute left-[5vw] top-[8vh]"
        >
          <Ionicons name="notifications" size={30} color="white" />
          {unreadCount !== 0 && (
            <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full relative bottom-[15px] left-[15px]">
              <Text className="font-bold text-white text-center">
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ImageBackground>
      <View className="px-[5vw] mt-[50px] items-center">
        <Text className="text-white font-bold text-[30px]">
          {userInfo.name}
        </Text>
        <Text className="text-white text-[15px]">#{userInfo.accountId}</Text>
        <View className="flex-row items-center justify-between mt-[3vh]">
          <Text className="text-white text-[20px] pr-[20px]">Set Status:</Text>
          <SwitchStatusButton />
        </View>
        <View className="bg-[#131F2B] rounded-lg w-[100%] mt-[3vh]">
          <ScrollView className="divide-y-2 divide-[#5C5C5C] px-[10px]">
            {userOptions.map((item, index) =>
              UserOptionButton(item.id, item.title, item.link)
            )}
          </ScrollView>
        </View>
        <TouchableHighlight className="w-[100%]" onPress={onLogoutHandler}>
          <View className="bg-[#131F2B] rounded-lg w-[100%] mt-[3vh] items-center">
            <Text className="py-[10px] text-[#FF0000] text-[15px]">
              Log Out
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      {/* The bottom sheet that is used to switch the user status */}
      <StatusBottomSheet
        isSheetOpen={isSheetOpen}
        closeSheet={closeSheet}
        setUserStatus={setUserStatus}
      />
    </View>
  );
}
