import { View, Text } from "react-native";
import { AvatarColorPlatte } from "../../assets/AvatarColorPlatte";
import { useState, useRef } from "react";

const Avatar = ({ tag, name }) => {
  const [fontSize, setFontSize] = useState(0);
  const avatarRef = useRef(null);

  const colorNumber = tag ? tag % 10 : 0;
  const avatarColor = AvatarColorPlatte[colorNumber] || "#FFFFFF"; // Default color, adjust as necessary

  const initLetter = name ? name[0] : "?"; // Fallback if no name is provided

  const handleLayout = (event) => {
    const width = event.nativeEvent.layout.width;
    setFontSize(0.4 * width); // Adjust 0.4 to another fraction if desired
  };

  return (
    <View
      ref={avatarRef}
      onLayout={handleLayout}
      className="w-[100%] h-[100%] justify-center items-center rounded-full"
      style={{ backgroundColor: avatarColor }}
    >
      <Text className="text-white font-bold" style={{ fontSize: fontSize }}>
        {initLetter}
      </Text>
    </View>
  );
};

export default Avatar;
