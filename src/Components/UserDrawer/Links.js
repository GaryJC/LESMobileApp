import OptionLayout from "./OptionLayout";
import { View, Text } from "react-native";

const LinkButton = ({ title, icon, handler }) => {
  return (
    <View>
      <Text className="text-white font-bold">{title}</Text>
    </View>
  );
};

const Links = () => {
  return (
    <OptionLayout title={"Links"}>
      <LinkButton title={"Connect with X"} />
      <LinkButton title={"Connect with Discord"} />
    </OptionLayout>
  );
};

export default Links;
