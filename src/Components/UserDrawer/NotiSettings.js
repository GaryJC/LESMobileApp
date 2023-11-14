import { View, Text, Switch, TouchableHighlight, Pressable, Platform, Linking } from "react-native";
import OptionLayout from "./OptionLayout";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import DataCenter from "../../modules/DataCenter";
import UserSetting from "../../Models/UserSetting";
import Divider from "../Divider";

const NotiSettings = () => {
  const [settings, setSettings] = useState({});
  const [notificationOn, setNotificationOn] = useState({});

  useEffect(() => {
    setSettings(DataCenter.userInfo.userSetting.notificationSetting);
  }, [DataCenter.userInfo.userSetting.notificationSetting])

  useEffect(() => {
    setNotificationOn(DataCenter.userInfo.isNotificationOn());
  }, [DataCenter.userInfo.notificationState])

  const goToSetting = () => {
    if (Platform.OS == "android") {
      goToSettingAndroid();
    } else if (Platform.OS == "ios") {
      goToSettingIos();
    }
  }

  const goToSettingAndroid = () => {
    Linking.openSettings();
  }

  const goToSettingIos = () => {
    Linking.openURL("app-settings://notification/myapp");
  }

  const onValueChange = (title) => {
    const ns = { ...settings };
    switch (title) {
      case "Friend Requests":
        ns.friendRequest = !ns.friendRequest;
        break;
      case "Group Invitations":
        ns.groupInvite = !ns.groupInvite;
        break;
      case "Chat Messages":
        ns.chatMessages = !ns.chatMessages;
        break;
      case "Show Message Content":
        ns.showMessageDetail = !ns.showMessageDetail;
        break;
    }
    setSettings(ns);
    DataCenter.userInfo.userSetting.updateNotificationSetting(ns);
  };

  const icon = <MaterialIcons name="notifications" size={22} color="white" />;
  const SwitchList = ({ title, value, handler }) => (
    <View className="flex-row justify-between items-center my-[5px]">
      <Text className="text-white text-[16px]">{title}</Text>
      <Switch onValueChange={() => onValueChange(title)} value={value} />
    </View>
  );

  const warn = notificationOn ? <></>
    : <Pressable onPress={goToSetting}>
      <View className="mt-2 flex flex-row items-center">
        <Ionicons name="warning-outline" size={24} color="#ffbb00" />
        <View className="ml-2 flex-1">
          <Text className="text-white text-base mb-1">Push Notifications Are Off</Text>
          <Text className="text-white mb-2">Enable in Device Settings</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="white" />
      </View>
      <Divider />
    </Pressable>

  return (
    <OptionLayout title={"Notification Settings"} icon={icon}>
      {warn}
      <SwitchList title={"Friend Requests"} value={settings.friendRequest} />
      <SwitchList title={"Group Invitations"} value={settings.groupInvite} />
      <SwitchList title={"Chat Messages"} value={settings.chatMessages} />
      <Divider />
      <SwitchList title={"Show Priview Text"} value={settings.showMessageDetail} />
    </OptionLayout>
  );
};

export default NotiSettings;
