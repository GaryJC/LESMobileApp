import { LesConstants } from "les-im-components";
import { View, Text, TouchableOpacity } from "react-native";
import NotificationService from "../services/NotificationService";
import Avatar from "./Avatar";

const GroupSelfSentInviteList = ({ item }) => {
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
  console.log("iii: ", item, recipients);

  const onRespondHandler = (notificationId, response) => {
    console.log("pp: ", notificationId, response);
    NotificationService.Inst.respondInvitation(notificationId, response)
      .then((res) => {
        console.log("response: ", res);
      })
      .catch((e) => console.error(e));
  };

  return (
    <View className="mb-[10px]">
      <View className="bg-[#262F38] rounded-lg overflow-hidden">
        <View className="bg-[#1A1E22] h-[40px] px-[10px] flex-row items-center">
          <View className="w-[30] h-[30] mr-[10px]">
            <Avatar tag={groupId} name={name} />
          </View>

          <Text className="text-white font-bold">
            Group Invitation {`[${name}]`}
          </Text>
        </View>
        {recipients.map((item) => (
          <View key={item.notiId} className="p-[10px] flex-row justify-between">
            <Text className="text-white">
              Invited <Text className="font-bold text-[16px]">{item.name}</Text>
            </Text>
            <TouchableOpacity
              onPress={() =>
                onRespondHandler(
                  item.notiId,
                  LesConstants.IMNotificationState.Canceled
                )
              }
            >
              <Text className="text-white font-bold text-[16px]">Cancel</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default GroupSelfSentInviteList;
