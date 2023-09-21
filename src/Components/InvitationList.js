import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { LesConstants } from "les-im-components";
import NotificationService from "../services/NotificationService";
import Constants from "../modules/Constants";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";

export default function InvitationList({ item }) {
  console.log("ttt: ", item);
  const onRespondHandler = (notificationId, response) => {
    NotificationService.Inst.respondInvitation(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const InvitationLayout = ({ type, avatar, name, children }) => (
    <View className="bg-[#262F38] rounded-lg overflow-hidden">
      <View className="bg-[#1A1E22] h-[30px] pl-[10px] justify-center">
        <Text className="text-white font-bold">
          {type === LesConstants.IMNotificationType.FriendInvitation
            ? "Friend Request"
            : "Group Invitation"}
        </Text>
      </View>
      <View className="flex-row justify-between items-center px-[10px]">
        <View className="flex-row items-center">
          <View className="h-[50px] w-[50px] justify-center">
            {avatar}
          </View>
          <Text className="text-white font-bold text-[13px]">
            {type === LesConstants.IMNotificationType.FriendInvitation
              ? name
              : item.sender.name + " invites you"}
          </Text>
        </View>
        <View className="flex-row">{children}</View>
      </View>
    </View>
  );

  const SenderInvitation = ({ notificationId }) => (
    <InvitationLayout
      type={item.type}
      avatar={
        item.type == LesConstants.IMNotificationType.FriendInvitation ?
          <Avatar
            tag={item.recipient.tag}
            name={item.recipient.name}
            size={{ w: 25, h: 25, font: 12 }}
          /> : <Avatar
            tag={item.id}
            name={item.groupInfo.name}
            size={{ w: 30, h: 30, font: 15, groupMark: 10, groupMarkFont: 10 }}
            isGroup={true}
          />
      }
      name={item.recipient.name}
    >
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
    <InvitationLayout
      type={item.type}
      avatar={
        item.type == LesConstants.IMNotificationType.FriendInvitation ?
          <Avatar
            tag={item.sender.tag}
            name={item.sender.name}
            size={{ w: 25, h: 25, font: 12 }}
          /> : <Avatar
            tag={item.id}
            name={item.groupInfo.name}
            size={{ w: 30, h: 30, font: 15, groupMark: 12, groupMarkFont: 8 }}
            isGroup={true}
          />
      }
      name={item.sender.name}
    >
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
