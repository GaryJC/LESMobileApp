import { TouchableHighlight, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const FriendButton = ({ title, icon, link, children }) => {
  const navigation = useNavigation();
  return (
    <TouchableHighlight onPress={() => navigation.navigate(link)}>
      <View className="bg-[#131F2A] h-[100px] px-[20px] flex-row justify-between mb-[10px]">
        <View className="flex-row items-center">
          <MaterialIcons name={icon} color="white" size={34} />
          {children}
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
    </TouchableHighlight>
  );
};
