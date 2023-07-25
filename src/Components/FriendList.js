import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { StateIndicator } from "./StateIndicator";
import { useState, useRef, useCallback } from "react";
import FriendBottomSheet from "./FriendBottomSheet";
import FriendListChatButton from "./FriendListChatButton";
import Avatar from "./Avatar";

export const FriendList = ({ friend, button }) => {
  // const avatar = `https://i.pravatar.cc/?img=${friend.id}`;

  // const navigation = useNavigation();
  console.log("fl: ", friend);

  const [selectedFriend, setSelectedFriend] = useState();

  // const bottomSheetModalRef = useRef(null);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const openSheet = useCallback(() => {
    setSelectedFriend(friend);
    bottomSheetModalRef.current?.present();
  }, []);

  const bottomSheetModalRef = useRef(null);

  return (
    <View>
      <View className="flex-row justify-between mb-[10px]">
        <View className="flex-row items-center">
          <View className="relative">
            <TouchableOpacity
              onPress={openSheet}
              className="w-[55px] h-[55px] mr-[10px]"
            >
              {/* <View className="w-[55px] h-[55px] rounded-full overflow-hidden mr-[10px]">
                <ImageBackground
                  source={{ uri: `https://i.pravatar.cc/?img=${friend.id}` }}
                  className="w-[100%] h-[100%]"
                />
              </View> */}
              <Avatar tag={friend.tag} name={friend.name} />
            </TouchableOpacity>
            <View className="absolute bottom-[0] right-[5] justify-center items-center">
              <StateIndicator state={friend.state} />
            </View>
          </View>
          <Text className="text-white text-[20px] font-bold">
            {friend.name}
          </Text>
        </View>
        {/* <FriendListChatButton friend={friend} /> */}
        {button}
      </View>
      <FriendBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        selectedFriend={selectedFriend}
        // openSheet={() => openSheet(item)}
      />
    </View>
  );
};
