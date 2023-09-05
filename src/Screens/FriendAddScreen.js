import { View, Text, TextInput, TouchableHighlight } from "react-native";
import { useState, useEffect } from "react";
import { LesPlatformCenter } from "les-im-components";
import { FriendList } from "../Components/FriendList";
import LoadingIndicator from "../Components/LoadingIndicator";
import FriendAddButton from "../Components/FriendAddButton";

const FriendAddScreen = () => {
  const [searchWord, setSearchWord] = useState();
  const [userData, setUserData] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const onSearchHandler = async () => {
    setIsLoading(true);
    let [username, tag] = searchWord.split("#");
    tag = tag == undefined && 0;
    console.log("username, tag", username, tag);
    try {
      const result = await LesPlatformCenter.IMFunctions.findUser(
        username,
        tag
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
    setIsLoading(false);
  };

  const SearchUserButton = () => (
    <TouchableHighlight onPress={onSearchHandler}>
      <View className="h-[100%] bg-[#58AE69] justify-center rounded px-[10px]">
        <Text className="text-white font-bold">Search</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <>
      {<LoadingIndicator isLoading={isLoading} />}
      <View className="flex-1 mx-[5vw]">
        <Text className="text-white">
          Please input username or email, and you can add tag after it.
        </Text>
        <View className="flex-row mt-[10px] h-[30px] justify-between">
          <View className="h-[100%] w-[75%]">
            <TextInput
              value={searchWord}
              className="flex-1 bg-[#424547] rounded h-[100%] p-[5px] text-[#CACACA]"
              onChangeText={setSearchWord}
              placeholder="e.g. username/email#tag"
              placeholderTextColor={"#979A9D"}
            />
          </View>
          <SearchUserButton />
        </View>
        <View className="mt-[20px]">
          {userData ? (
            <FriendList
              friend={userData}
              button={
                <FriendAddButton
                  userData={userData}
                  setIsLoading={setIsLoading}
                />
              }
            />
          ) : (
            <Text className="text-white">Didn't find any matching results</Text>
          )}
        </View>
      </View>
    </>
  );
};

export default FriendAddScreen;
