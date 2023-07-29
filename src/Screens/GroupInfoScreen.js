import { View, Text, FlatList, SectionList } from "react-native";
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

const GroupInfoScreen = () => {
  const [groupMemberData, setGroupMemberData] = useState([]);
  const [groupInfo, setGroupInfo] = useState();
  const [ownRole, setOwnRole] = useState();

  const bottomSheetModalRef = useRef(null);

  const route = useRoute();

  const navigation = useNavigation();

  const targetId = route.params?.targetId;
  console.log("targetId: ", targetId);

  const processGroupMembers = (groupMembers) => {
    const creators = [];
    const managers = [];
    const members = [];

    groupMembers.forEach((item) => {
      switch (item.memberRole) {
        case LesConstants.IMGroupMemberRole.Creator:
          creators.push({ ...item.userInfo, memberRole: item.memberRole });
          break;
        case LesConstants.IMGroupMemberRole.Manager:
          managers.push({ ...item.userInfo, memberRole: item.memberRole });
          break;
        case LesConstants.IMGroupMemberRole.Member:
          members.push({ ...item.userInfo, memberRole: item.memberRole });
          break;
        default:
          break;
      }
    });

    setGroupMemberData([
      { title: "Creators: ", data: creators },
      { title: "Managers: ", data: managers },
      { title: "Members: ", data: members },
    ]);
  };

  useEffect(() => {
    const getGroupMembers = async () => {
      const groupMembers = await ChatGroupService.Inst.getGroupMembers(
        targetId
      );
      console.log("group members: ", groupMembers);
      const role = groupMembers.find(
        (item) => item.userInfo.id === DataCenter.userInfo.accountId
      ).memberRole;
      console.log("rrr", role);
      setOwnRole(role);
      processGroupMembers(groupMembers);
    };

    const getChatInfo = async () => {
      const chatInfo = await ChatGroupService.Inst.getChatGroup(targetId);
      console.log("chat info: ", chatInfo);
      setGroupInfo(chatInfo);
    };
    getGroupMembers();
    getChatInfo();
  }, []);

  const openChangeRoleSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  const GroupAuthButton = ({ data }) => {
    // 如果这个是用户自己，不显示
    // 如果用户是creator, 那么除了自己都显示
    // 如果用户是manager，那么只显示members
    // 如果用户是member那么都不显示
    console.log("dddd", data);
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
          <GroupRoleBottomSheet bottomSheetModalRef={bottomSheetModalRef} />
        </View>
      );
    }
    /*
    return data.id !== DataCenter.userInfo.accountId ? (
      <View className="justify-center items-center">
        <TouchableOpacity>
          <MaterialCommunityIcons name="account-key" size={24} color="white" />
        </TouchableOpacity>
      </View>
    ) : (
      <></>
    );
    */
  };

  const inviteFriendHandler = () => {
    navigation.navigate("GroupInvite", { groupId: targetId });
  };

  return (
    <View className="mx-[5vw]">
      <View className="flex-row justify-between">
        <Text className="text-[20px] text-white font-bold">Group Members</Text>
        <TouchableOpacity onPress={inviteFriendHandler}>
          <Ionicons name="add-circle" size={24} color="#5EB857" />
        </TouchableOpacity>
      </View>

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
      <TouchableHighlight onPress={() => console.log("")}>
        <View className="justify-center items-center bg-[#131F2A] h-[35px] rounded-lg mt-[5vh]">
          <Text className="text-[#FF0000] text-[17px] font-bold">Quit</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default GroupInfoScreen;
