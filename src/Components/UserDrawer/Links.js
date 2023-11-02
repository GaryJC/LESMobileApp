import OptionLayout from "./OptionLayout";
import { View, Text, Image, TouchableHighlight } from "react-native";
import { Entypo } from "@expo/vector-icons";

const LinkButton = ({ title, icon, handler }) => {
  return (
    <TouchableHighlight
      className="my-[5px] overflow-hidden rounded-xl"
      onPress={() => console.log("")}
    >
      <View className="px-[15px] py-[10px] bg-clr-bglight flex-row items-center justify-between">
        <Text className="text-white text-[16px] font-bold">{title}</Text>
        <Image className="w-[30px] h-[30px]" source={icon} />
      </View>
    </TouchableHighlight>
  );
};

const Links = () => {
  const icon = <Entypo name="link" size={24} color="white" />;
  return (
    <OptionLayout title={"Links"} icon={icon} childStyle={{ marginLeft: 0 }}>
      <LinkButton
        title={"Connect with X"}
        icon={require("../../../assets/img/twitter_X.png")}
      />
      <LinkButton
        title={"Connect with Discord"}
        icon={require("../../../assets/img/discord_icon.png")}
      />
    </OptionLayout>
  );
};

export default Links;
