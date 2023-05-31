import { View, Text } from "react-native";

export default function InputLayout({ label, children }) {
  // console.log(label);
  return (
    <View className="flex-row items-center mb-[10px]">
      <Text className="text-white flex-1">{label}</Text>
      <View className="bg-[#414141] w-[65%] p-[5px] rounded">{children}</View>
    </View>
  );
}
