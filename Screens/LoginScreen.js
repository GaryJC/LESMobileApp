import { View, TextInput, TouchableHighlight, Text } from "react-native";
import InputLayout from "../components/InputLayout";
import { useState } from "react";
import AuthButton from "../components/AuthButton";
import { loginRequest } from "../utils/auth";
import { useNavigation } from "@react-navigation/native";
import DataCenter from "../modules/DataCenter";

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
        const { accountId, msg } = data.retObject;
        // console.log(retObject);
        // 发送登陆成功事件
        DataCenter.setLogin(accountId, email, msg, "");
        // 模拟获取好友列表
        DataCenter.getFriendListData();

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
