import { View } from "react-native";
import { LesConstants } from "les-im-components";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

export const StateIndicator = ({ state, onlineState, bgColor, size }) => {

  const bgStyle = bgColor == null ? {} : { backgroundColor: bgColor }

  return <View className="flex justify-center items-center rounded-full" style={bgStyle}>
    <StateIcon state={state} onlineState={onlineState} size={size} />
  </View>
};
const StateIcon = ({ state, onlineState, size }) => {
  const s = size == null ? 18 : size;
  switch (state) {
    case LesConstants.IMUserOnlineState.Offline:
      //return <MaterialIcons name="stop-circle" size={s} color="#605D6A" />
      return <OfflineIndicator size={size} />
    // case LesConstants.IMUserOnlineState.MobileOnline:
    //   return <Entypo name="mobile" size={20} color="white" />;
    // case LesConstants.IMUserOnlineState.MobileBackground:
    //   return <Entypo name="mobile" size={20} color="green" />;
    case LesConstants.IMUserState.Away:
      return <MaterialIcons name="timelapse" size={s} color="#F6AB3B" />
    case LesConstants.IMUserState.Busy:
      return <MaterialIcons name="do-not-disturb-on" size={s} color="#FB3D76" />
    case LesConstants.IMUserState.Online:
      // if (onlineState == LesConstants.IMUserOnlineState.MobileBackground) {
      //   //移动设备后台在线
      //   return <View className="flex justify-center items-center rounded-full bg-clr-bgdark" style={{ width: s, height: s }}>
      //     <View className="flex justify-center items-center rounded-full bg-[#5EB857]" style={{ width: s - 4, height: s - 4 }}>
      //       <Ionicons name="ios-phone-portrait" size={s - 6} color="white" />
      //     </View>
      //   </View>
      // }
      return <MaterialIcons name="stop-circle" size={s} color="#5EB857" />
    case LesConstants.IMUserState.Hiding:
      //return <MaterialIcons name="stop-circle" size={s} color="#605D6A" />
      return <OfflineIndicator size={size} />
    default:
      break;
  }
}

const OfflineIndicator = ({ size }) => {
  const s = size == null ? 18 : size;
  const style = { width: s - 5, height: s - 5 }
  return <View className="flex justify-center items-center bg-clr-bgdark rounded-full" style={{ width: s, height: s }}>
    <View className="bg-clr-bgdark rounded-full border-[2px] border-[#605D6A]" style={style} />
  </View>
};

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
