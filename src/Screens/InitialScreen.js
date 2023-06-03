import { View, Image, ActivityIndicator } from "react-native";

export default function InitialScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-[#080F14]">
      <Image
        className="w-[250] h-[250]"
        source={require("../../assets/img/logo_les.png")}
      />
      <ActivityIndicator className="mt-[50px]" size="large" color="#9176F7" />
    </View>
  );
}
