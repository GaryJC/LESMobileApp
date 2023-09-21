import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "@react-native-firebase/auth";
import LoginService from "../../services/LoginService";
import LoadingIndicator from "../LoadingIndicator";
import Constants from "../../modules/Constants";
import { LesConstants } from "les-im-components";
import HighlightButton from "../HighlightButton";
import PasswordInput from "../PasswordInput";
import RecoverPasswordModal from "./RecoverPasswordModal";

const EmailSigninForm = ({ email, closeModalHandler }) => {
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [recoverModalVisible, setRecoverModalVisible] = useState(false);

  const navigation = useNavigation();

  const signinHandler = async () => {
    setIsLoading(true);
    try {
      const user = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      console.log("user: ", user);
      const { loginState, id, imServerState } =
        await LoginService.Inst.firebaseQuickLogin();
      console.log("login result", loginState, id, imServerState);
      // setLoginState(loginState);
      navigation.navigate("VerifyEmail", { loginState, id, imServerState });
      closeModalHandler();
    } catch (e) {
      // setError(e);
      const msg = e.message.split("] ")[1];
      setError(msg);
    }
    setIsLoading(false);
  };

  const openRecoverPasswordModal = () => {
    setRecoverModalVisible(true);
  };

  const closeRecoverPasswordModal = () => {
    setRecoverModalVisible(false);
  };

  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Sign in
      </Text>
      <Text className="text-[16px] font-bold text-white mb-[5px]">Email</Text>
      <TextInput
        placeholder="Please input your email address"
        placeholderTextColor={"#C3C3C3"}
        value={email}
        className="border-b-2 border-[#394879] text-white mb-[10px]"
      />
      <Text className="text-[16px] font-bold text-white mb-[5px]">
        Password
      </Text>
      <PasswordInput initValue={""} onChangeText={setPassword} />
      {/* <TextInput
        placeholder="Please input your password"
        placeholderTextColor={"#C3C3C3"}
        value={password}
        onChangeText={setPassword}
        className="border-b-2 border-[#394879] text-white"
      /> */}
      {error && <Text className="text-[#FF0000]">{error}</Text>}

      <TouchableOpacity
        className="mt-[10px]"
        onPress={openRecoverPasswordModal}
      >
        <Text className="text-[#4BA0ED] self-end">Frogot Password?</Text>
      </TouchableOpacity>

      <View className="flex-row justify-end mt-[20px]">
        <HighlightButton
          text="Cancel"
          onPress={closeModalHandler}
          disabled={isLoading}
        />
        <HighlightButton
          text="Sign in"
          type="primary"
          onPress={signinHandler}
          isLoading={isLoading}
        />
        {/* <TouchableHighlight onPress={closeModalHandler}>
          <View className="bg-[#393B44] px-[10px] py-[5px] mr-[10px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={signinHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Sign in</Text>
          </View>
        </TouchableHighlight> */}
      </View>
      <RecoverPasswordModal
        recoverModalVisible={recoverModalVisible}
        email={email}
        closeRecoverPasswordModal={closeRecoverPasswordModal}
      />
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
};

export default EmailSigninForm;
