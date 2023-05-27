import {
  View,
  TextInput,
  TouchableHighlight,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import InputLayout from "../components/InputLayout";
import { useState } from "react";
import AuthButton from "../components/AuthButton";
import { loginRequest } from "../utils/auth";
import { useNavigation } from "@react-navigation/native";
import DataCenter from "../modules/DataCenter";
import { saveData, retrieveData } from "../utils/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const navigation = useNavigation();

  function updateEmailHandler(val) {
    setEmail(val);
  }

  function updatePasswordHandler(val) {
    setPassword(val);
  }

  async function loginHandler() {
    setIsLoading(true);
    try {
      const response = await loginRequest(email, password);
      // console.log(response);
      const data = response.data;
      if (data.code === 0) {
        setError(null);
        const { accountId, msg } = data.retObject;
        console.log(accountId, msg);
        // 发送登陆成功事件
        DataCenter.setLogin(accountId, email, msg, "");
        try {
          await Promise.all(
            saveData("accountId", accountId),
            saveData("loginKey", msg),
            saveData("email", email)
          );
        } catch (e) {
          console.log(e);
        }
        navigation.navigate("BottomTab");
      } else {
        setError(data.msg);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  function navigateToSignup() {
    navigation.navigate("Signup");
  }

  return (
    <View className="flex-1 justify-center w-[70vw] mx-auto">
      {error && (
        <View>
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      )}
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
      <AuthButton
        onPressHandler={loginHandler}
        title="Log in"
        isLoading={isLoading}
      />
      <View className="mt-[10px]">
        <Text className="text-white text-center">Not have an account yet?</Text>
        {/* <AuthButton onPressHandler={navigateToSignup} title="Sign up" /> */}
        <TouchableWithoutFeedback onPress={navigateToSignup}>
          <Text className="text-[#A18EF8] text-center font-bold text-[15px] underline">
            Sign up
          </Text>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}
