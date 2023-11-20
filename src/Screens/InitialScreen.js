import { View, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import LoginService from "../services/LoginService";
import { LesConstants } from "les-im-components";
import ServiceCenter from "../services/ServiceCenter";
import JSEvent from "../utils/JSEvent";
import Constants from "../modules/Constants";

const { LoginState } = Constants;

const onAppInit = async () => {
  await ServiceCenter.Inst.loadAllServices();
};

export default function InitialScreen() {
  const navigation = useNavigation();

  const reloginFailedHandler = (state) => {
    console.log("rrrrr: ", state);
  };

  useEffect(() => {
    async function asyncInit() {
      //等待所有服务装载完毕
      // setIsInitializing(true);
      await onAppInit();
      console.log("all services loaded");
      const loginService = LoginService.Inst;
      const { id, loginState, imServerState } =
        await loginService.firebaseQuickLogin();
      console.log("firebase login result: ", id, loginState, imServerState);

      //根据result.loginState决定显示哪个页面(注册、验证邮箱、设置referrer)

      switch (loginState) {
        case LoginState.Logout:
          //快速登录失败，跳到LoginScreen
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          // navigation.navigate("Login");
          break;
        case LoginState.Normal:
          //登陆成功了，跳转到主界面
          //连接IM Server
          if (imServerState === LesConstants.IMUserState.Init) {
            navigation.reset({ index: 0, routes: [{ name: "CreateName" }] });
            // navigation.navigate("CreateName");
          } else if (imServerState > LesConstants.IMUserState.Hiding) {
            //错误信息
            navigation.reset({ index: 0, routes: [{ name: "Login",params:{ loginFailed: true, loginState, imServerState } }] });
            // navigation.navigate("Login", { loginFailed: true, loginState, imServerState });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainNavigation" }],
            });
            //navigation.navigate("MainNavigation");
          }
          break;
        case LoginState.VerifyEmail:
          //跳转到验证邮箱界面
          navigation.reset({ index: 0, routes: [{ name: "VerifyEmail",params:{ id, loginState } }] });
          // navigation.navigate("VerifyEmail", { id, loginState });
          break;
        case LoginState.UpdateReferrer:
          //跳转到更新推荐人界面
          navigation.reset({ index: 0, routes: [{ name: "VerifyEmail",params: { id, loginState } }] });
          // navigation.navigate("VerifyEmail", { id, loginState });
          break;
      }

      // navigation.navigate("Login");

      //旧的逻辑，废弃
      //const quickLogin = await loginService.canQuickLogin();

      //缓存中有登录信息，可以快速登录
      /*
      if (quickLogin) {
        const result = await loginService.quickLogin();
        console.log("result: ", result);
        if (result == LesConstants.ErrorCodes.Success) {
          //TODO 登陆成功了，跳转到主界面
          navigation.navigate("BottomTab");
          // setLogin();
        } else {
          //TODO 快速登陆失败了，跳转到LoginScreen
          navigation.navigate("Login");
        }
      } else {
        //TODO 没有登录信息，跳转到LoginScreen
        navigation.navigate("Login");
      }
      */
      // setIsInitializing(false);
    }

    asyncInit();

    // JSEvent.on(DataEvents.User.UserState_Relogin, reloginFailedHandler);

    return () => {
      //onAppDestroyed();
      // JSEvent.remove(DataEvents.User.UserState_Relogin);
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-[#080F14]">
      <Image
        className="w-[250] h-[100]"
        source={require("../../assets/img/logo-nexg.png")}
      />
      <ActivityIndicator className="mt-[50px]" size="large" color="#9176F7" />
    </View>
  );
}
