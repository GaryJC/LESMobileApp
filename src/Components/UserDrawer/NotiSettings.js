import { View, Text, Switch } from "react-native";
import OptionLayout from "./OptionLayout";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

const NotiSettings = () => {
  const [settings, setSettings] = useState();

  const onValueChange = (title) => {
    switch (title) {
      case "Friend Requests":
        break;
      case "Chat Messages":
        break;
    }
  };

  const icon = <MaterialIcons name="notifications" size={22} color="white" />;
  const SwitchList = ({ title, handler }) => (
    <View className="flex-row justify-between items-center my-[5px]">
      <Text className="text-white text-[16px]">{title}</Text>
      <Switch onValueChange={() => onValueChange(title)} value={setSettings} />
    </View>
  );
  return (
    <OptionLayout title={"Notification Settings"} icon={icon}>
      <SwitchList title={"Friend Requests"} />
      <SwitchList title={"Chat Messages"} />
    </OptionLayout>
  );
};

export default NotiSettings;
