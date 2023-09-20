import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MessageCaches } from "../Models/MessageCaches";
import JSEvent from "../utils/JSEvent";
import DataCenter from "../modules/DataCenter";
import { UIEvents } from "../modules/Events";
import { LesConstants } from "les-im-components";

const SocialListChatButton = ({ item, type }) => {
  const navigation = useNavigation();
  const goChatHandler = () => {
    const chatId = MessageCaches.MakeChatID(
      DataCenter.userInfo.accountId,
      item.id,
      type
    );
    console.log("go to chat id: ", chatId, item?.id);
    const chatListItem = DataCenter.messageCache.getChatListItem(chatId);
    console.log("chatListItem: ", chatListItem);
    // DataCenter.messageCache.setCurChatListItem(chatListItem);
    navigation.navigate("Chats");
    // JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated, chatId);
    DataCenter.messageCache.touchChatData(chatId);
    JSEvent.emit(UIEvents.User.User_Click_Chat_Updated, {
      // chatId: chatId,
      // targetId: friend?.id,
      chatListItem,
    });
  };
  return (
    <View className="flex-row items-center">
      <TouchableOpacity onPress={goChatHandler}>
        <View className="w-[35px] h-[35px] bg-[#182634] rounded-full overflow-hidden justify-center items-center">
          <Ionicons
            name="chatbubble-ellipses-outline"
            color={"white"}
            size={24}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SocialListChatButton;
