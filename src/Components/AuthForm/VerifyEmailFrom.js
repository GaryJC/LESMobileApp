import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import { firebase } from "@react-native-firebase/auth";
import LoginService from "../../services/LoginService";
import VerifySucceedForm from "./VerifySucceedForm";
import LoadingIndicator from "../LoadingIndicator";
import HighlightButton from "../HighlightButton";

const VerifyEmailForm = ({ userToken, userId, setLoginState }) => {
  const [email, setEmail] = useState();
  const [verifyCode, setVerifyCode] = useState();
  const [isVerified, setIsVerified] = useState(false);
  const [codeToken, setCodeToken] = useState();
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // console.log("userId: ", userId, DataCenter.userInfo);
  const verifyEmailHandler = async () => {
    setIsLoading(true);
    try {
      const result = await LoginService.Inst.firebaseRequestVerifyCode(
        userId,
        userToken,
        codeToken,
        verifyCode
      );
      console.log("verify result: ", result);
      if (result) {
        setIsVerified(true);
      } else {
        setError("The verify code is not correct!");
      }
    } catch (e) {
      console.log("error: ", e, e.msg);
      setError(e.msg);
    }
    setIsLoading(false);
  };
  const sendVerifyCodeHandler = async () => {
    setIsResendDisabled(true);
    setCountdown(60);
    setIsLoading(true);
    try {
      const result = await LoginService.Inst.firebaseRequestSendVaildCode(
        userToken
      );
      console.log("send verify code result: ", result);
      setCodeToken(result);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const email = firebase.auth().currentUser.email;
    setEmail(email);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearTimeout(timerId); // Clear the timeout if the component is unmounted
    } else {
      setIsResendDisabled(false);
    }
  }, [countdown]); // This tells React to re-run the effect when `countdown` changes

  return (
    <>
      {isVerified ? (
        <VerifySucceedForm setLoginState={setLoginState} email={email} />
      ) : (
        <View>
          <Text className="text-white text-[18px] font-bold mb-[10px]">
            Verify Email
          </Text>
          <View className="flex-row justify-between items-center mb-[30px]">
            <Text className="text-[16px] font-bold text-white">{email}</Text>
            {/* <TouchableHighlight onPress={sendVerifyCodeHandler}>
              <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
                <Text className="text-white text-center">Send</Text>
              </View>
            </TouchableHighlight> */}
            {isResendDisabled ? (
              // <TouchableHighlight>
              //   <View className="bg-[#565365] px-[10px] py-[5px] rounded">
              //     <Text className="text-white">
              //       {"Retry after: " + countdown}
              //     </Text>
              //   </View>
              // </TouchableHighlight>

              <HighlightButton type="primary" text={"Retry after: " + countdown} disabled={true} />
            ) : (
              <HighlightButton type="primary" text="Send" onPress={sendVerifyCodeHandler} />
              // <TouchableHighlight onPress={sendVerifyCodeHandler}>
              //   <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
              //     <Text className="text-white">Send</Text>
              //   </View>
              // </TouchableHighlight>
            )}
          </View>
          <View className="flex-row justify-between items-center">
            <View className="border-b-2 border-[#394879] w-[200px]">
              <TextInput
                placeholder="Please input your verify code"
                placeholderTextColor={"#C3C3C3"}
                value={verifyCode}
                onChangeText={setVerifyCode}
                className="text-white"
              />
            </View>
            {verifyCode ? (
              <View className="flex-row justify-end">
                <HighlightButton type="primary" text="Verify" onPress={verifyEmailHandler} isLoading={isLoading} />
                {/* <TouchableHighlight onPress={verifyEmailHandler}>
                  <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
                    <Text className="text-white text-center">Verify</Text>
                  </View>
                </TouchableHighlight> */}
              </View>
            ) : (
              <View className="flex-row justify-end">
                <HighlightButton type="normal" text="Verify" disabled={true} />
                {/* <TouchableHighlight>
                  <View className="bg-[#565365] px-[10px] py-[5px] rounded">
                    <Text className="text-white text-center">Verify</Text>
                  </View>
                </TouchableHighlight> */}
              </View>
            )}
          </View>
          {error && <Text className="text-[#FF0000]">{error}</Text>}
        </View>
      )}
      <LoadingIndicator isLoading={isLoading} />
    </>
  );
};

export default VerifyEmailForm;
