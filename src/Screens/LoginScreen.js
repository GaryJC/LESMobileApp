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
import { useCallback, useEffect, useState } from "react";
import AuthButton from "../Components/AuthButton";
import { loginRequest, saveData, loginCheck } from "../utils/auth";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { Firebase } from "../utils/auth";

import { NativeModules } from "react-native";
import SocialSigninForm from "../Components/AuthForm/SocialSigninForm";
import { DialogButton, DialogModal } from "../Components/FeedbackModal";
import { diff } from "react-native-reanimated";
import Toast from 'react-native-toast-message';
import { TwitterAuth1Sheet } from "../Components/SocialAuth/TwitterSheets";
const { RNTwitterSignIn } = NativeModules;

GoogleSignin.configure({
  webClientId:
    "310675491806-d44rhdib9l46g9tg6qs6nsbn1a7hnl4c.apps.googleusercontent.com",
});

export default function LoginScreen() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [emailSigninModalVisible, setEmailSigninModalVisible] = useState(false);
  /**
   * @type {[differentLoginForm:"Google"|"Twitter"|"",setDifferentLoginForm:(value:"Google"|"Twitter"|"")=>null]}
   */
  const [differentLoginForm, setDifferentLoginForm] = useState("");
  const [pendingLogin, setPendingLogin] = useState(null);

  ///////
  const [showTwitterAuth, setShowTwitterAuth] = useState(false);
  const [twitterOAuthToken, setTwitterOAuthToken] = useState("");
  /////

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.loginFailed == true) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please try again later."
      })
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      navigation.navigate("Login");
    }
  }, [route.params?.loginFailed])

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

  const processDifferentCredential = (email, pendingCred, provider) => {
    setPendingLogin({ email: email, pendingCred: pendingCred })
    switch (provider) {
      case "google.com":
        setDifferentLoginForm("Google");
        break;
      case "twitter.com":
        setDifferentLoginForm("Twitter");
        break;
    }
  }

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
        navigation.navigate("MainNavigation");
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

  function onTwitterButtonPress() {
    setIsLoading(true);
    Firebase.Twitter.getToken().then(resp => {
      console.log(resp.data.data);
      setIsLoading(false);
      setTwitterOAuthToken(resp.data.data);
      setShowTwitterAuth(true);
    }).catch(e => {
      console.log(e);
      setIsLoading(false);
    })

    // Firebase.twitterSignin()
    //   .then(({ id, loginState, imServerState }) => {
    //     // setIsLoading(false);
    //     navigation.navigate("VerifyEmail", { id, loginState, imServerState });
    //   }).catch(e => {
    //     console.log(e);
    //     if (e.code == "auth/account-exists-with-different-credential") {
    //       processDifferentCredential(e.email, e.credential, e.provider);
    //     }
    //   })
    //   .finally(() => setIsLoading(false));
  }

  function firebaseTwitterSignin(token, tokenSecret) {
    setIsLoading(true);
    Firebase.twitterSignin1(token, tokenSecret)
      .then(({ id, loginState, imServerState }) => {
        // setIsLoading(false);
        navigation.navigate("VerifyEmail", { id, loginState, imServerState });
      }).catch(e => {
        console.log(e);
        if (e.code == "auth/account-exists-with-different-credential") {
          processDifferentCredential(e.email, e.credential, e.provider);
        }
      })
      .finally(() => setIsLoading(false));
  }

  async function onGoogleButtonPress() {
    setIsLoading(true);
    Firebase.googleSignin()
      .then(({ id, loginState, imServerState }) => {
        // setIsLoading(false);
        navigation.navigate("VerifyEmail", { id, loginState, imServerState });
      }).catch(e => {
        if (e.code == "auth/account-exists-with-different-credential") {
          processDifferentCredential(e.email, e.credential, e.provider);
        }
      })
      .finally(() => setIsLoading(false));
  }

  const onButtonPressed = useCallback((btn) => {
    if (btn.id == "cancel") {
      setDifferentLoginForm("");
      setPendingLogin({});
    } else {
      setIsLoading(true);
      switch (differentLoginForm) {
        case "Google":
          Firebase.googleSignin()
            .then(({ id, loginState, imServerState }) => {
              //绑定账号
              if (auth().currentUser.email == pendingLogin.email) {
                auth().currentUser.linkWithCredential(pendingLogin.pendingCred)
                  .then(r => {
                    console.log("link with credential ", r);
                  })
                  .catch(e => {
                    console.log("link with credential failed ", e)
                  }).finally(
                    () => {
                      navigation.navigate("VerifyEmail", { id, loginState, imServerState });
                    }
                  );
              }
            }).catch(e => {

            }).finally(() => {
              setIsLoading(false);
            });
          break;
        case "Twitter":
          break;
      }
    }
  }, [differentLoginForm, pendingLogin])

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
        <SigninButton
          socialType={Constants.SigninButtonType.Twitter}
          handler={onTwitterButtonPress}
        />
      </View>
      <ValidateEmailModal
        emailSigninModalVisible={emailSigninModalVisible}
        closeEmailSigninModal={closeEmailSigninModal}
      />
      <DialogModal
        visible={differentLoginForm != ""}
        title="You already have an account"
        content={`You have already used ${pendingLogin?.email}. Sign in with ${differentLoginForm} to continue`}
        buttons={[
          DialogButton.New("cancel", "Cancel", "normal", false),
          DialogButton.New(differentLoginForm, "Sign in with " + differentLoginForm, "primary", false)
        ]}
        onButtonPressed={btn => onButtonPressed(btn)}
      />
      <LoadingIndicator isLoading={isLoading} />

      <TwitterAuth1Sheet token={twitterOAuthToken} show={showTwitterAuth} onClosed={() => setShowTwitterAuth(false)}
        onRecvAuthData={(token, tokenSecret) => {
          firebaseTwitterSignin(token, tokenSecret);
        }} />
    </View>
  );
}
