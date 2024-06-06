import { View, Text, Platform, Alert, TouchableOpacity, Image } from "react-native";
import OptionLayout from "./OptionLayout";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DataCenter from "../../modules/DataCenter";
import { MaterialIcons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import Constants from "../../modules/Constants";

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

  const providerId = DataCenter.userInfo.userProfile.providerId;
  let providerIcon = Constants.Icons.getProviderIcon(providerId);
/*   switch (providerId) {
    case "google.com":
      providerIcon = require("../../../assets/img/google.png");
      break;
    case "twitter.com":
      providerIcon = require("../../../assets/img/twitter_X.png");
      break;
    case "apple.com":
      providerIcon = require("../../../assets/img/apple_icon.png");
      break;
    default:
      providerIcon = require("../../../assets/img/icon-nexgami.png");
      break;
  } */

  providerIcon = <Image source={providerIcon} className="w-[24px] h-[24px] rounded-full" />

  const AccountInfo = ({ content, icon, children }) => (
    <View className="my-[5px] flex-row items-center">
      {icon == null ? null :
        <View className="bg-white p-[1px] rounded-full">
          {icon}
        </View>
      }
      <Text className="text-white text-[16px] ml-2 max-w-[80%]" numberOfLines={1}>{content}</Text>
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
      <AccountInfo content={DataCenter.userInfo.userProfile.email} icon={providerIcon} />
      <AccountInfo
        content={`Referral Code: ${DataCenter.userInfo.userProfile.referralCode}`}
      >
        <CopyButton />
      </AccountInfo>
    </OptionLayout>
  );
};

export default Account;
