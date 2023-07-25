import { View, Text } from "react-native";
import { AvatarColorPlatte } from "../../assets/AvatarColorPlatte";
const Avatar = ({ tag, name }) => {
  const colorNumber = tag && tag % 10;
  const avatarColor = AvatarColorPlatte[colorNumber];

  const initLetter = name && name[0];
  return (
    <View
      className={"w-[100%] h-[100%] justify-center items-center rounded-full"}
      style={{ backgroundColor: avatarColor }}
    >
      <Text className="text-white font-bold text-[20px]">{initLetter}</Text>
    </View>
  );
};

export default Avatar;
