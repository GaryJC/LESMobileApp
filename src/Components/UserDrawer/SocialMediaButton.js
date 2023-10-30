import { View, Image, TouchableOpacity } from "react-native";

const SocialMedia = () => {
  const SocialMediaButton = ({ image }) => (
    <TouchableOpacity>
      <Image source={image} className="w-[35px] h-[35px]" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-row justify-evenly">
      <SocialMediaButton
        image={require("../../../assets/img/telegram_icon.png")}
      />
      <SocialMediaButton image={require("../../../assets/img/twitter_X.png")} />
      <SocialMediaButton
        image={require("../../../assets/img/discord_icon.png")}
      />
    </View>
  );
};

export default SocialMedia;
