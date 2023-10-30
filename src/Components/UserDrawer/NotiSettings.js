import { View, Text, Switch } from "react-native";
import OptionLayout from "./OptionLayout";
import { MaterialIcons } from "@expo/vector-icons";

const NotiSettings = () => {
  const icon = <MaterialIcons name="notifications" size={22} color="white" />;
  return (
    <OptionLayout title={"Notification Settings"} icon={icon}>
      <View>
        <View className="flex-row justify-between items-center my-[5px]">
          <Text className="text-white text-[16px]">Friend Requests</Text>
          <Switch />
        </View>
        <View className="flex-row justify-between items-center my-[5px]">
          <Text className="text-white text-[16px]">Chat Messages</Text>
          <Switch />
        </View>
      </View>
    </OptionLayout>
  );
};

export default NotiSettings;
