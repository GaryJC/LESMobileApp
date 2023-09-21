import { LesConstants } from "les-im-components";
import { View, Text, TouchableOpacity } from "react-native";
import NotificationService from "../services/NotificationService";
import Avatar from "./Avatar";
import NotificationRespondButton from "./NotificationRespondButton";
import Constants from "../modules/Constants";

const GroupSelfSentInviteList = ({ item }) => {
  console.log("iip: ", item);
  const { data } = item;
  const groupId = item.id;
  const name = data[0].groupInfo.name;
  const recipients = data.map((item) => {
    return {
      notiId: item.id,
      name: item.recipient.name,
      tag: item.recipient.tag,
    };
  });

  const onRespondHandler = (notificationId) => {
    console.log("pp: ", notificationId);
    NotificationService.Inst.cancelInvitation(notificationId)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  return (
    <View className="my-[5px]">
      <View
      // className="flex-row items-center"
      // className="bg-[#1A1E22] h-[40px] px-[10px] flex-row items-center"
      >
        <Text className="text-white font-bold mb-[5px]">Group Invitation</Text>
        <View className="flex-row items-center">
          <View className="w-[40px] h-[40px] mr-[10px]">
            <Avatar
              tag={groupId}
              name={name}
              size={{ w: 40, h: 40, font: 15 }}
              isGroup={true}
            />
          </View>
          <Text className="text-white font-bold">{name}</Text>
        </View>
      </View>
      {recipients.map((item) => (
        <View
          key={item.notiId}
          className="flex-row justify-between items-center mb-[5px]"
        >
          <Text className="text-white">
            {`Invited ${item.name}#${item.tag}`}
          </Text>
          <NotificationRespondButton
            type={Constants.Notification.ResponseType.Cancel}
            handler={() => onRespondHandler(item.notiId)}
          />
        </View>
      ))}
    </View>
  );
};

export default GroupSelfSentInviteList;
