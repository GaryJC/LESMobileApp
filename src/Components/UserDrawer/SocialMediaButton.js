import { View, Image, TouchableOpacity, Linking } from "react-native";
import Constants from "../../modules/Constants";

const socialIcons = [
  Constants.Icons.getSystemIcon("telegram"),
  Constants.Icons.getSystemIcon("twitter"),
  Constants.Icons.getSystemIcon("discord"),
]

const socialLinks = [
  "https://t.me/NexGami",
  "https://twitter.com/nexgami",
  "https://discord.com/invite/8JP8YXVwR5"
]

const SocialType = {
  Telegram: 0,
  Twitter: 1,
  Discord: 2
}

const onClick = (type) => {
  Linking.openURL(socialLinks[type]);
}

const SocialMedia = () => {
  const SocialMediaButton = ({ type }) => (
    <TouchableOpacity onPress={() => onClick(type)}>
      <View className="bg-clr-bglight p-[10px] rounded-xl">
        <Image source={socialIcons[type]} className="w-[30px] h-[30px]" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-row justify-evenly mt-4">
      <SocialMediaButton type={SocialType.Telegram} />
      <SocialMediaButton type={SocialType.Twitter} />
      <SocialMediaButton type={SocialType.Discord} />
    </View>
  );
};

export default SocialMedia;
