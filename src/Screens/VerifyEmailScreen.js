import { View, Text } from "react-native";
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
    // if(loginState === Constants.LoginState.Normal && serverState===LesConstants.ErrorCodes.NeedSetNameFirst){
    //   navigation.navigate("CreateName")
    // }else if(loginState === Constants.LoginState.Normal&&serverState===LesConstants.ErrorCodes.Success)
    if (loginState === Constants.LoginState.Normal) {
      navigation.navigate("BottomTab");
    }
    setLoginState(loginState);
  }, []);

  const userId = route.params?.id;

  return (
    <View className="flex-1 justify-center">
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
  );
};
