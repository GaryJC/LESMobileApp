import { View, FlatList } from "react-native";
import GroupListItem from "./GroupListItem";
import DataCenter from "../../modules/DataCenter";
import { LesConstants } from "les-im-components";
import { useState, useEffect } from "react";
import JSEvent from "../../utils/JSEvent";
import { DataEvents, UIEvents } from "../../modules/Events";

const SocialGroup = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const updateGroups = () => {
      setGroups(
        DataCenter.messageCache.getChatList(LesConstants.IMMessageType.Group)
      );
    };

    updateGroups();

    JSEvent.on(DataEvents.User.UserState_IsLoggedin, updateGroups);
    JSEvent.on(UIEvents.Message.Message_Chat_List_Updated, updateGroups);
    JSEvent.on(UIEvents.User.User_Click_Chat_Updated, updateGroups);
    return () => {
      JSEvent.remove(DataEvents.User.UserState_IsLoggedin, updateGroups);
      JSEvent.remove(UIEvents.Message.Message_Chat_List_Updated, updateGroups);
      JSEvent.remove(UIEvents.User.User_Click_Chat_Updated, updateGroups);
    };
  }, []);

  return (
    <View className="flex-1">
      <FlatList
        data={groups}
        renderItem={({ item }) => <GroupListItem groupData={item} />}
        keyExtractor={(item) => item.targetId}
      />
    </View>
  );
};

export default SocialGroup;
