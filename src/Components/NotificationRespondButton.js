import Constants from "../modules/Constants";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { Entypo } from "@expo/vector-icons";

const NotificationRespondButton = ({ handler, type, isLoading }) => {
  const bgColor =
    type === Constants.Notification.ResponseType.Accept ? "#58AE69" : "#505050";

  return (
    <TouchableOpacity disabled={isLoading} onPress={handler}>
      <View
        className="rounded-3xl w-[100px] items-center justify-center h-[30px]"
        style={{ backgroundColor: bgColor }}
      >
        <View className="flex-row items-center">
          {isLoading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : type === Constants.Notification.ResponseType.Accept ? (
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
