import { View, Image, TouchableOpacity } from "react-native";

const SocialMedia = () => {
  const SocialMediaButton = ({ image }) => (
    <TouchableOpacity>
      <View className="bg-clr-bglight p-[10px] rounded-xl">
        <Image source={image} className="w-[30px] h-[30px]" />
      </View>
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
