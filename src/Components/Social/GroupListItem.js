import { View, Text, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import DataCenter from "../../modules/DataCenter";
import { LesConstants } from "les-im-components";
import { useState } from "react";
import Avatar from "../Avatar";
import IMUserInfoService from "../../services/IMUserInfoService";
import ChatGroupService from "../../services/ChatGroupService";
import JSEvent from "../../utils/JSEvent";
import { UIEvents } from "../../modules/Events";
import formatDate from "../../utils/formatDate";
import FriendListChatButton from "../SocialListChatButton";
import { truncate } from "lodash";
import { useNavigation } from "@react-navigation/native";

const GroupListItem = ({ groupData }) => {
  console.log("gpp: ", groupData, groupData.latestMessage);

  const [groupInfo, setGroupInfo] = useState(
    ChatGroupService.Inst.getCachedChatGroup(groupData.targetId)
  );

  const [lastSender, setLastSender] = useState(null)
  console.log("groupInfo: ", groupInfo);

  const navigation = useNavigation();
  useEffect(() => {
    IMUserInfoService.Inst.getUser(groupData.latestMessageSenderId).then(user => {
      if (user.length > 0) {
        setLastSender(user[0]);
      }
    });
  }, [])

  const onGroupInfoOpen = () => {
    navigation.navigate("GroupInfo", { targetId: groupData.targetId });
  };


  const countBadgeClass =
    "absolute bottom-[-2px] right-[-5px] rounded-full w-[20px] h-[20px] bg-[#FF3737] justify-center items-center";


  const latestMsg = groupData.latestMessage.length > 0 ?
    (lastSender == null ? "" : lastSender.name + ": ") + truncate(groupData.latestMessage, { length: 25 })
    : ""

  return (
    <View className="mb-[10px] flex-row justify-between">
      <View className="flex-row">
        <TouchableOpacity onPress={onGroupInfoOpen}>
          <View className="w-[50px] h-[50px]">
            <Avatar name={groupInfo?.name} isGroup={true} />
            {groupData.newMessageCount !== 0 && (
              <View className={countBadgeClass}>
                <Text className="text-white font-bold text-[12px]">
                  {groupData.newMessageCount > 99
                    ? "99+"
                    : groupData.newMessageCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View className="ml-[10px] justify-between">
          <View className="flex-row">
            <View className="flex-row items-end">
              <Text className="text-white font-bold">{groupInfo?.name}</Text>
              <Text className="text-white text-[12px] ml-[5px]">
                {groupData.latestMessage &&
                  formatDate(new Date(groupData.updateTime), {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </Text>
            </View>
          </View>
          <Text className="text-clr-gray-light">
            {latestMsg}
          </Text>
        </View>
      </View>
      <FriendListChatButton
        item={groupInfo}
        type={LesConstants.IMMessageType.Group}
      />
    </View>
  );
};

export default GroupListItem;
