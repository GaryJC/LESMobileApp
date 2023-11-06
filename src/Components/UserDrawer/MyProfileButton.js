import { View, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import Divider from "../Divider";
import MyProfileBottomSheet from "../MyProfileBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

const MyProfileButton = () => {
  const [visible, setVisible] = useState(false);
  const nav = useNavigation();

  const onOpen = () => {
    //setVisible(true);
    nav.navigate("MyProfile")
  };

  const onClosed = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="account-outline"
            size={24}
            color="white"
          />
          <Text className="ml-[5px] text-white text-[18px] font-bold">
            My Profile
          </Text>
        </View>
      </TouchableOpacity>
      <Divider />
      <MyProfileBottomSheet visible={visible} onClosed={onClosed} />
    </>
  );
};

export default MyProfileButton;
