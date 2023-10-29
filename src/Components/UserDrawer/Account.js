import { View, Text, Platform, Alert, TouchableOpacity } from "react-native";
import OptionLayout from "./OptionLayout";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DataCenter from "../../modules/DataCenter";
import { MaterialIcons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";

export const referralCodeCopyHandler = () => {
  Clipboard.setString(
    `https://www.nexgami.com?referralCode=${DataCenter.userInfo.userProfile.referralCode}`
  );
  if (Platform.OS === "ios") {
    Alert.alert("You have copied the referral link to clipboard!");
  }
};

const Account = () => {
  const icon = (
    <MaterialCommunityIcons
      name="account-circle-outline"
      size={24}
      color="white"
    />
  );

  const AccountInfo = ({ content, icon, children }) => (
    <View className="my-[5px] flex-row items-center">
      {icon}
      <Text className="text-white text-[16px]">{content}</Text>
      {children}
    </View>
  );

  const CopyButton = () => {
    return (
      <TouchableOpacity onPress={referralCodeCopyHandler} className="ml-[10px]">
        <MaterialIcons name="file-copy" size={20} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <OptionLayout title={"Account"} icon={icon}>
      <AccountInfo content={DataCenter.userInfo.userProfile.email} />
      <AccountInfo
        content={`Referral Code: ${DataCenter.userInfo.userProfile.referralCode}`}
      >
        <CopyButton />
      </AccountInfo>
    </OptionLayout>
  );
};

export default Account;
