import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { LesConstants } from "les-im-components";
import NotificationService from "../services/NotificationService";
import Constants from "../modules/Constants";
import { Entypo } from "@expo/vector-icons";
import Avatar from "./Avatar";
import formatDate from "../utils/formatDate";
import NotificationRespondButton from "./NotificationRespondButton";

export default function InvitationList({ item }) {
  const onRespondHandler = (notificationId, response) => {
    NotificationService.Inst.respondInvitation(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const onCancelHandler = (notificationId) => {
    NotificationService.Inst.cancelInvitation(notificationId)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  const InvitationLayout = ({ type, avatar, user, name, children }) => (
    <View
    // className="bg-[#262F38] rounded-lg overflow-hidden"
    >
      <Text className="text-white font-bold">
        {type === LesConstants.IMNotificationType.FriendInvitation
          ? "New Friend Request"
          : "New Group Invitation"}
      </Text>
      <View className="flex-row justify-between items-center pt-[10px]">
        <View className="flex-row items-center">
          <View className="h-[40px] w-[40px] justify-center">{avatar}</View>
          <View className="ml-[10px]">
            {type === LesConstants.IMNotificationType.GroupInvitation && (
              <Text className="text-white font-bold">
                {item.groupInfo.name}
              </Text>
            )}
            <Text className="text-white">
              {type === LesConstants.IMNotificationType.FriendInvitation
                ? `${user.name}#${user.tag}`
                : `Invited by ${user.name}#${user.tag}`}
            </Text>
          </View>
        </View>
        <Text className="text-white text-[12px]">
          {formatDate(new Date(item.time), {
            month: "2-digit",
            day: "2-digit",
          })}
        </Text>
      </View>
      <View className="flex-row justify-end">{children}</View>
    </View>
  );

  const SenderInvitation = ({ notificationId }) => (
    <InvitationLayout
      type={item.type}
      avatar={
        item.type == LesConstants.IMNotificationType.FriendInvitation ? (
          <Avatar
            tag={item.recipient.tag}
            name={item.recipient.name}
            size={{ w: 40, h: 40, font: 15 }}
          />
        ) : (
          <Avatar
            tag={item.id}
            name={item.groupInfo.name}
            size={{ w: 30, h: 30, font: 15, groupMark: 10, groupMarkFont: 10 }}
            isGroup={true}
          />
        )
      }
      // name={item.recipient.name}
      user={item.recipient}
    >
      <NotificationRespondButton
        type={Constants.Notification.ResponseType.Cancel}
        handler={() => onCancelHandler(notificationId)}
      />
    </InvitationLayout>
  );

  const RecipientInvitation = ({ notificationId }) => (
    <InvitationLayout
      type={item.type}
      avatar={
        item.type == LesConstants.IMNotificationType.FriendInvitation ? (
          <Avatar
            tag={item.sender.tag}
            name={item.sender.name}
            size={{ w: 40, h: 40, font: 15 }}
          />
        ) : (
          <Avatar
            tag={item.id}
            name={item.groupInfo.name}
            size={{ w: 30, h: 30, font: 15, groupMark: 12, groupMarkFont: 8 }}
            isGroup={true}
          />
        )
      }
      // name={item.sender.name}
      user={item.sender}
    >
      <View className="mr-[5px]">
        <NotificationRespondButton
          type={Constants.Notification.ResponseType.Accept}
          handler={() =>
            onRespondHandler(
              notificationId,
              LesConstants.IMNotificationState.Accepted
            )
          }
        />
      </View>

      <NotificationRespondButton
        type={Constants.Notification.ResponseType.Decline}
        handler={() =>
          onRespondHandler(
            notificationId,
            LesConstants.IMNotificationState.Rejected
          )
        }
      />
    </InvitationLayout>
  );

  return (
    <View className="my-[5px]">
      {item.mode === Constants.Notification.NotificationMode.Sender ? (
        <SenderInvitation notificationId={item.id} />
      ) : (
        <RecipientInvitation notificationId={item.id} />
      )}
    </View>
  );
}
