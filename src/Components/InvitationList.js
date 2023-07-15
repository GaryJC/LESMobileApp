import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import DataCenter from "../modules/DataCenter";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import NotificationService from "../services/NotificationService";
import Constants from "../modules/Constants";
import { Ionicons } from "@expo/vector-icons";

export default function InvitationList({ item }) {
  console.log("item: ", item);

  const onRespondHandler = (notificationId, response) => {
    console.log("noti, response: ", notificationId, response);
    // LesPlatformCenter.IMFunctions.respondNotification(notificationId, response)
    NotificationService.Inst.respondFriendInvitation(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const InvitationLayout = ({ children }) => (
    <View className="bg-[#131F2A] rounded-lg p-[15px]">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Image
            source={{ uri: `https://i.pravatar.cc/?img=${item.sender.id}` }}
            className="w-[50px] h-[50px] rounded-full"
          />
          <Text className="text-white font-bold text-[16px] pl-[10px]">
            {item.sender.name}
          </Text>
        </View>
        <View className="flex-row">{children}</View>
      </View>
    </View>
  );

  const SenderInvitation = ({ notificationId }) => (
    <InvitationLayout>
      <TouchableHighlight
        onPress={() =>
          onRespondHandler(
            notificationId,
            LesConstants.IMNotificationState.Canceled
          )
        }
      >
        <View>
          <Text className="text-white font-bold">Cancel</Text>
        </View>
      </TouchableHighlight>
    </InvitationLayout>
  );

  const RecipientInvitation = ({ notificationId }) => (
    <InvitationLayout>
      <TouchableOpacity
        onPress={() =>
          onRespondHandler(
            notificationId,
            LesConstants.IMNotificationState.Accepted
          )
        }
        className="pr-[5px]"
      >
        <Ionicons name="checkmark-circle" size={34} color="green" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          onRespondHandler(
            notificationId,
            LesConstants.IMNotificationState.Rejected
          )
        }
      >
        <Ionicons name="close-circle" size={34} color="grey" />
      </TouchableOpacity>
    </InvitationLayout>
  );

  return (
    <View className="mx-[5vw] py-[5px]">
      {item.mode === Constants.Notification.NotificationMode.sender ? (
        <SenderInvitation notificationId={item.id} />
      ) : (
        <RecipientInvitation notificationId={item.id} />
      )}
    </View>
  );
}
