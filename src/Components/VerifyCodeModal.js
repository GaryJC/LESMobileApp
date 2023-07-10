import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Pressable,
} from "react-native";
import axios from "axios";
import { resendCodeRequest, signupRequest } from "../utils/auth";
import AuthButton from "./AuthButton";
import { useNavigation } from "@react-navigation/native";

export default function VerifyCodeModal({
  modalVisible,
  setModalVisible,
  email,
  token,
  sendCodeButton,
}) {
  //   console.log(modalVisible);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  function inputVerifyCodeHandler(value) {
    setVerifyCode(value);
  }

  //   console.log(setModalVisible);

  async function signupHandler() {
    setIsLoading(true);
    console.log(email, token, verifyCode);
    try {
      const response = await signupRequest(email, token, verifyCode);
      const data = response.data;
      console.log(data);
      if (data.code === 0) {
        //成功后跳转到登陆界面
        setError(null);
        navigation.navigate("Login");
      } else {
        setError(data.msg);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  return (
    <Modal
      visible={modalVisible}
      transparent={true} // set modal background to transparent
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/[0.6]"
        onPress={() => setModalVisible(false)}
      >
        <View className="w-[80%] h-[200px] p-[20px] bg-white justify-center rounded-lg">
          {error && (
            <View>
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          )}
          <Text className="text-center">
            A verification code has been sent to email address.
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1 bg-[#414141] p-[10px] rounded mr-[20px]">
              <TextInput
                className="text-white"
                value={verifyCode}
                onChangeText={inputVerifyCodeHandler}
              />
            </View>
            {sendCodeButton}
          </View>
          <AuthButton
            onPressHandler={signupHandler}
            title="Sign up"
            isLoading={isLoading}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
