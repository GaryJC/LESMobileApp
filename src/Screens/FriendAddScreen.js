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

const FriendAddScreen = () => {
  const [searchWord, setSearchWord] = useState();

  const onSearchHandler = async () => {
    try {
      const result = await LesPlatformCenter.IMFunctions.findUser(
        searchWord,
        0
      );
      console.log("find user's result: ", result);
    } catch {
      console.log("error");
    }
  };

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
    </View>
  );
};

export default FriendAddScreen;
