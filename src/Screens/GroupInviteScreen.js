import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import FriendSearchInput from "../Components/FriendSearchInput";
import { FriendList } from "../Components/FriendList";
import { useEffect, useState } from "react";
import FriendService from "../services/FriendService";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import { useNavigation, useRoute } from "@react-navigation/native";
import FriendSelectButton from "../Components/FriendSelectButton";
import ChatGroupService from "../services/ChatGroupService";
import DataCenter from "../modules/DataCenter";
import NotificationService from "../services/NotificationService";

const GroupInviteScreen = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const groupId = route.params?.groupId;

  useEffect(() => {
    const getInvitableFriends = async () => {
      console.log("ss");
      const friendList = await FriendService.Inst.getFriendList();
      console.log("hh");
      let members = await ChatGroupService.Inst.getGroupMembers(groupId);
      console.log("members: ", members, friendList);
      members = members.map((item) => item.userInfo.id);
      const invitableFriends = friendList.filter(
        (item) => !members.includes(item.id)
      );

      setFriendsData(invitableFriends);
    };

    getInvitableFriends();

    // JSEvent.on(DataEvents.ChatGroup.ChatGroup_New, newGroupEventHandler);
    // return () => {
    //   JSEvent.remove(DataEvents.ChatGroup.ChatGroup_New);
    // };
  }, []);

  const inviteFriendHandler = async () => {
    const recipientsId = selectedFriends.map((item) => item.id);
    setIsLoading(true);
    try {
      console.log("invite friends: ", recipientsId);
      await NotificationService.Inst.sendGroupInvitation(groupId, recipientsId);
      console.log("invite friend successfully");
    } catch (e) {
      throw ("invite friend error: ", e);
    }
    setIsLoading(false);
    navigation.goBack();
  };

  return (
    <View className="flex-1 mx-[5vw]">
      <FriendSearchInput setSearchResults={setFriendsData} />
      <View className="mt-[20px] h-[70vh]">
        <FlatList
          data={friendsData}
          //   keyExtractor={(item) => item.id.toString()}
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
      {!isLoading && selectedFriends.length ? (
        <TouchableHighlight onPress={inviteFriendHandler}>
          <View className="h-[35px] bg-[#6E5EDB] justify-center rounded-lg">
            <Text className="text-white text-center text-[15px] font-bold">
              Invite
            </Text>
          </View>
        </TouchableHighlight>
      ) : !isLoading && selectedFriends.length ? (
        <TouchableWithoutFeedback>
          <View className="h-[35px] bg-[#52575B] justify-center rounded-lg">
            <Text className="text-white text-center text-[15px] font-bold">
              Invite
            </Text>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback>
          <View className="h-[35px] bg-[#52575B] justify-center rounded-lg">
            <ActivityIndicator size="small" />
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default GroupInviteScreen;
