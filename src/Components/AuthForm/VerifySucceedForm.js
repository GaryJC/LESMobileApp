import { View, Text, TextInput, TouchableHighlight } from "react-native";
import Constants from "../../modules/Constants";
import { FontAwesome } from "@expo/vector-icons";
import HighlightButton from "../HighlightButton";

const VerifySucceedForm = ({ setLoginState, email }) => {
  const clickNextHandler = () => {
    setLoginState(Constants.LoginState.UpdateReferrer);
  };
  return (
    <View>
      <Text className="text-white text-[18px] font-bold mb-[10px]">
        Verify Email
      </Text>
      <Text className="text-[#C6C6C6] text-[16px] font-bold">{email}</Text>
      <View className="flex-row items-center mt-[10px]">
        <FontAwesome name="check-circle" size={64} color="green" />
        <Text className="ml-[20px] text-[16px] font-bold text-white">
          Verify Successfully!
        </Text>
      </View>

      <View className="flex-row justify-end">
        {/* <TouchableHighlight onPress={clickNextHandler}>
          <View className="bg-[#4C89F9] px-[10px] py-[5px] rounded">
            <Text className="text-white text-center">Next</Text>
          </View>
        </TouchableHighlight>*/}
        <HighlightButton type="primary" text="Next" onPress={clickNextHandler} />
      </View>

    </View>
  );
};

export default VerifySucceedForm;
