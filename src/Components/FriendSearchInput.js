import { TextInput, View, FlatList } from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import FriendService from "../services/FriendService";

const FriendSearchInput = ({ setSearchResults }) => {
  const onSearchHandler = debounce((keyword) => {
    const friendList = FriendService.Inst.getFriendList();
    const result = friendList.filter((friend) =>
      friend.name.toLowerCase().includes(keyword.toLowerCase())
    );
    console.log("searched friends: ", result);
    setSearchResults(result);
  }, 500);

  return (
    <View className="h-[30px] mt-[10px]">
      <TextInput
        className="flex-1 bg-[#1B1B1B] rounded h-[100%] p-[5px] text-[#CACACA]"
        onChangeText={onSearchHandler}
        placeholder="Search friends"
      />
    </View>
  );
};

export default FriendSearchInput;
