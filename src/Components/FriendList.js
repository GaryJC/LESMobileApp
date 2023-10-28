import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { StateIndicator } from "./StateIndicator";
import { useState, useRef, useCallback } from "react";
import FriendBottomSheet from "./FriendBottomSheet";
import FriendListChatButton from "./SocialListChatButton";
import Avatar from "./Avatar";

export const FriendList = ({ friend, button, hasTag }) => {
  // const avatar = `https://i.pravatar.cc/?img=${friend.id}`;

  // const navigation = useNavigation();
  // console.log("ppp: ");

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
          <TouchableOpacity onPress={openSheet}>
            <View className="flex-row">
              <View className="relative">
                <View className="w-[55px] h-[55px] mr-[10px]">
                  <Avatar tag={friend.tag} name={friend.name} avatar={friend.avatar}>
                    <View className="absolute right-0 bottom-0">
                      <StateIndicator
                        state={friend.state}
                        onlineState={friend.onlineState}
                        bgColor={'#080F14'}
                      />
                    </View>
                  </Avatar>
                </View>


              </View>
              <View className="flex-row items-center">
                <Text className="text-white text-[20px] font-bold">
                  {friend.name}
                </Text>
                {hasTag && (
                  <Text className="text-white text-[14px]"> #{friend.tag}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
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
