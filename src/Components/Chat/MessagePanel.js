import { useEffect, useReducer, useRef, useState } from "react";
import ChatGroup from "../../Models/ChatGroup";
import { ChatData } from "../../Models/MessageCaches";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LesConstants } from "les-im-components";
import ChatGroupService from "../../services/ChatGroupService";
import JSEvent from "../../utils/JSEvent";
import { DataEvents, UIEvents } from "../../modules/Events";
import IMUserInfo from "../../Models/IMUserInfo";
import IMUserInfoService from "../../services/IMUserInfoService";
import { ChatBubble, ChatBubbleV2 } from "../ChatBubble";
import { useNavigation } from "@react-navigation/native";
import Constants from "../../modules/Constants";
import { debounce } from "lodash";

const { IMMessageType, IMGroupMemberState } = LesConstants;
/**
 * 聊天面板标题栏
 * @param {{chatObj:ChatData}} param
 */
const MessageTitle = ({ chatObj }) => {
  const [_chatObj, setChatObj] = useState(chatObj);
  const [target, setTarget] = useState({
    id: 0,
    name: "",
    type: IMMessageType.Single,
    data: null,
  });

  const nav = useNavigation();

  const setGroupTarget = (cg) => {
    if (cg != null) {
      const tn = {
        id: cg.id,
        name: cg.name,
        type: IMMessageType.Group,
        data: cg,
      };
      setTarget(tn);

      ChatGroupService.Inst.getGroupMembers(cg.id, (state) => {
        return state == IMGroupMemberState.Confirmed;
      }).then((members) => {
        //if (target.id == cg.id) {
        const nt = { ...tn };
        nt.members = members;
        setTarget(nt);
        //}
      });
    }
  };

  const setUserTarget = (user) => {
    if (user != null) {
      const tn = {
        id: user.id,
        name: user.name,
        type: IMMessageType.Single,
        data: user,
      };
      setTarget(tn);
    }
  };

  const goToChatInfoHandler = () => {
    if (target.type === IMMessageType.Group) {
      nav.navigate("GroupInfo", { targetId: target.id });
    }
  };

  useEffect(() => {
    onChatGroupUpdated = (cg) => {
      if (_chatObj == null) return;
      if (cg.id == _chatObj.targetId) {
        setGroupTarget(cg);
      }
    };

    onUserDataUpdated = ({ id }) => {
      if (_chatObj == null) return;
      if (id == _chatObj.targetId) {
        const user = IMUserInfoService.Inst.getCachedUser(id).pop();
        setUserTarget(user);
      }
    };

    onChatListRemoved = () => {};

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, onChatGroupUpdated);
    JSEvent.on(DataEvents.User.UserState_Changed, onUserDataUpdated);

    return () => {
      JSEvent.remove(DataEvents.User.UserState_Changed, onUserDataUpdated);
      JSEvent.remove(
        DataEvents.ChatGroup.ChatGroup_Updated,
        onChatGroupUpdated
      );
    };
  }, []);

  useEffect(() => {
    setChatObj(chatObj);
    if (chatObj == null) return;
    if (chatObj.type == IMMessageType.Single) {
      const user = IMUserInfoService.Inst.getCachedUser(chatObj.targetId).pop();
      setUserTarget(user);
    } else if ((chatObj.type = IMMessageType.Group)) {
      const cg = ChatGroupService.Inst.getCachedChatGroup(chatObj.targetId);
      setGroupTarget(cg);
    }
  }, [chatObj]);

  let curChatName = target.name;

  if (target.type == IMMessageType.Group && target.members != null) {
    curChatName += ` (${target.members.length})`;
  }

  return (
    <View className="flex-row justify-between p-[10px]">
      {/* {curUserInfo
            ?.filter((item) => item.id !== DataCenter.userInfo.accountId)
            .map((item, index) => ( */}
      <Text className="text-white font-bold text-[20px]">{curChatName}</Text>
      {/* ))} */}
      <TouchableOpacity onPress={goToChatInfoHandler}>
        <Ionicons name="ellipsis-horizontal" color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const messageReducer = (state, action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      // order
      return [action.payload, ...state];
    case "LOAD_MESSAGE":
      return [...state, ...action.payload];
    case "LOAD_MESSAGE_BEFORE":
      return [...action.payload, ...state];
    case "UPDATE_MESSAGE_STATUS":
      const updatedState = state.map((message) =>
        message.messageId === action.payload.messageId
          ? {
              ...message,
              status: action.payload.status,
              timelineId: action.payload.timelineId,
            }
          : message
      );
      return updatedState.sort((a, b) => b.timelineId - a.timelineId);
    case "RESET_AND_ADD_MESSAGES":
      return [...action.payload];

    case "CLEAR_MESSAGES":
      return [];

    default:
      throw new Error();
  }
};

const messageLoadStep = 10;

/**
 * 聊天面板
 * @param {{chatData:ChatData,focusMessaageId:string}} param
 */
const MessagePanel = ({ chatData, focusMessaageId }) => {
  const [_chatData, setChatData] = useState(chatData);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [messageLoaded, setMessageLoaded] = useState({ from: 0, loaded: 0 });
  const [messages, dispatchMessages] = useReducer(messageReducer, []);
  const [scrollToMsgId, setScrollToMsgId] = useState(null);

  let moving = false;

  const flatListRef = useRef();
  const messagesRef = useRef();
  const chatDataRef = useRef();
  messagesRef.current = messages;
  chatDataRef.current = _chatData;

  /**
   *
   * @param {ChatData} chatData
   * @param {boolean} init
   * @returns
   */
  const loadMessage = (chatData, init = false) => {
    if (chatData == null) return;
    setLoading(true);

    //计算起始消息id
    let from = 0;
    if (focusMessaageId != null) {
      const idx = chatData.indexOf(focusMessaageId);
      if (idx > 0) {
        from = idx - messageLoadStep / 2;
        if (from < 0) from = 0;
      }
    }

    const start = init ? from : messageLoaded.from + messageLoaded.loaded;
    const msgs = chatData.getMessages(start, messageLoadStep);

    const loaded = {
      from: init ? from : messageLoaded.from,
      loaded: init ? msgs.length : messageLoaded.loaded + msgs.length,
    };
    setMessageLoaded(loaded);

    dispatchMessages({
      type: init ? "RESET_AND_ADD_MESSAGES" : "LOAD_MESSAGE",
      payload: msgs,
    });
    setLoading(false);
    if (init) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  };

  /**
   * 指定对话有数据更新时执行
   * @param {{string, MessageData}} chatId
   */
  const msgListener = ({ chatId, msgData }) => {
    // 如果当前chatId和接受到的信息chatId匹配就直接更新UI
    const _chatData = chatDataRef.current;
    if (_chatData == null || _chatData.chatId != chatId) return;
    const isExisted = messagesRef.current.find(
      (item) => item.messageId === msgData.messageId
    );
    if (isExisted) {
      dispatchMessages({
        type: "UPDATE_MESSAGE_STATUS",
        payload: msgData,
      });
    } else {
      dispatchMessages({
        type: "ADD_MESSAGE",
        payload: msgData,
      });
      const loaded = {
        from: messageLoaded.from,
        loaded: messageLoaded.loaded + 1,
      };
      setMessageLoaded(loaded);
    }
  };

  const onScrollDragEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y <= 0 && messageLoaded.from > 0 && loading == false) {
      setLoading(true);

      const start = Math.max(0, messageLoaded.from - messageLoadStep);
      const count = messageLoaded.from - start;

      const msgs = _chatData.getMessages(start, count);

      const loaded = { from: start, loaded: messageLoaded.loaded + count };
      setMessageLoaded(loaded);
      dispatchMessages({
        type: "LOAD_MESSAGE_BEFORE",
        payload: msgs,
      });
      setScrollToMsgId(messagesRef.current[0].messageId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollToMsgId != null) {
      const idx = messagesRef.current.findIndex(
        (msg) => msg.messageId == scrollToMsgId
      );
      if (idx >= 0) {
        flatListRef.current.scrollToIndex({
          animated: false,
          index: idx,
          viewPosition: 0,
        });
      }
    }
    setScrollToMsgId(null);
  }, [scrollToMsgId]);

  useEffect(() => {
    JSEvent.on(UIEvents.Message.Message_Chat_Updated, msgListener);
    return () => {
      JSEvent.remove(UIEvents.Message.Message_Chat_Updated, msgListener);
    };
  }, [messageLoaded]);

  useEffect(() => {
    setChatData(chatData);
    loadMessage(chatData, true);
  }, [chatData, focusMessaageId]);

  return (
    <View className="flex-1">
      <FlatList
        className="pr-2"
        initialNumToRender={10}
        inverted={true}
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => {
          const preMessage = messages[index + 1];
          return <ChatBubbleV2 message={item} preMessage={preMessage} />;
        }}
        ListEmptyComponent={<Text>No messages to display</Text>}
        keyExtractor={(item, index) => item.messageId}
        onScrollEndDrag={onScrollDragEnd}
        onScroll={onScrollDragEnd}
        onEndReachedThreshold={0.05}
        onEndReached={() => {
          if (!loading) {
            loadMessage(_chatData);
          }
        }}
        onScrollToIndexFailed={(e) => {}}
        ListFooterComponent={
          loading ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export { MessageTitle, MessagePanel };
