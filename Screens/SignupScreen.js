import { View, TextInput, TouchableHighlight, Text } from "react-native";
import { useState } from "react";
import { post } from "../utils/request";
import API from "../modules/Api";
import axios from "axios";

export default function SignupScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [referCode, setReferCode] = useState();

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  function updateInputValueHandler(inputType, inputValue) {
    console.log(inputType, inputValue);
    switch (inputType) {
      case "email":
        if (validateEmail(inputValue)) {
          setEmailError(null);
          setEmail(inputValue);
        } else {
          setEmailError("Invalid Email! Please enter a valid email.");
        }
        break;
      case "password":
        console.log(validatePassword(inputValue));
        if (validatePassword(inputValue)) {
          setPasswordError(null);
          setPassword(inputValue);
        } else {
          setPasswordError(
            "Invalid Password! Password must contain at least one uppercase, one lowercase letter, one number, and be longer than 8 characters less than 18 characters."
          );
        }
      case "referCode":
        // setReferCode(inputValue);
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

  console.log(API.registerRequest());

  async function sendVerifiCode() {
    if (!emailError && !passwordError) {
      try {
        const response = await axios.post(API.registerRequest(), {
          username: email,
          password: password,
          channel: "OFFICIAL-WEB",
          serviceId: "",
          referralCode: referCode,
        });
        console.log(response);
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <View className="flex-1 justify-center w-[70vw] mx-auto">
      <View>
        {/* {errorMessage && <Text className="text-white">{errorMessage}</Text>} */}
        <View className="flex-row items-center mb-[10px]">
          <Text className="text-white flex-1">Email: </Text>
          <View className="bg-[#414141] w-[65%] p-[5px]">
            <TextInput
              value={email}
              onChangeText={(value) => updateInputValueHandler("email", value)}
              className="text-white"
            />
          </View>
        </View>
        {emailError && (
          <View className="">
            <Text className="text-[#FF0000]">
              Please input a valid email address
            </Text>
          </View>
        )}
        <View className="flex-row items-center mb-[10px]">
          <Text className="text-white flex-1">Password: </Text>
          <View className="bg-[#414141] w-[65%]  p-[5px]">
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
          <View className="bg-[#414141] w-[65%] p-[5px]">
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
        <TouchableHighlight
          onPress={sendVerifiCode}
          className="items-center bg-[#6E56DB] rounded p-[10px] mx-[50px] mt-[20px]"
        >
          <View>
            <Text className="text-white font-bold">Get verification code</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}
