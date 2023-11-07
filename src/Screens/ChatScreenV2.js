import {
  KeyboardAvoidingView,
  Text,
  View,
  Keyboard,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import ChatListBar from "../Components/Chat/ChatListBar";
import { MessagePanel, MessageTitle } from "../Components/Chat/MessagePanel";
import { useEffect, useRef, useState, useContext, createContext } from "react";
import { ChatData, ChatListItem } from "../Models/MessageCaches";
import DataCenter from "../modules/DataCenter";
import { ChatMessageInput } from "../Components/ChatMessageInput";
import LoginService from "../services/LoginService";
import { LesConstants } from "les-im-components";
import MessageService from "../services/MessageService";
import ChatSearchBottomSheet from "../Components/ChatSearchBottomSheet";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";
import Constants from "../modules/Constants";

export const BubbleContext = createContext();

const ChatScreenV2 = () => {
  const [currChatItem, setCurrChatItem] = useState({
    item: null,
    focusMessageId: null,
  });
  const [currChatData, setCurrChatData] = useState(null);

  const onChatListItemSelected = (item, focusMessageId) => {
    setCurrChatItem({ item, focusMessageId });
  };

  const [quote, setQuote] = useState("");

  // useEffect(() => {

  // }, []);

  const onMessageSendHandler = (newMessage) => {
    if (currChatData == null) return;

    const msg = quote ? newMessage + Constants.quoteDelimiter + quote : newMessage;

    if (currChatData.type === LesConstants.IMMessageType.Single) {
      MessageService.Inst.sendMessage(currChatData.targetId, msg);
    } else {
      MessageService.Inst.sendChatGroupMessage(
        currChatData.targetId, msg
      );
    }
    if (quote) {
      setQuote("");
    }
  };

  useEffect(() => {
    const chatData = DataCenter.messageCache?.getChatDataByChatId(
      currChatItem.item?.chatId ?? "",
      true
    );
    setCurrChatData(chatData);
  }, [currChatItem]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true)
    );
    const keyboardHideListener = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        // keyboardVerticalOffset={isKeyboardVisible ? 0 : 85}
        // className={Platform.OS === "ios" ? "flex-1" : "flex-1 mt-[5vh]"}
        style={{
          // transform: [{ translateY: isKeyboardVisible ? -60 : 0 }],
          marginTop: StatusBar.currentHeight,
          flex: 1,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1">
          <View className="flex-1 flex-row">
            {/* 左侧边栏 */}
            <View className="w-[80px] items-center flex-col">
              <ChatListBar onItemSelected={onChatListItemSelected} />
            </View>
            {/* 右侧聊天区域 */}
            <View className="flex-1 bg-[#262F38]  pl-2 pr-2">
              {/* 聊天框标题 */}

              <MessageTitle chatObj={currChatData} />
              {/* 聊天面板 */}
              <BubbleContext.Provider value={{ quote, setQuote }}>
                <MessagePanel
                  chatData={currChatData}
                  focusMessaageId={currChatItem?.focusMessageId ?? null}
                />
                {/* 文字输入框 */}
                <ChatMessageInput onMessageSendHandler={onMessageSendHandler} />
              </BubbleContext.Provider>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreenV2;
