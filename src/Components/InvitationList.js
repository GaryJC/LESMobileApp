import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { LesConstants } from "les-im-components";
import NotificationService from "../services/NotificationService";
import Constants from "../modules/Constants";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";

export default function InvitationList({ item }) {
  const onRespondHandler = (notificationId, response) => {
    NotificationService.Inst.respondInvitation(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const InvitationLayout = ({ type, children }) => (
    <View className="bg-[#262F38] rounded-lg overflow-hidden">
      <View className="bg-[#1A1E22] h-[30px] pl-[10px] justify-center">
        <Text className="text-white font-bold">
          {type === LesConstants.IMNotificationType.FriendInvitation
            ? "Friend Request"
            : "Group Invitation" + ` [${item.groupInfo.name}]`}
        </Text>
      </View>
      <View className="flex-row justify-between items-center px-[10px]">
        <View className="flex-row items-center">
          <View className="h-[50px] w-[50px] justify-center">
            {type === LesConstants.IMNotificationType.FriendInvitation ? (
              <Avatar
                tag={item.sender.tag}
                name={item.sender.name}
                size={{ w: 25, h: 25, font: 10 }}
              />
            ) : (
              <Avatar
                tag={item.id}
                name={item.groupInfo.name}
                size={{ w: 25, h: 25, font: 10 }}
              />
            )}
          </View>
          <Text className="text-white font-bold text-[13px]">
            {type === LesConstants.IMNotificationType.FriendInvitation
              ? item.recipient.name
              : item.sender.name + " invites you"}
          </Text>
        </View>
        <View className="flex-row">{children}</View>
      </View>
    </View>
  );

  const SenderInvitation = ({ notificationId }) => (
    <InvitationLayout type={item.type}>
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
    <InvitationLayout type={item.type}>
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
    <View className="mb-[10px]">
      {item.mode === Constants.Notification.NotificationMode.Sender ? (
        <SenderInvitation notificationId={item.id} />
      ) : (
        <RecipientInvitation notificationId={item.id} />
      )}
    </View>
  );
}
