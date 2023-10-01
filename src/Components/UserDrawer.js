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
import StatusBottomSheet from "./StatusBottomSheet";
import { StateIndicator, makeStateReadable } from "./StateIndicator";
import DataCenter from "../modules/DataCenter";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import Avatar from "./Avatar";
import { firebase } from "@react-native-firebase/auth";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import RedDotIcon from "./RedDotIcon";
import LoginService from "../services/LoginService";

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

export default function UserDrawer() {
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
    tag: "",
    // avatar:"",
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation = useNavigation();

  const bottomSheetModalRef = useRef(null);

  const openSheet = useCallback(() => {
    // bottomSheetRef.current?.expand(); // 1 refers to the second snap point ('50%')
    // setIsSheetOpen(true);
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    // bottomSheetRef.current?.expand(); // 1 refers to the second snap point ('50%')
    setIsSheetOpen(false);
  }, []);

  useEffect(() => {
    setUserStatus(DataCenter.userInfo.imUserInfo.state);

    const updateUnreadCountHandler = () => {
      const count = DataCenter.notifications.unreadCount();
      let unreadCount = 0;
      if (count > 0) {
        unreadCount = count > 99 ? "99+" : count;
      }
      setUnreadCount(unreadCount);
    };

    // updateUnreadCountHandler();

    const retriveUserInfoHandler = () => {
      console.log("im user info: ", DataCenter.userInfo.imUserInfo);
      console.log("user email: ", DataCenter.userInfo.userProfile.email);
      setUserInfo((pre) => {
        return {
          ...pre,
          name: DataCenter.userInfo.imUserInfo.name,
          accountId: DataCenter.userInfo.accountId,
          tag: DataCenter.userInfo.imUserInfo.tag,
          // avatar:DataCenter.userInfo.accountId
        };
      });
      setUserStatus(DataCenter.userInfo.imUserInfo.state);
    };

    retriveUserInfoHandler();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateUnreadCountHandler
    );
    // JSEvent.on(UIEvents.User.UserState_IsLoggedin, retriveUserInfoHandler);
    JSEvent.on(DataEvents.User.UserState_IsLoggedin, retriveUserInfoHandler);
    JSEvent.on(
      DataEvents.User.UserInfo_Current_Updated,
      retriveUserInfoHandler
    );

    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateUnreadCountHandler
      );
      // JSEvent.remove(
      //   UIEvents.User.UserState_IsLoggedin,
      //   retriveUserInfoHandler
      // );
      JSEvent.remove(
        DataEvents.User.UserState_IsLoggedin,
        retriveUserInfoHandler
      );
      JSEvent.remove(
        DataEvents.User.UserInfo_Current_Updated,
        retriveUserInfoHandler
      );
    };
  }, []);

  const SwitchStatusButton = () => (
    <TouchableHighlight onPress={openSheet}>
      <View className="p-[10px] bg-clr-bglight rounded-lg flex-row justify-evenly items-center">
        <StateIndicator state={userStatus} />
        <Text className="ml-[5px] text-white text-[16px] font-bold">
          {makeStateReadable(userStatus)}
        </Text>
      </View>
    </TouchableHighlight>
  );

  const onLogoutHandler = async () => {
    await LoginService.Inst.firebaseLogout();
    navigation.navigate("Login");
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
    <View className="flex-1 bg-black">
      <ImageBackground
        source={UserData.userBgImg}
        className="w-[100%] h-[30vh] items-center relative"
      >
        <View className="rounded-full w-[100px] h-[100px] absolute bottom-[-50px]">
          {/* <ImageBackground
            source={{ uri: `https://i.pravatar.cc/?img=${userInfo.accountId}` }}
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          /> */}
          <Avatar
            tag={userInfo.tag}
            name={userInfo.name}
            size={{ w: 80, h: 80, font: 40 }}
          >
            <View className="absolute right-0 bottom-0">
              <StateIndicator
                state={userStatus}
                onlineState={LesConstants.IMUserOnlineState.Online}
                bgColor={"#080F14"}
                size={22}
              />
            </View>
          </Avatar>
        </View>

        <View className="absolute left-[5%] top-[5vh] ">
          <RedDotIcon
            iconName="notifications"
            iconSize={30}
            count={unreadCount}
            onPress={navigateToNotification}
          />
        </View>

        {/* <TouchableOpacity
          onPress={navigateToNotification}
          className="absolute left-[5%] top-[8vh]"
        >
          <Ionicons name="notifications" size={30} color="white" />
          {unreadCount !== 0 && (
            <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full relative bottom-[15px] left-[15px]">
              <Text className="font-bold text-white text-center">
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity> */}
      </ImageBackground>
      <View className="mx-[5%] mt-[35px] items-center">
        <Text className="text-white font-bold text-[30px]">
          {userInfo.name}
        </Text>
        <Text className="text-white text-[15px]">#{userInfo.tag}</Text>
        <View className="flex-row items-center justify-between mt-[3vh]">
          <Text className="text-white text-[16px] mr-[10px]">Set Status:</Text>
          <SwitchStatusButton />
        </View>
        <View className="bg-clr-bglight rounded-lg w-[100%] mt-[3vh]">
          <ScrollView className="divide-y-2 divide-[#5C5C5C] px-[10px]">
            {userOptions.map((item, index) =>
              UserOptionButton(item.id, item.title, item.link)
            )}
          </ScrollView>
        </View>
        <TouchableHighlight className="w-[100%]" onPress={onLogoutHandler}>
          <View className="bg-clr-bglight rounded-lg w-[100%] mt-[3vh] items-center">
            <Text className="py-[10px] text-[#FF0000] text-[15px]">
              Log Out
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      {/* The bottom sheet that is used to switch the user status */}
      <StatusBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        setUserStatus={setUserStatus}
      />
    </View>
  );
}
