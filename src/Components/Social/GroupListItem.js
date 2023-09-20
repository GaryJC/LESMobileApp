import { View, Text } from "react-native";
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

const GroupListItem = ({ groupData }) => {
  console.log("gpp: ", groupData, groupData.latestMessage);

  const [groupInfo, setGroupInfo] = useState(
    ChatGroupService.Inst.getCachedChatGroup(groupData.targetId)
  );
  console.log("groupInfo: ", groupInfo);

  return (
    <View className="mb-[10px] flex-row justify-between">
      <View className="flex-row">
        <View className="w-[50px] h-[50px]">
          <Avatar
            name={groupInfo?.name}
            isGroup={true}
            size={{ w: 50, h: 50, font: 20 }}
          />
          {groupData.newMessageCount !== 0 && (
            <View className="absolute top-[0] right-[0] rounded-full w-[20px] h-[20px] bg-[#FF3737] justify-center items-center">
              <Text className="text-white font-bold text-[12px]">
                {groupData.newMessageCount}
              </Text>
            </View>
          )}
        </View>
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
          <Text className="text-clr-gray">
            {truncate(groupData.latestMessage, {
              length: 20,
            })}
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
