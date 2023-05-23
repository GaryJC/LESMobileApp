import { View, TextInput, TouchableHighlight, Text } from "react-native";
import InputLayout from "../components/InputLayout";
import { useState } from "react";
import AuthButton from "../components/AuthButton";
import { loginRequest } from "../utils/auth";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const navigation = useNavigation();

  function updateEmailHandler(val) {
    setEmail(val);
  }

  function updatePasswordHandler(val) {
    setPassword(val);
  }

  async function loginHandler() {
    try {
      const response = await loginRequest(email, password);
      // console.log(response);
      const data = response.data;
      if (data.code === 0) {
        const retObject = data.retObject;
        console.log(retObject);
        navigation.navigate("BottomTab");
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View className="flex-1 justify-center w-[70vw] mx-auto">
      <InputLayout label={"Email:"}>
        <TextInput
          value={email}
          onChangeText={updateEmailHandler}
          className="text-white"
        />
      </InputLayout>
      <InputLayout label={"Password:"}>
        <TextInput
          value={password}
          onChangeText={updatePasswordHandler}
          className="text-white"
        />
      </InputLayout>
      <AuthButton onPressHandler={loginHandler} title="Log in" />
    </View>
  );
}
