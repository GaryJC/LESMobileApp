import OptionLayout from "./OptionLayout";
import { View, Text } from "react-native";
import BouncyCheckboxGroup from "react-native-bouncy-checkbox-group";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import DataCenter from "../../modules/DataCenter";
import { LesConstants } from "les-im-components";

const { IMPrivacyScope } = LesConstants;

const ScopeTitle = [
  "",
  "Public",
  "Friends",
  "Only Me"
]

const CheckboxBtns = [
  { id: IMPrivacyScope.Public.toString(), text: ScopeTitle[IMPrivacyScope.Public] },
  { id: IMPrivacyScope.Friends.toString(), text: ScopeTitle[IMPrivacyScope.Friends] },
  { id: IMPrivacyScope.OnlyMe.toString(), text: ScopeTitle[IMPrivacyScope.OnlyMe] },
]

const ProfilePrivacy = () => {

  const icon = (
    <MaterialCommunityIcons name="account-lock" size={24} color="white" />
  );

  const [privacySetting, setPrivacySetting] = useState({});

  useEffect(() => {
    setPrivacySetting(DataCenter.userInfo.userSetting.privacySetting);
  }, [DataCenter.userInfo.userSetting.privacySetting])

  const onScopeChanged = item => {
    const p = { ...privacySetting, profileScope: item.id };
    setPrivacySetting(p);
    DataCenter.userInfo.userSetting.updatePrivacySetting(p);
  }

  return (
    <OptionLayout title={"Profile Privacy"} icon={icon}>
      <Text className="text-clr-gray-light my-[5px] font-bold text-base">
        Who can see my profile
      </Text>

      <BouncyCheckboxGroup
        initial={privacySetting.profileScope?.toString()}
        data={CheckboxBtns}
        style={{ flexDirection: "column" }}
        onChange={onScopeChanged}
        checkboxProps={{
          fillColor: "#33BB33",
          innerIconStyle: { borderWidth: 2 },
          style: {
            justifyContent: "space-between",
            flexDirection: "row-reverse",
            marginTop: 5,
          },
          textStyle: {
            textDecorationLine: "none",
            color: "#D9D9D9",
          },
          textContainerStyle: {
            marginLeft: 0,
          }
        }}
      />

    </OptionLayout>
  );
};

export default ProfilePrivacy;
