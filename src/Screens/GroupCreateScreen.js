import {
  View,
  Text,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
} from "react-native";
import FriendSearchInput from "../Components/FriendSearchInput";
import { FriendList } from "../Components/FriendList";
import { useEffect, useState } from "react";
import FriendService from "../services/FriendService";
import { MaterialIcons } from "@expo/vector-icons";
import ChatGroupService from "../services/ChatGroupService";
import NotificationService from "../services/NotificationService";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import { useNavigation } from "@react-navigation/native";
import { LesConstants } from "les-im-components";
import GroupRoleBottomSheet from "../Components/GroupRoleBottomSheet";
import FriendSelectButton from "../Components/FriendSelectButton";
import DataCenter from "../modules/DataCenter";
import LoadingIndicator from "../Components/LoadingIndicator";
import HighlightButton from "../Components/HighlightButton";

const GroupCreateScreen = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState();

  const navigation = useNavigation();

  const newGroupEventHandler = (chatGroup) => {
    console.log("new group", chatGroup);

    const groupId = "group-" + chatGroup.id;
    // JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated);
    // JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
    //   chatId: groupId,
    //   type: LesConstants.IMMessageType.Group,
    // });
    const chatListItem = DataCenter.messageCache.getChatListItem(groupId);

    // DataCenter.messageCache.setCurChatListItem(chatListItem);
    JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
      // chatId: chatId,
      // targetId: friend?.id,
      chatListItem,
    });
  };

  // const updateGroupEventHander = (chatGroup) => {
  //   console.log("updated chat group: ", chatGroup);
  // };

  useEffect(() => {
    FriendService.Inst.getFriendList()
      .then((res) => {
        setFriendsData(res);
        console.log("friend list: ", res);
      })
      .catch((e) => {
        console.log("get friend list error: ", e);
      });

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_New, newGroupEventHandler);
    // JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, updateGroupEventHander);
    return () => {
      JSEvent.remove(DataEvents.ChatGroup.ChatGroup_New, newGroupEventHandler);
      // JSEvent.remove(DataEvents.ChatGroup.ChatGroup_Updated);
    };
  }, []);

  /*
  const toggleFriendSelection = (friend) => {
    if (selectedFriends.some((selected) => selected.id === friend.id)) {
      setSelectedFriends(
        selectedFriends.filter((selected) => selected.id !== friend.id)
      );
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const SelectButton = ({ friend, isSelected, toggleFriendSelection }) => (
    <TouchableOpacity
      className="justify-center"
      onPress={() => toggleFriendSelection(friend)}
    >
      {isSelected ? (
        <MaterialIcons name="check-box" size={24} color="white" />
      ) : (
        <MaterialIcons name="check-box-outline-blank" size={24} color="white" />
      )}
    </TouchableOpacity>
  );
  */

  const openCreateGroupModal = () => {
    setModalVisible(true);
  };

  const closeCreateGroupModal = () => {
    setModalVisible(false);
  };

  const validateGroupName = () => {
    const regex = /^(?![_\d])[a-zA-Z_]{3,20}$/;
    return regex.test(groupName);
  };

  const createGroupHandler = async () => {
    console.log("group name: ", groupName);
    const isValid = validateGroupName(groupName);
    if (isValid) {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const groupInfo = await ChatGroupService.Inst.createChatGroup(
          groupName
        );
        console.log("group info: ", groupInfo);
        const groupId = groupInfo.id;
        const invitedIds = selectedFriends.map((friend) => friend.id);
        await NotificationService.Inst.sendGroupInvitation(groupId, invitedIds);
        navigation.navigate("Chats");
      } catch (e) {
        console.log("create group error: ", e);
      }
      setIsLoading(false);
    } else {
      setErrorMsg(
        "Minimum of 3 words, a maximum of 20 words, no special symbols other than underscores allowed"
      );
    }
  };

  return (
    <View className="flex-1 mx-[5vw]">
      <FriendSearchInput setSearchResults={setFriendsData} />
      <View className="mt-[20px] h-[75vh]">
        <FlatList
          data={friendsData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FriendList
              friend={item}
              button={
                <FriendSelectButton
                  friend={item}
                  isSelected={selectedFriends.some(
                    (friend) => friend.id === item.id
                  )}
                  setSelectedFriends={setSelectedFriends}
                />
              }
            />
          )}
        />
      </View>
      {selectedFriends.length ? (
        <TouchableHighlight onPress={openCreateGroupModal}>
          <View className="h-[35px] bg-[#6E5EDB] justify-center rounded-lg">
            <Text className="text-white text-center text-[15px] font-bold">
              Create Group
            </Text>
          </View>
        </TouchableHighlight>
      ) : (
        <TouchableWithoutFeedback>
          <View className="h-[35px] bg-[#52575B] justify-center rounded-lg">
            <Text className="text-white text-center text-[15px] font-bold">
              Create Group
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )}

      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={closeCreateGroupModal}
          />
          <View className="w-[70vw] bg-[#262F38] justify-center items-center p-[15px] rounded-xl">
            <Text className="text-white text-[16px] text-center">
              Please create your group's name
            </Text>
            <TextInput
              className="h-[30px] w-[100%] mt-[20px] bg-[#1B1B1B] rounded-lg text-white"
              value={groupName}
              onChangeText={setGroupName}
            />
            {/* {!isLoading ? (
              <TouchableHighlight
                className="mt-[20px]"
                onPress={createGroupHandler}
              >
                <View className="w-[100px] h-[30px] bg-[#58AE69] rounded-lg justify-center items-center">
                  <Text className="text-white">Submit</Text>
                </View>
              </TouchableHighlight>
            ) : (
              <TouchableWithoutFeedback className="mt-[20px]">
                <View className="w-[100px] h-[30px] bg-[#52575B] rounded-lg justify-center items-center">
                  <ActivityIndicator size={"small"} />
                </View>
              </TouchableWithoutFeedback>
            )} */}
            {/* <TouchableHighlight
              className="mt-[20px]"
              onPress={createGroupHandler}
            >
              <View className="w-[100px] h-[30px] bg-[#58AE69] rounded-lg justify-center items-center">
                <Text className="text-white">Submit</Text>
              </View>
            </TouchableHighlight> */}
            {errorMsg && (
              <Text className="text-clr-error-red mt-[10px]">{errorMsg}</Text>
            )}
            <View className="mt-[20px]">
              <HighlightButton
                type={"primary"}
                text="Create"
                isLoading={isLoading}
                disabled={isLoading}
                onPress={createGroupHandler}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* <LoadingIndicator isLoading={true} /> */}
    </View>
  );
};

export default GroupCreateScreen;
