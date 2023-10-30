import { View, Text } from "react-native";
import Divider from "../Divider";

const OptionLayout = ({ title, icon, children }) => {
  return (
    <View className="">
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-[5px] text-white text-[18px] font-bold">
          {title}
        </Text>
      </View>
      <View className="ml-[30px]">{children}</View>
      <Divider />
    </View>
  );
};

export default OptionLayout;
