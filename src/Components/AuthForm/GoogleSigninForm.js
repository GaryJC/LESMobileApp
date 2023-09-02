import { View, Modal, Text, TouchableHighlight } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginService from "../../services/LoginService";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import LoadingIndicator from "../LoadingIndicator";
import { useState } from "react";

const GoogleSigninForm = ({ email, closeModalHandler }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  async function onGoogleButtonPress() {
    setIsLoading(true);
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential

      await auth().signInWithCredential(googleCredential);
      const { loginState, id, imServerState } =
        await LoginService.Inst.firebaseQuickLogin();
      console.log("google result; ", loginState, id, imServerState);
      navigation.navigate("VerifyEmail", { id, loginState, imServerState });
    } catch (e) {}

    setIsLoading(false);
  }
  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Sign in
      </Text>
      <Text className="text-[16px] font-bold text-white mb-[10px]">
        You already have an account
      </Text>
      <Text className="text-[13px] text-white">
        You have already used <Text className="font-bold">{email}</Text>. Sign
        in with Google to continue.
      </Text>
      <View className="flex-row justify-end mt-[20px]">
        <TouchableHighlight onPress={closeModalHandler}>
          <View className="bg-[#393B44] py-[5px] w-[70px] mr-[10px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={onGoogleButtonPress}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Sign in with Google</Text>
          </View>
        </TouchableHighlight>
      </View>
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
};

export default GoogleSigninForm;
