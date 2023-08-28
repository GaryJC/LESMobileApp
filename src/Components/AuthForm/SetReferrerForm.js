import { View, Text, TextInput, TouchableHighlight } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import LoginService from "../../services/LoginService";
import { useState } from "react";
import LoadingIndicator from "../LoadingIndicator";

const SetReferrerForm = ({ userToken }) => {
  const [referralCode, setReferralCode] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const updateReferrerHandler = async () => {
    setIsLoading(true);
    try {
      const result = LoginService.Inst.firebaseUpdateReferrer(
        userToken,
        referralCode
      );
      if (result !== -1) {
        navigation.navigate("CreateName");
        // setLoginState(Constants.LoginState.Normal);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };
  return (
    <View>
      <Text className="text-white text-[18px] font-bold">
        Referral Code(Optional)
      </Text>
      <TextInput
        placeholder="Please input your referral code"
        placeholderTextColor={"#6A6E84"}
        value={referralCode}
        onChangeText={setReferralCode}
        className="mt-[20px] text-[16px] text-white"
      />
      <View className="flex-row justify-end mt-[20px]">
        <TouchableHighlight onPress={updateReferrerHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Next</Text>
          </View>
        </TouchableHighlight>
      </View>
      <LoadingIndicator isLoading={isLoading} />
    </View>
  );
};

export default SetReferrerForm;
