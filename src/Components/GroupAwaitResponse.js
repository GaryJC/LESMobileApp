import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { LesConstants } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import DataCenter from "../modules/DataCenter";
import NotificationService from "../services/NotificationService";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

const GroupAwaitResponse = ({ groupId }) => {
  const [awaitingMembers, setAwaitingMembers] = useState([]);

  useEffect(() => {
    getConfirmingMembers();

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      getConfirmingMembers
    );

    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        getConfirmingMembers
      );
    };
  }, []);

  const getConfirmingMembers = () => {
    const confirmingMembers = DataCenter.notifications
      .getAllNotifications(LesConstants.IMNotificationType.GroupInvitation)
      .reduce((res, item) => {
        if (item.groupInfo.id === groupId && item.mode === "sender") {
          console.log("sasa11s: ", res, item);
          return [
            ...res,
            {
              ...item.recipient,
              notiId: item.id,
            },
          ];
        }
        return res;
      }, []);

    console.log("confirming members: ", confirmingMembers);
    setAwaitingMembers(confirmingMembers);
  };

  const onRespondHandler = (notificationId) => {
    NotificationService.Inst.cancelInvitation(notificationId)
      .then((res) => {
        console.log("cancel success: ", res);
        getConfirmingMembers();
      })
      .catch((e) => console.error(e));
  };

  const CancelButton = ({ item }) => (
    <View className="justify-center">
      <TouchableOpacity onPress={() => onRespondHandler(item.notiId)}>
        <Text className="text-white font-bold">Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <Text className="text-white text-[15px] font-bold mt-[10px]">
        Awaiting Responses:
      </Text>
      <FlatList
        data={awaitingMembers}
        renderItem={({ item }) => (
          <FriendList friend={item} button={<CancelButton item={item} />} />
        )}
      />
    </View>
  );
};

export default GroupAwaitResponse;
