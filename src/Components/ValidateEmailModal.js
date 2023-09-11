import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableHighlight,
  Pressable,
} from "react-native";
import { useState } from "react";
import Constants from "../modules/Constants";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "@react-native-firebase/auth";
import LoginService from "../services/LoginService";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import EmailSigninForm from "./AuthForm/EmailSigninForm";
import GoogleSigninForm from "./AuthForm/GoogleSigninForm";
import ValidateEmailForm from "./AuthForm/ValidateEmailForm";
import CreateAccountForm from "./AuthForm/CreateAccountForm";
import SocialSigninForm from "./AuthForm/SocialSigninForm";
import { Firebase } from "../utils/auth";

export const ValidateEmailModal = ({
  emailSigninModalVisible,
  closeEmailSigninModal,
}) => {
  const [email, setEmail] = useState();
  const [emailState, setEmailState] = useState(Constants.EmailState.Unchecked);
  const navigation = useNavigation();
  // console.log("email state: ", emailState);

  const closeModalHandler = () => {
    setEmailState(Constants.EmailState.Unchecked);
    setEmail();
    closeEmailSigninModal();
  };

  return (
    <Modal
      animationType="fade"
      visible={emailSigninModalVisible}
      transparent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        {/* <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={closeModalHandler}
        /> */}
        <View className="bg-[#2A2C37] w-[90vw] max-w-md p-[15px] rounded">
          <View>
            {/* {loginState===Constants.LoginState.Logout?} */}
            {emailState == Constants.EmailState.Unchecked ? (
              <ValidateEmailForm
                email={email}
                setEmail={setEmail}
                setEmailState={setEmailState}
                closeModalHandler={closeModalHandler}
              />
            ) : emailState == Constants.EmailState.Registered ? (
              <EmailSigninForm
                email={email}
                closeModalHandler={closeModalHandler}
              />
            ) : emailState == Constants.EmailState.UnRegistered ? (
              <CreateAccountForm
                email={email}
                setEmail={setEmail}
                closeModalHandler={closeModalHandler}
              />
            ) : emailState == Constants.EmailState.RegisteredWithGoogle ? (
              <SocialSigninForm
                email={email}
                platForm={"Google"}
                signinHandler={() => Firebase.googleSignin()
                  .then(({ id, loginState, imServerState }) => {
                    navigation.navigate("VerifyEmail", { id, loginState, imServerState });
                  })}
                closeModalHandler={closeModalHandler}
              />
            ) : (
              <SocialSigninForm
                email={email}
                platForm={"Twitter"}
                signinHandler={() => Firebase.twitterSignin()
                  .then(({ id, loginState, imServerState }) => {
                    navigation.navigate("VerifyEmail", { id, loginState, imServerState });
                  })}
                closeModalHandler={closeModalHandler}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/*
const ValidateEmailForm = ({
  email,
  setEmail,
  setEmailState,
  closeModalHandler,
}) => {
  const validateEmailHandler = async () => {
    try {
      const result = await firebase.auth().fetchSignInMethodsForEmail(email);
      if (result.includes("google.com")) {
        setEmailState(Constants.EmailState.RegisteredWithGoogle);
      } else if (result.includes("password")) {
        setEmailState(Constants.EmailState.Registered);
      } else {
        setEmailState(Constants.EmailState.UnRegistered);
      }

      // switch (result) {
      //   case Constants.EmailState.UnRegistered:
      //     setEmailState(Constants.EmailState.UnRegistered);
      //     break;
      //   case Constants.EmailState.Registered:
      //     setEmailState(Constants.EmailState.Registered);
      //     break;
      //   case Constants.EmailState.RegisteredWithGoogle:
      //     setEmailState(Constants.EmailState.RegisteredWithGoogle);
      //     break;
      // }
      console.log("email result: ", result);
    } catch (e) {
      console.log("error: ", e);
    }
  };
  return (
    <View>
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
      />
      <View className="flex-row justify-end mt-[20px]">
        <TouchableHighlight onPress={closeModalHandler}>
          <View className="bg-[#393B44] px-[10px] py-[5px] mr-[10px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={validateEmailHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Next</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const CreateAccountForm = ({ email, setEmail, closeModalHandler }) => {
  const [password, setPassword] = useState();
  const navigation = useNavigation();
  const createAccountHandler = async () => {
    const user = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    console.log("user: ", user);
    // await firebase.auth().signInWithEmailAndPassword(email, password);
    const { loginState, id } = await LoginService.Inst.firebaseQuickLogin();
    console.log("login state", loginState, id);
    // setLoginState(loginState);
    navigation.navigate("VerifyEmail", { loginState, id });
    closeModalHandler();
  };

  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Create Account
      </Text>
      <Text className="text-[16px] font-bold text-white mb-[10px]">Email</Text>
      <TextInput
        placeholder="Please input your email address"
        placeholderTextColor={"#C3C3C3"}
        value={email}
        onChangeText={setEmail}
        className="border-b-2 border-[#394879] text-white"
      />
      <Text className="text-[16px] font-bold text-white">Password</Text>
      <TextInput
        placeholder="Please input your password"
        placeholderTextColor={"#C3C3C3"}
        value={password}
        onChangeText={setPassword}
        className="border-b-2 border-[#394879] text-white"
      />
      <View className="flex-row justify-end mt-[20px]">
        <TouchableHighlight onPress={closeModalHandler}>
          <View className="bg-[#393B44] px-[10px] py-[5px] mr-[10px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={createAccountHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Create</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const EmailSigninForm = ({ email, closeModalHandler }) => {
  const [password, setPassword] = useState();
  const navigation = useNavigation();
  const signinHandler = async () => {
    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    console.log("user: ", user);
    const { loginState, id } = await LoginService.Inst.firebaseQuickLogin();
    console.log("login result", loginState);
    // setLoginState(loginState);
    navigation.navigate("VerifyEmail", { loginState, id });
    closeModalHandler();
  };

  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[20px]">
        Sign in
      </Text>
      <Text className="text-[16px] font-bold text-white mb-[10px]">Email</Text>
      <TextInput
        placeholder="Please input your email address"
        placeholderTextColor={"#C3C3C3"}
        value={email}
        className="border-b-2 border-[#394879] text-white"
      />
      <Text className="text-[16px] font-bold text-white">Password</Text>
      <TextInput
        placeholder="Please input your password"
        placeholderTextColor={"#C3C3C3"}
        value={password}
        onChangeText={setPassword}
        className="border-b-2 border-[#394879] text-white"
      />
      <View className="flex-row justify-end mt-[20px]">
        <TouchableHighlight onPress={closeModalHandler}>
          <View className="bg-[#393B44] px-[10px] py-[5px] mr-[10px] rounded">
            <Text className="text-[#547AD5] text-center">Cancel</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight onPress={signinHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Sign in</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const GoogleSigninForm = ({ email, closeModalHandler }) => {
  const navigation = useNavigation();
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // Sign-in the user with the credential

    await auth().signInWithCredential(googleCredential);
    const { loginState, id } = await LoginService.Inst.firebaseQuickLogin();
    // console.log("google result; ", result);
    navigation.navigate("VerifyEmail", { id, loginState });
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
    </View>
  );
};

*/
