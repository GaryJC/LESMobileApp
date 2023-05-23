import { TouchableHighlight, View, Text } from "react-native";

export default function AuthButton({ onPressHandler, title }) {
  return (
    <TouchableHighlight
      className="rounded-lg overflow-hidden"
      onPress={onPressHandler}
    >
      <View className="items-center bg-[#5EB857] p-[10px]">
        <Text className="text-white font-bold">{title}</Text>
      </View>
    </TouchableHighlight>
  );
}
