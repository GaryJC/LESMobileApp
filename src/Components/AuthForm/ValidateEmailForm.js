import { View, Text, TextInput, TouchableHighlight } from "react-native";
import Constants from "../../modules/Constants";
import { firebase } from "@react-native-firebase/auth";
import { useState } from "react";
import LoadingIndicator from "../LoadingIndicator";
import HighlightButton from "../HighlightButton";

const ValidateEmailForm = ({
  email,
  setEmail,
  setEmailState,
  closeModalHandler,
}) => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmailHandler = async () => {
    try {
      if (email == null || email == "") return;
      const result = await firebase.auth().fetchSignInMethodsForEmail(email);
      if (result.includes("google.com")) {
        setEmailState(Constants.EmailState.RegisteredWithGoogle);
      } else if (result.includes("password")) {
        setEmailState(Constants.EmailState.Registered);
      } else {
        setEmailState(Constants.EmailState.UnRegistered);
      }
      console.log("email result: ", result);
    } catch (e) {
      console.log("error: ", e.code);
      if (e.code === "auth/invalid-email") {
        setError("The email format is invalid");
      }
    }
  };
  return (
    <View className="w-full">
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Sign in with email
      </Text>
      <Text className="text-[16px] font-bold text-[#C3C3C3] mb-[10px]">
        Email
      </Text>
      <TextInput
        placeholder="Please input your email address"
        placeholderTextColor={"#C3C3C3"}
        value={email}
        onChangeText={setEmail}
        className="border-b-2 border-[#394879] text-white"
        keyboardType="email-address"
      />
      {error && <Text className="text-[#FF0000]">{error}</Text>}
      <View className="flex-row justify-end mt-[20px]">
        <HighlightButton text="Cancel" onPress={closeModalHandler} />
        <HighlightButton type="primary" text="Next" onPress={validateEmailHandler} />
      </View>
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
};

export default ValidateEmailForm;
