import {
  View,
  TextInput,
  TouchableHighlight,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  Pressable,
  Button,
  Image,
  ImageBackground,
} from "react-native";
import InputLayout from "../Components/InputLayout";
import { useState } from "react";
import AuthButton from "../Components/AuthButton";
import { loginRequest, saveData, loginCheck } from "../utils/auth";
import { useNavigation } from "@react-navigation/native";
import DataCenter from "../modules/DataCenter";
import { LesPlatformCenter, LesConstants } from "les-im-components";
import IMFunctions from "../utils/IMFunctions";
import LoginService from "../services/LoginService";
import Constants from "../modules/Constants";
import SigninButton from "../Components/SigninButton";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { firebase } from "@react-native-firebase/auth";
import { ValidateEmailModal } from "../Components/ValidateEmailModal";
import LoadingIndicator from "../Components/LoadingIndicator";

GoogleSignin.configure({
  webClientId:
    "537080417457-k01qk24drifnbv425r7c6al4u2a8qp62.apps.googleusercontent.com",
});

export default function LoginScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [emailSigninModalVisible, setEmailSigninModalVisible] = useState(false);

  const navigation = useNavigation();

  function updateEmailHandler(val) {
    setEmail(val);
  }

  function updatePasswordHandler(val) {
    setPassword(val);
  }

  const closeEmailSigninModal = () => {
    // console.log("sasasa");
    setEmailSigninModalVisible(false);
  };

  const openEmailSigninModal = () => {
    setEmailSigninModalVisible(true);
  };

  async function loginHandler() {
    setIsLoading(true);
    const loginService = LoginService.Inst;
    try {
      //尝试用户名密码登陆
      const result = await loginService.login(
        email,
        password,
        DataCenter.deviceName
      );
      console.log("login result: ", result);
      if (result.state == LesConstants.IMUserState.Init) {
        navigation.navigate("CreateName");
      } else {
        //TODO 跳转到主界面
        navigation.navigate("BottomTab");
      }
      setError(null);
    } catch (e) {
      if (e.type == null) {
        //TODO 处理未知错误
      } else if (e.type == Constants.LoginExceptionType.AccountCenterError) {
        setError(e.msg);
      } else if (e.type == Constants.LoginExceptionType.IMServerError) {
        //TODO 根据e.code进行提示，e.code = LesConstants.ErrorCodes
        console.log("im connect fail response: ", e);
      }
    }
    setIsLoading(false);
  }

  //没用了
  async function loginHandler_old() {
    setIsLoading(true);
    console.log("Device Name: ", DataCenter.deviceName);
    try {
      const response = await loginRequest(
        email,
        password,
        DataCenter.deviceName
      );
      console.log(response);
      const data = response.data;
      if (data.code === 0) {
        setError(null);
        const { accountId, msg } = data.retObject;
        // console.log("token: ", msg, typeof msg);
        /*
          如果用户没有设置用户名
          进入设置用户名界面
          在设置名字之后再发送登陆成功事件
        */
        try {
          const imResponse = await IMFunctions.connectIMServer(
            accountId,
            msg.toString(),
            DataCenter.deviceName
          );
          console.log("im connect success response: ", imResponse);
          if (imResponse.state == LesConstants.IMUserState.Init) {
            navigation.navigate("CreateName");
          } else {
            //发送登陆成功事件, 进入主界面
            DataCenter.setLogin(accountId, email, msg);

            // 将accountId, Loginkey等存入secureStorage
            await Promise.all(
              saveData("accountId", accountId),
              saveData("loginKey", msg),
              saveData("email", email)
            );
          }
        } catch {
          (e) => {
            console.log("im connect fail response: ", e);
          };
        }
      } else {
        setError(data.msg);
      }
    } catch (e) {
      console.log("login error: ", e);
    }
    setIsLoading(false);
  }

  function navigateToSignup() {
    navigation.navigate("Signup");
  }

  async function onGoogleButtonPress() {
    setIsLoading(true);
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // Sign-in the user with the credential

    await auth().signInWithCredential(googleCredential);
    const { loginState, id, imServerState } =
      await LoginService.Inst.firebaseQuickLogin();
    navigation.navigate("VerifyEmail", { id, loginState, imServerState });
    // console.log("google result; ", result);
    setIsLoading(false);
  }

  return (
    <View className="flex-1 justify-center w-[70vw] mx-auto">
      {/* {error && (
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
        <TouchableWithoutFeedback onPress={navigateToSignup}>
          <Text className="text-[#A18EF8] text-center font-bold text-[15px] underline">
            Sign up
          </Text>
        </TouchableWithoutFeedback>
      </View> */}
      {/* <View className="w-[60vw]"> */}
      <Image
        source={require("../../assets/img/logo-nexg.png")}
        className="mx-[auto] w-[250px] h-[100px] mb-[30px]"
      />
      {/* </View> */}

      <View className="items-center">
        <SigninButton
          socialType={Constants.SigninButtonType.Email}
          handler={openEmailSigninModal}
        />
        <SigninButton
          socialType={Constants.SigninButtonType.Google}
          handler={onGoogleButtonPress}
        />
        <SigninButton socialType={Constants.SigninButtonType.Twitter} />
      </View>
      <ValidateEmailModal
        emailSigninModalVisible={emailSigninModalVisible}
        closeEmailSigninModal={closeEmailSigninModal}
      />
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
}
