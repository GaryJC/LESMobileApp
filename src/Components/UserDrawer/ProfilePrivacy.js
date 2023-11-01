import OptionLayout from "./OptionLayout";
import { View, Text } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

const CheckBox = ({ title, state }) => {
  const onCheckHandler = (title) => {
    switch (title) {
      case "Public":
        break;
      case "Friends":
        break;
      case "Only Me":
        break;
    }
  };
  return (
    <View className="my-[5px]">
      <BouncyCheckbox
        isChecked={state}
        onPress={onCheckHandler}
        text={title}
        style={{
          justifyContent: "space-between",
          flexDirection: "row-reverse",
        }}
        textStyle={{
          textDecorationLine: "none",
          color: "#D9D9D9",
        }}
        textContainerStyle={{
          marginLeft: 0,
        }}
      />
    </View>
  );
};

const ProfilePrivacy = () => {
  const icon = (
    <MaterialCommunityIcons name="account-lock" size={24} color="white" />
  );

  // 0->public, 1->friends, 2->onlyMe
  const [checkBoxState, setCheckBoxState] = useState([false, false, false]);

  return (
    <OptionLayout title={"Profile Privacy"} icon={icon}>
      <Text className="text-clr-gray-light my-[5px]">
        Who can see my profile
      </Text>
      <CheckBox title={"Public"} state={checkBoxState[0]} />
      <CheckBox title={"Friends"} state={checkBoxState[1]} />
      <CheckBox title={"Only Me"} state={checkBoxState[2]} />
    </OptionLayout>
  );
};

export default ProfilePrivacy;
