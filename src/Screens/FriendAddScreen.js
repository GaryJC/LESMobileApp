import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableHighlight,
} from "react-native";
import { useState, useEffect } from "react";
import IMFunctions from "../utils/IMFunctions";
import { LesPlatformCenter } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import FriendService from "../services/FriendService";
import NotificationService from "../services/NotificationService";

const FriendAddScreen = () => {
  const [searchWord, setSearchWord] = useState();
  const [userData, setUserData] = useState();

  const onSearchHandler = async () => {
    try {
      const result = await LesPlatformCenter.IMFunctions.findUser(
        searchWord,
        0
      );
      const { state, userdata } = result;
      if (userdata) {
        const name = userdata.getName();
        const tag = userdata.getTag();
        const id = userdata.getId();

        setUserData({ name: name, tag: tag, id: id, state: state });
      }
      console.log("find user's result: ", userdata);
    } catch (e) {
      console.log("error", e);
    }
  };

  const onAddFriendHandler = async () => {
    try {
      await NotificationService.Inst.sendFriendInvitation(userData.id);
      console.log("send friend invite success: ", e);
    } catch (e) {
      console.log("send friend invit error: ", e);
    }
  };

  const AddFriendButton = () => (
    <TouchableHighlight onPress={onAddFriendHandler}>
      <View>
        <Text className="text-white">Add</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <View className="flex-1 mx-[5vw]">
      <View className="flex-row mt-[10px] h-[30px] justify-between">
        <View className="h-[100%] w-[80%]">
          <TextInput
            value={searchWord}
            className="flex-1 bg-[#1B1B1B] rounded h-[100%] p-[5px] text-[#CACACA]"
            onChangeText={setSearchWord}
            placeholder="Search friends"
          />
        </View>
        <TouchableHighlight onPress={onSearchHandler}>
          <View className="h-[100%] bg-white">
            <Text>Search</Text>
          </View>
        </TouchableHighlight>
      </View>
      <View className="mt-[20px]">
        {userData ? (
          <FriendList friend={userData} button={<AddFriendButton />} />
        ) : (
          <Text className="text-white">Didn't find any matching results</Text>
        )}
      </View>
    </View>
  );
};

export default FriendAddScreen;
