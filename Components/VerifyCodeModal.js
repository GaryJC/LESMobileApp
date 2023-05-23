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

export default function VerifyCodeModal({
  modalVisible,
  setModalVisible,
  email,
  token,
  sendCodeButton,
}) {
  //   console.log(modalVisible);
  const [verifyCode, setVerifyCode] = useState("");

  function inputVerifyCodeHandler(value) {
    setVerifyCode(value);
  }

  //   console.log(setModalVisible);

  async function signupHandler() {
    try {
      const response = await signupRequest(email, token, verifyCode);
      const data = response.data;
      if (data.code === 0) {
        //成功后跳转到登陆界面
      }
    } catch (e) {
      console.log(e);
    }
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
            {/* <TouchableHighlight
              className="flex-1 rounded-lg overflow-hidden"
              onPress={resendCodeHandler}
            >
              <View className="items-center bg-[#5EB857] p-[10px]">
                <Text className="text-white font-bold">Resend{}</Text>
              </View>
            </TouchableHighlight> */}
            {sendCodeButton}
          </View>
          <TouchableHighlight
            className="rounded-lg overflow-hidden"
            onPress={signupHandler}
          >
            <View className="items-center bg-[#5EB857] p-[10px]">
              <Text className="text-white font-bold">Sign up</Text>
            </View>
          </TouchableHighlight>
          {/* <AuthButton onPressHandler={signupHandler} title="Sign up" /> */}
        </View>
      </Pressable>
    </Modal>
  );
}
