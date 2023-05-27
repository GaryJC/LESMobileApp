import {
  TouchableHighlight,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

export default function AuthButton({ onPressHandler, title, isLoading }) {
  return (
    <TouchableHighlight
      className="rounded-lg overflow-hidden"
      onPress={onPressHandler}
      disabled={isLoading}
    >
      <View className="items-center bg-[#5EB857] p-[10px]">
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Text className="text-white font-bold">{title}</Text>
        )}
      </View>
    </TouchableHighlight>
  );
}
