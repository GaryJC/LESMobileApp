import { View } from "react-native";
import { LesConstants } from "les-im-components";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

export const StateIndicator = ({ state, onlineState }) => {
  console.log("state ", state, onlineState);
  switch (state) {
    case LesConstants.IMUserOnlineState.Offline:
      return <OfflineIndicator />;
    case LesConstants.IMUserState.Away:
      return <Ionicons name="moon" size={20} color="#F6AB3B" />;
    case LesConstants.IMUserState.Busy:
      return (
        <MaterialIcons name="do-not-disturb-on" size={20} color="#FB3D76" />
      );
    case LesConstants.IMUserState.Online:
      return <View className="bg-[#5EB857] w-[17] h-[17] rounded-full" />;
    case LesConstants.IMUserState.Hiding:
      return <OfflineIndicator />;
    default:
      break;
  }
};

const OfflineIndicator = () => (
  <View className="bg-[#605D6A] w-[17] h-[17] rounded-full" />
);

export const makeStateReadable = (state) => {
  switch (state) {
    case LesConstants.IMUserState.Online:
      return "Online";
    case LesConstants.IMUserState.Busy:
      return "Busy";
    case LesConstants.IMUserState.Away:
      return "Away";
    case LesConstants.IMUserState.Hiding:
      return "Hiding";
    default:
      return "Init";
  }
};
