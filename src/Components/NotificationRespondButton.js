import Constants from "../modules/Constants";
import { TouchableOpacity, View, Text } from "react-native";
import { Entypo } from "@expo/vector-icons";

const NotificationRespondButton = ({ handler, type }) => {
  const bgColor =
    type === Constants.Notification.ResponseType.Accept ? "#58AE69" : "#505050";

  return (
    <TouchableOpacity onPress={handler}>
      <View
        className="rounded-3xl px-[10px] py-[5px]"
        style={{ backgroundColor: bgColor }}
      >
        <View className="flex-row items-center">
          {type === Constants.Notification.ResponseType.Accept ? (
            <Entypo name="check" size={18} color="white" />
          ) : type === Constants.Notification.ResponseType.Decline ? (
            <Entypo name="cross" size={18} color="white" />
          ) : (
            <></>
          )}
          <Text className="font-bold text-white">{type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationRespondButton;
