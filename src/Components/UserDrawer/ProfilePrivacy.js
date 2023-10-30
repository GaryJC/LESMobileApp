import OptionLayout from "./OptionLayout";
import { View, Text } from "react-native";

const ProfilePrivacy = () => {
  return (
    <OptionLayout title={"Profile Privacy"}>
      <Text>Who can see my profile</Text>
    </OptionLayout>
  );
};

export default ProfilePrivacy;
