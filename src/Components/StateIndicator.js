import { View } from "react-native";
import { LesConstants } from "les-im-components";

export const StateIndicator = ({ state }) => {
  switch (state) {
    case LesConstants.IMUserState.Away:
      return (
        <View className="bg-[#FF3737] w-[100%] h-[100%] rounded-full"></View>
      );
    case LesConstants.IMUserState.Busy:
      return (
        <View className="bg-[#FF3737] w-[100%] h-[100%] rounded-full"></View>
      );
    case LesConstants.IMUserState.Online:
      return (
        <View className="bg-[#5EB857] w-[100%] h-[100%] rounded-full"></View>
      );
    case LesConstants.IMUserState.Hiding:
      return (
        <View className="bg-[#FF3737] w-[100%] h-[100%] rounded-full"></View>
      );
    default:
      break;
  }
};
