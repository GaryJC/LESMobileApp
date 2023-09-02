import { View, Text, TextInput } from "react-native";
import InputLayout from "../Components/InputLayout";
import { useState } from "react";
import AuthButton from "../Components/AuthButton";
import IMFunctions from "../utils/IMFunctions";
import { useNavigation } from "@react-navigation/native";

export default function CreateNameScreen() {
  const [username, setUsername] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const updateUsername = (val) => {
    setUsername(val);
  };

  const onPressHandler = () => {
    setIsLoading(true);
    IMFunctions.setName(username)
      .then((res) => {
        console.log("name create success: ", res);
        setIsLoading(false);
        navigation.navigate("BottomTab");
      })
      .catch((e) => {
        setIsLoading(false);
        console.log("set name error: ", e);
      });
  };

  return (
    <View className="flex-1 justify-center">
      <InputLayout label={"Create your Nickname:"}>
        <TextInput
          value={username}
          onChangeText={updateUsername}
          className="text-white"
        />
      </InputLayout>
      <AuthButton
        onPressHandler={onPressHandler}
        title={"Submit"}
        isLoading={isLoading}
      />
    </View>
  );
}
