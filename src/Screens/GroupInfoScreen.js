import {
  View,
  Text,
  FlatList,
  SectionList,
  ActivityIndicator,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import ChatGroupService from "../services/ChatGroupService";
import { LesConstants } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import DataCenter from "../modules/DataCenter";
import { Ionicons } from "@expo/vector-icons";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import FeedBackModal, { DialogModal } from "../Components/FeedbackModal";
import GroupAuthButton from "../Components/GroupAuthButton";
import GroupAwaitResponse from "../Components/GroupAwaitResponse";

const GroupInfoScreen = () => {
  const [groupMemberData, setGroupMemberData] = useState([]);
  const [groupInfo, setGroupInfo] = useState();
  const [ownRole, setOwnRole] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedback, setFeedbak] = useState();

  const route = useRoute();

  const navigation = useNavigation();

  const groupId = route.params?.targetId;

  const processGroupMembers = (groupMembers) => {
    const confirmedMembers = groupMembers.filter(
      (member) =>
        member.memberState === LesConstants.IMGroupMemberState.Confirmed
    );
    const creators = [];
    const managers = [];
    const members = [];

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

  const getGroupMembers = async () => {
    setIsLoading(true);
    try {
      const groupMembers = await ChatGroupService.Inst.getGroupMembers(groupId);
      // console.log("group members: ", groupMembers, groupId);
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

    const updateGroupMembers = (cg) => {
      if (cg.id === groupId) {
        getGroupMembers();
      }
    };

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, updateGroupMembers);

    JSEvent.on(UIEvents.ChatGroup.ChatGroup_RemoveMember, getGroupMembers);

    return () => {
      JSEvent.remove(
        DataEvents.ChatGroup.ChatGroup_Updated,
        updateGroupMembers
      );

      JSEvent.remove(
        UIEvents.ChatGroup.ChatGroup_RemoveMember,
        getGroupMembers
      );
    };
  }, []);

  const inviteFriendHandler = () => {
    navigation.navigate("GroupInvite", { groupId: groupId });
  };

  const quitGroupHandler = async () => {
    try {
      await ChatGroupService.Inst.quitChatGroup(groupId);
      navigation.goBack();
    } catch (e) {
      console.log("quit group error: ", e);
      setFeedbackModalOpen(true);
      setFeedbak("You can not quit this group.");
    }
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
              button={
                <GroupAuthButton
                  userData={item}
                  ownRole={ownRole}
                  groupId={groupId}
                />
              }
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
      <GroupAwaitResponse groupId={groupId} />
      <View className="mt-[5vh]">
        <TouchableHighlight onPress={quitGroupHandler}>
          <View className="justify-center items-center bg-[#131F2A] h-[35px] rounded-lg ">
            <Text className="text-[#FF0000] text-[17px] font-bold">Quit</Text>
          </View>
        </TouchableHighlight>
      </View>

      <DialogModal
        visible={feedbackModalOpen}
        content={feedback}
        onButtonPressed={btn => {
          setFeedbackModalOpen(false);
        }}
      />

      {/* <FeedBackModal
        feedbackModalOpen={feedbackModalOpen}
        setFeedbackModalOpen={setFeedbackModalOpen}
        feedback={feedback}
      /> */}
    </View>
  );
};

export default GroupInfoScreen;
