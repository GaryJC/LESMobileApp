import { View, Text, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../modules/Constants";
import { useEffect, useState } from "react";
import { firebase } from "@react-native-firebase/auth";
import LoginService from "../services/LoginService";
import SetReferrerForm from "../Components/AuthForm/SetReferrerForm";
import VerifyEmailForm from "../Components/AuthForm/VerifyEmailFrom";
import LoadingIndicator from "../Components/LoadingIndicator";
import { LesConstants } from "les-im-components";

export const VerifyEmailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [userToken, setUserToken] = useState();
  const [loginState, setLoginState] = useState();

  useEffect(() => {
    const getToken = async () => {
      const token = await firebase.auth().currentUser.getIdToken();
      setUserToken(token);
    };
    getToken();

    const loginState = route.params?.loginState;
    const serverState = route.params?.imServerState;
    // check imServerState
    if (loginState == Constants.LoginState.Logout) {
      //登陆失败了
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Login",
            params: {
              loginFailed: true,
              loginState,
              imServerState: serverState,
            },
          },
        ],
      });
      // navigation.navigate("Login", { loginFailed: true, loginState, imServerState: serverState });
    } else {
      if (loginState == Constants.LoginState.Normal) {
        //Account服务器正常登陆
        if (serverState == LesConstants.IMUserState.Init) {
          //需要设置名字
          navigation.navigate("CreateName");
        } else if (serverState > LesConstants.IMUserState.Hiding) {
          //IM服务器登录错误
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Login",
                params: {
                  loginFailed: true,
                  loginState,
                  imServerState: serverState,
                },
              },
            ],
          });
          // navigation.navigate("Login", { loginFailed: true, loginState, imServerState: serverState });
        } else {
          //正常登陆，转到主界面
          //navigation.reset({ index: 0, routes: [{ name: "MainNavigation" }] });
          navigation.navigate("MainNavigation");
        }
      }
    }

    // if (
    //   loginState === Constants.LoginState.Normal &&
    //   serverState === LesConstants.IMUserState.Init
    // ) {
    //   navigation.navigate("CreateName");
    //   // }else if(loginState === Constants.LoginState.Normal&&serverState===LesConstants.ErrorCodes.Success)
    // } else if (loginState === Constants.LoginState.Normal) {
    //   navigation.navigate("MainNavigation");
    // }
    setLoginState(loginState);
  }, [route.params?.loginState]);

  const userId = route.params?.id;

  return (
    <View className="flex-1 justify-center">
      <View className="mb-[20vh]">
        <Image
          source={require("../../assets/img/logo-nexg.png")}
          className="mx-[auto] w-[250px] h-[100px] mb-[30px] relative"
        />
        <View className="bg-[#2A2C37] p-[20px]">
          {loginState == Constants.LoginState.VerifyEmail ? (
            <VerifyEmailForm
              userToken={userToken}
              userId={userId}
              setLoginState={setLoginState}
            />
          ) : loginState == Constants.LoginState.UpdateReferrer ? (
            <SetReferrerForm userToken={userToken} />
          ) : (
            <Text className="text-white">{loginState}</Text>
          )}
        </View>
      </View>
    </View>
  );
};
