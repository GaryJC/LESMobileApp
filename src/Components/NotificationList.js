import { Image, Text, View } from "react-native";
import Constants from "../modules/Constants";
import { Notification } from "../Models/Notifications";
import { Ionicons } from '@expo/vector-icons';
import { LesConstants, LesPlatformCenter } from "les-im-components";
import formatDate from "../utils/formatDate";
import { TouchableHighlight } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import NotificationService from "../services/NotificationService";

const { IMNotificationState } = LesConstants;
/**
 * 
 * @param {{item:Notification}} param0 
 */
const NotificationItem = ({ item, onPress }) => {
  return <TouchableHighlight className="rounded-md" onPress={() => {
    onPress?.call(this, item);
  }}>
    <View className="flex flex-row m-1">
      <View>
        <Image source={Constants.Icons.getSystemIcon(item.sender.id)} className="rounded-full w-[40px] h-[40px]" />
        <View className="absolute right-[-4px] top-[26px] rounded-sm bg-clr-bgdark px-[1px]">
          {item.state == IMNotificationState.Unread
            ? <Ionicons name="mail-unread" size={16} color="white" />
            : <Ionicons name="mail-open" size={16} color="white" />}
        </View>
      </View>
      <View className="flex ml-[10px] flex-1">
        <Text className="text-sm text-white font-bold">{item.sender.name}</Text>
        <Text className="text-sm text-white">{item.content.title}</Text>
      </View>
      <Text className="text-white text-[12px]">
        {formatDate(new Date(item.time), {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
        })}
      </Text>
    </View>
  </TouchableHighlight>
}

export default function NotificationList({ item }) {
  const nav = useNavigation();
  return (
    <View className="my-[5px]">
      <NotificationItem item={item} onPress={
        () => {
          nav.navigate('NotificationDetail', {
            notification: item
          })
          if (item.state == IMNotificationState.Unread) {
            NotificationService.Inst.setSystemNotificationOpened(item.id);
          }
        }
      } />
    </View>
  );
}
