import {
  View,
  Text,
  FlatList,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import ChatGroupService from "../services/ChatGroupService";
import { LesConstants } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import DataCenter from "../modules/DataCenter";
import GroupRoleBottomSheet from "../Components/GroupRoleBottomSheet";
import { TouchableHighlight } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import NotificationService from "../services/NotificationService";
import Constants from "../modules/Constants";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";

const GroupInfoScreen = () => {
  const [groupMemberData, setGroupMemberData] = useState([]);
  const [groupInfo, setGroupInfo] = useState();
  const [ownRole, setOwnRole] = useState();
  const [awaitingMembers, setAwaitingMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const bottomSheetModalRef = useRef(null);

  const route = useRoute();

  const navigation = useNavigation();

  const groupId = route.params?.targetId;
  console.log("targetId: ", groupId);

  const processGroupMembers = (groupMembers) => {
    const confirmedMembers = groupMembers.filter(
      (member) =>
        member.memberState === LesConstants.IMGroupMemberState.Confirmed
    );
    const creators = [];
    const managers = [];
    const members = [];

    console.log("ggg", groupMembers, confirmedMembers);

    confirmedMembers.forEach((item) => {
      if (item.memberRole === LesConstants.IMGroupMemberRole.Creator) {
        creators.push({ ...item.userInfo, memberRole: item.memberRole });
      } else if (item.memberRole === LesConstants.IMGroupMemberRole.Manager) {
        managers.push({ ...item.userInfo, memberRole: item.memberRole });
      } else {
        members.push({ ...item.userInfo, memberRole: item.memberRole });
      }
    });

    setGroupMemberData([
      { title: "Creators: ", data: creators },
      { title: "Managers: ", data: managers },
      { title: "Members: ", data: members },
    ]);
  };

  const getConfirmingMembers = () => {
    const confirmingMembers = DataCenter.notifications
      .getAllNotifications(LesConstants.IMNotificationType.GroupInvitation)
      .reduce((res, item) => {
        if (item.groupInfo.id === groupId && item.mode === "sender") {
          console.log(res, item);
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

  const getGroupMembers = async () => {
    setIsLoading(true);
    try {
      const groupMembers = await ChatGroupService.Inst.getGroupMembers(groupId);
      console.log("group members: ", groupMembers, groupId);
      const role = groupMembers.find(
        (item) => item.userInfo.id === DataCenter.userInfo.accountId
      ).memberRole;
      setOwnRole(role);
      processGroupMembers(groupMembers);
      setIsLoading(false);
    } catch (e) {
      console.log("get group members error: ", e);
    }
  };

  const getChatInfo = async () => {
    const chatInfo = await ChatGroupService.Inst.getChatGroup(groupId);
    console.log("chat info: ", chatInfo);
    setGroupInfo(chatInfo);
  };

  useEffect(() => {
    getGroupMembers();
    getConfirmingMembers();
    // getChatInfo();

    const updateConfirmingMembers = (noti) => {
      //   getGroupMembers();
      //   console.log("bbb: ", noti, awaitingMembers);
      //   const isFromThisGroup = awaitingMembers.find(
      //     (item) => item.notiId === noti.id
      //   );
      //   if (isFromThisGroup) {
      //     getConfirmingMembers();
      //   }
      getConfirmingMembers();
    };

    const updateGroupMembers = (cg) => {
      if (cg.id === groupId) {
        getGroupMembers();
      }
    };

    JSEvent.on(
      DataEvents.Notification.NotificationState_Updated,
      updateConfirmingMembers
    );

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, updateGroupMembers);

    JSEvent.on(UIEvents.ChatGroup.ChatGroup_RemoveMember, getGroupMembers);

    return () => {
      JSEvent.remove(
        DataEvents.Notification.NotificationState_Updated,
        updateConfirmingMembers
      );

      JSEvent.remove(
        UIEvents.ChatGroup.ChatGroup_RemoveMember,
        getGroupMembers
      );

      JSEvent.remove(
        UIEvents.ChatGroup.ChatGroup_RemoveMember,
        getGroupMembers
      );
    };
  }, []);

  const openChangeRoleSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  const GroupAuthButton = ({ data }) => {
    // 如果这个是用户自己，不显示
    // 如果用户是creator, 那么除了自己都显示
    // 如果用户是manager，那么只显示members
    // 如果用户是member那么都不显示
    if (data.id === DataCenter.userInfo.accountId) {
      return null;
    }
    if (ownRole === LesConstants.IMGroupMemberRole.Member) {
      return null;
    } else if (
      ownRole === LesConstants.IMGroupMemberRole.Manager &&
      data.memberRole !== LesConstants.IMGroupMemberRole.Member
    ) {
      return null;
    } else {
      return (
        <View className="justify-center items-center">
          <TouchableOpacity onPress={openChangeRoleSheet}>
            <MaterialCommunityIcons
              name="account-key"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <GroupRoleBottomSheet
            bottomSheetModalRef={bottomSheetModalRef}
            memberData={data}
            groupId={groupId}
          />
        </View>
      );
    }
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

  const inviteFriendHandler = () => {
    navigation.navigate("GroupInvite", { groupId: groupId });
  };

  return (
    <View className="mx-[5vw]">
      <View className="flex-row justify-between">
        <Text className="text-[20px] text-white font-bold">Group Members</Text>
        <TouchableOpacity onPress={inviteFriendHandler}>
          <Ionicons name="add-circle" size={24} color="#5EB857" />
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator size={"small"} />}

      <View className="">
        <SectionList
          sections={groupMemberData}
          renderItem={({ item }) => (
            <FriendList
              friend={item}
              button={<GroupAuthButton data={item} />}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View>
              <Text className="text-white font-bold text-[15px] my-[10px]">
                {title}
              </Text>
            </View>
          )}
        />
      </View>
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
      <TouchableHighlight onPress={() => console.log("")}>
        <View className="justify-center items-center bg-[#131F2A] h-[35px] rounded-lg mt-[5vh]">
          <Text className="text-[#FF0000] text-[17px] font-bold">Quit</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default GroupInfoScreen;
