import {
  View,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { post } from "../utils/request";
import API from "../modules/Api";
import axios from "axios";
import InputLayout from "../components/InputLayout";
import VerifyCodeModal from "../components/VerifyCodeModal";
import { sendVerifyCodeRequest } from "../utils/auth";

export default function SignupScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [referCode, setReferCode] = useState();
  const [token, setToken] = useState();

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

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

  function updateInputValueHandler(inputType, inputValue) {
    // console.log(inputType, inputValue);
    switch (inputType) {
      case "email":
        setEmail(inputValue);
        if (validateEmail(inputValue)) {
          setEmailError(null);
        } else {
          setEmailError("Invalid Email! Please enter a valid email.");
        }
        break;
      case "password":
        setPassword(inputValue);
        if (validatePassword(inputValue)) {
          setPasswordError(null);
        } else {
          setPasswordError(
            "Invalid Password! Password must contain at least one uppercase, one lowercase letter, one number, and be longer than 8 characters less than 18 characters."
          );
        }
        break;
      case "referCode":
        setReferCode(inputValue);
        break;
    }
  }

  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  async function sendVerifiCodeHandler() {
    if (!validateEmail(email) && !validatePassword(password)) {
      setEmailError("Invalid Email! Please enter a valid email.");
      setPasswordError(
        "Invalid Password! Password must contain at least one uppercase, one lowercase letter, one number, and be longer than 8 characters less than 18 characters."
      );
    } else if (!validateEmail(email)) {
      setEmailError("Invalid Email! Please enter a valid email.");
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Invalid Password! Password must contain at least one uppercase, one lowercase letter, one number, and be longer than 8 characters less than 18 characters."
      );
    } else {
      setIsResendDisabled(true);
      setCountdown(60);
      try {
        const response = await sendVerifyCodeRequest(
          email,
          password,
          referCode
        );
        // console.log(response);
        const data = response.data;
        if (data.code === 0) {
          console.log("success");
          setToken(data.msg);
          setModalVisible(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  const SendCodeButton = ({ style, title }) => (
    <TouchableHighlight
      onPress={sendVerifiCodeHandler}
      disabled={isResendDisabled}
      className={style}
    >
      <View>
        <Text className="text-white font-bold">
          {isResendDisabled ? "Retry after: " + countdown : title}
        </Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <View className="flex-1 justify-center w-[70vw] mx-auto">
      <View>
        <InputLayout label={"Email:"}>
          <TextInput
            value={email}
            onChangeText={(value) => updateInputValueHandler("email", value)}
            className="text-white"
          />
        </InputLayout>
        {emailError && (
          <View className="">
            <Text className="text-[#FF0000]">
              Please input a valid email address
            </Text>
          </View>
        )}
        <View className="flex-row items-center mb-[10px]">
          <Text className="text-white flex-1">Password: </Text>
          <View className="bg-[#414141] w-[65%] p-[5px] rounded">
            <TextInput
              value={password}
              onChangeText={(value) =>
                updateInputValueHandler("password", value)
              }
              secureTextEntry={true}
              className="text-white"
            />
          </View>
        </View>
        {passwordError && (
          <View>
            <Text className="text-[#FF0000]">
              Password must contain at least one uppercase, lowercase, and
              number
            </Text>
            <Text className="text-[#FF0000]">
              The length of password must less than 18 characters
            </Text>
            <Text className="text-[#FF0000]">
              The length of password must longer than 8 characters
            </Text>
          </View>
        )}
        <View className="flex-row items-center mb-[10px]">
          <Text className="text-white flex-1">Referral Code: </Text>
          <View className="bg-[#414141] w-[65%] p-[5px] rounded">
            <TextInput
              value={referCode}
              onChangeText={(value) =>
                updateInputValueHandler("referCode", value)
              }
              placeholder="Optional"
              className="text-white"
            />
          </View>
        </View>
        {/* <TouchableHighlight
          onPress={sendVerifiCodeHandler}
          // className="items-center bg-[#6E56DB] rounded p-[10px] mx-[50px] mt-[20px]"
          disabled={isResendDisabled}
          className={
            isResendDisabled
              ? "items-center bg-[#565365] rounded p-[10px] mx-[50px] mt-[20px]"
              : "items-center bg-[#6E56DB] rounded p-[10px] mx-[50px] mt-[20px]"
          }
        >
          <View>
            <Text className="text-white font-bold">
              {isResendDisabled
                ? "Retry after: " + countdown
                : "Get verification code"}
            </Text>
          </View>
        </TouchableHighlight> */}
        <SendCodeButton
          style={
            isResendDisabled
              ? "items-center bg-[#565365] rounded p-[10px] mx-[50px] mt-[20px]"
              : "items-center bg-[#6E56DB] rounded p-[10px] mx-[50px] mt-[20px]"
          }
          title="Get verification code"
        />
      </View>
      <VerifyCodeModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        email={email}
        sendCodeButton={
          <SendCodeButton
            style={
              isResendDisabled
                ? "items-center bg-[#565365] rounded p-[10px]"
                : "items-center bg-[#6E56DB] rounded p-[10px]"
            }
            title="Resend"
          />
        }
      >
        <SendCodeButton />
      </VerifyCodeModal>
    </View>
  );
}
