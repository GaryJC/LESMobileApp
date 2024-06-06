import { useContext, useEffect, useReducer, useRef, useState } from "react";
import ChatGroup from "../../Models/ChatGroup";
import { ChatData } from "../../Models/MessageCaches";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Image,
  TouchableHighlight,
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
import Clipboard from "@react-native-clipboard/clipboard";
import Divider from "../Divider";
import CommonBottomSheetModal from "../CommonBottomSheetModal";
import { BubbleContext } from "../../Screens/ChatScreenV2";
import { MaterialIcons } from "@expo/vector-icons";
import FriendBottomSheet from "../FriendBottomSheet";
import FriendService from "../../services/FriendService";
import DatabaseService from "../../services/DatabaseService";
import DataCenter from "../../modules/DataCenter";
import MessageData from "../../Models/MessageData";
import { AppInfoMap } from "../../modules/AppInfo";

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
    } else {
      const friendInfo = IMUserInfoService.Inst.getCachedUser(target.id).pop();
      JSEvent.emit(UIEvents.Friend.PopupFriendBottomSheet, {
        friendInfo: friendInfo,
      });
    }
  };

  useEffect(() => {
    const onChatGroupUpdated = (cg) => {
      if (_chatObj == null) return;
      if (cg.id == _chatObj.targetId) {
        setGroupTarget(cg);
      }
    };

    const onUserDataUpdated = ({ id }) => {
      if (_chatObj == null) return;
      if (id == _chatObj.targetId) {
        const user = IMUserInfoService.Inst.getCachedUser(id).pop();
        setUserTarget(user);
      }
    };

    const onChatListRemoved = () => { };

    const onFriendStateUIUpdated = ({ id }) => {
      if (target?.id == id) {
        setTarget({ ...target });
      }
    }

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, onChatGroupUpdated);
    JSEvent.on(DataEvents.User.UserState_Changed, onUserDataUpdated);
    var unsubRefresh = JSEvent.on(UIEvents.User.UserState_UIRefresh, onFriendStateUIUpdated);

    return () => {
      JSEvent.remove(DataEvents.User.UserState_Changed, onUserDataUpdated);
      JSEvent.remove(
        DataEvents.ChatGroup.ChatGroup_Updated,
        onChatGroupUpdated
      );
      unsubRefresh();
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

  const gameState = target.type == IMMessageType.Single ? AppInfoMap.getGameState(target.data?.gameState ?? 0, target.data?.state ?? 0) : { playingGame: false };
  const icon = Constants.Icons.getSystemIcon(gameState.icon, null);

  return (
    <View className="flex flex-col">
      <View className="flex-row justify-between px-[10px] pt-[10px] pb-[1px]">
        <View className="flex flex-row justify-start items-center h-[34px]">
          <Text className="text-white font-bold text-[20px] ">{curChatName}</Text>
        </View>
        <View className="flex flex-row items-center">
          {
            gameState.playingGame ? <TouchableHighlight className=" rounded-full" onPress={() => {
              nav.navigate("GameDetails", { gameId: gameState.gameId });
            }}>
              <View className="p-[2px] rounded-full" style={{ backgroundColor: gameState.iconBorder }}>
                <Image source={icon} className="w-[30px] h-[30px] rounded-full" />
              </View>
            </TouchableHighlight> : null
          }
          <TouchableOpacity onPress={goToChatInfoHandler} className="pl-2">
            <Ionicons name="ellipsis-horizontal" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>
      {
        gameState.playingGame ?
          <View className="px-[10px] flex-row items-center justify-end">
            <Text className="text-green-500 text-sm">Playing {gameState.name}</Text>
          </View> : null
      }
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

  //{ sender: null, message: null }
  const [popMessage, setPopMessage] = useState(null);

  const [popUser, setPopUser] = useState(null);

  let moving = false;

  const { quote, setQuote } = useContext(BubbleContext);
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
  const loadMessage = async (chatData, init = false) => {
    if (chatData == null || loading) return;
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

    const msgs = await chatData.getMessagesAsync(start, messageLoadStep);

    // chatData.getMessagesAsync(start, 1000).then(msgs => {
    //   const loaded = {
    //     from: init ? from : messageLoaded.from,
    //     loaded: init ? msgs.length : messageLoaded.loaded + msgs.length,
    //   };
    //   setMessageLoaded(loaded);
    //   dispatchMessages({
    //     type: init ? "RESET_AND_ADD_MESSAGES" : "LOAD_MESSAGE",
    //     payload: msgs,
    //   });
    //   setLoading(false);
    //   if (init) {
    //     flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    //   }
    // }).catch(e => {

    // })

    //old logic
    // const msgs = chatData.getMessages(start, messageLoadStep);

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

  const onScrollDragEnd = async (e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y <= 0 && messageLoaded.from > 0 && loading == false) {
      setLoading(true);

      const start = Math.max(0, messageLoaded.from - messageLoadStep);
      const count = messageLoaded.from - start;

      //const msgs = _chatData.getMessages(start, count);

      const msgs = await chatData.getMessagesAsync(start, count);

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
      {/* {loading ? <View style={{ paddingVertical: 20 }}>
      <ActivityIndicator size="small" />
      </View> : <></>} */}
      <FlatList
        className="pr-2"
        initialNumToRender={10}
        inverted={true}
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => {
          const preMessage = messages[index + 1];
          return (<View>
            {/* {loading && messages.length == index + 1 ? <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" />
            </View> : <></>} */}
            <ChatBubbleV2
              message={item}
              preMessage={preMessage}
              onAvatarPressed={(userInfo) => {
                console.log("pppppppop user", userInfo);
                setPopUser(userInfo);
              }}
              onContentLongPressed={(sender, msg) => {
                setPopMessage({ sender: sender, message: msg });
              }}
            />
          </View>
          );
        }}
        ListEmptyComponent={<Text className="text-white">No messages to display</Text>}
        keyExtractor={(item, index) => item.messageId}
        onScrollEndDrag={onScrollDragEnd}
        onScroll={onScrollDragEnd}
        onEndReachedThreshold={0}
        onEndReached={() => {
          if (!loading) {
            loadMessage(_chatData);
          }
        }}
        onScrollToIndexFailed={(e) => { }}
        ListFooterComponent={
          // loading ? (
          //   <View style={{ paddingVertical: 20 }}>
          //     <ActivityIndicator size="small" />
          //   </View>
          // ) : <View style={{ paddingVertical: 20 }}></View>
          null
        }
      />
      <BubbleBottomSheet
        visible={popMessage != null}
        onClosed={() => setPopMessage(null)}
        sender={popMessage?.sender}
        message={popMessage?.message?.content}
        onAction={(action, msg) => {
          if (action == "Quote") {
            setQuote(msg);
          }
        }}
      />
      <FriendBottomSheet
        visible={popUser != null}
        onClosed={() => setPopUser(null)}
        selectedFriend={popUser}
      />
    </View>
  );
};

const BubbleBottomSheet = ({
  visible,
  onOpen,
  onClosed,
  sender,
  message,
  onAction,
}) => {
  const msg = Constants.splitContent(message);
  const bubbleContent = `${sender?.name}: ${msg.message}`;

  const BubbleOption = ({ title, icon }) => {
    const optionHander = () => {
      switch (title) {
        case "Copy":
          Clipboard.setString(bubbleContent);
          break;
        case "Quote":
          //setQuote(bubbleContent);
          break;
      }
      onAction?.call(this, title, bubbleContent);
      onClosed?.call(this);
    };

    return (
      <>
        <TouchableOpacity onPress={optionHander}>
          <View className="flex-row items-center">
            {icon}
            <Text className="ml-[5px] font-bold text-[15px] text-white">
              {title}
            </Text>
          </View>
        </TouchableOpacity>
        <Divider />
      </>
    );
  };

  return (
    <CommonBottomSheetModal
      visible={visible}
      onOpen={onOpen}
      onClosed={onClosed}
      snapPoints={["40%"]}
      index={0}
      title={"Quote"}
    >
      <View className="flex-1 mx-[5%]">
        <View className="flex flex-row justify-start items-center bg-clr-gray-dark p-[5px] mt-[5px] rounded-[4px]">
          <Text numberOfLines={5} className="text-white flex-1 mr-1">
            {bubbleContent}
          </Text>
        </View>
        <Divider />
        <BubbleOption
          title={"Copy"}
          icon={<MaterialIcons name="file-copy" size={24} color="white" />}
        />
        <BubbleOption
          title={"Quote"}
          icon={<MaterialIcons name="format-quote" size={24} color="white" />}
        />
      </View>
    </CommonBottomSheetModal>
  );
};

export { MessageTitle, MessagePanel };
