import { TouchableOpacity, View, Text } from "react-native";

const TabButton = ({ type, selectedTab, title, handler, children }) => (
  <TouchableOpacity className="flex-1" onPress={() => handler(type)}>
    <View
      className={
        selectedTab === type
          ? "h-[100%] rounded-lg bg-[#535F6A] justify-center"
          : ""
      }
    >
      <View className="flex-row items-center justify-center">
        <Text className="text-white font-bold text-center">{title}</Text>
        {children}
      </View>
    </View>
  </TouchableOpacity>
);

export default TabButton;
