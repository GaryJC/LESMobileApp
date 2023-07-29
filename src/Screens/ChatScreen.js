import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
// import { MessageData, ChatListData } from "../Data/dummyData";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useReducer,
  useCallback,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";
import FriendService from "../services/FriendService";
import MessageService from "../services/MessageService";
import JSEvent from "../utils/JSEvent";
import { UIEvents, DataEvents } from "../modules/Events";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import IMUserInfoService from "../services/IMUserInfoService";
import { ChatBubble } from "../Components/ChatBubble";
import { ChatList } from "../Components/ChatList";
import MessageData from "../Models/MessageData";
import ChatSearchBottomSheet from "../Components/SearchBottomSheet";
import { useNavigation } from "@react-navigation/native";
import { debounce, result } from "lodash";
import { LesConstants } from "les-im-components";
import { useRoute } from "@react-navigation/native";
import ChatGroupService from "../services/ChatGroupService";

// import { bottomTabHeight } from "../App";

const statusBarHeight = StatusBar.currentHeight;
// console.log(statusBarHeight);

const messageReducer = (state, action) => {
  // console.log("reducer: ", state, action);
  switch (action.type) {
    case "ADD_MESSAGE":
      // order
      return [...state, action.payload];
    case "LOAD_MESSAGE":
      return [...action.payload, ...state];
    case "UPDATE_MESSAGE_STATUS":
      // console.log(state);
      // let updatedState = state.map((message) =>
      //   message.messageId === action.payload.messageId
      //     ? { ...message, status: action.payload.status }
      //     : message
      // );
      // // Check if the message already exists in the state using find
      // let messageExists = state.find(
      //   (message) => message.messageId === action.payload.messageId
      // );
      // // If message with the 'delivered' status does not exist in the state, add it
      // if (
      //   !messageExists &&
      //   action.payload.status === Constants.deliveryState.delivered
      // ) {
      //   updatedState = [...updatedState, action.payload];
      // }
      // console.log("updatedState: ", updatedState);
      // return updatedState;

      const updatedState = state.map((message) =>
        message.messageId === action.payload.messageId
          ? {
              ...message,
              status: action.payload.status,
              timelineId: action.payload.timelineId,
            }
          : message
      );
      // console.log("updated messages: ", updatedState);
      return updatedState.sort((a, b) => a.timelineId - b.timelineId);

    case "RESET_AND_ADD_MESSAGES":
      // return action.payload.map((messageData) => {
      //   // Check if the message already exists in the state using find
      //   let existingMessage = state.find(
      //     (message) => message.messageId === messageData.messageId
      //   );
      //   if (existingMessage) {
      //     // If message already exists in the state, update its status
      //     if (messageData.status === Constants.deliveryState.delivered) {
      //       return { ...existingMessage, status: messageData.status };
      //     } else {
      //       return existingMessage;
      //     }
      //   } else {
      //     // If message does not exist in the state and its status is 'delivered', add it
      //     if (messageData.status === Constants.deliveryState.delivered) {
      //       return messageData;
      //     }
      //   }
      // });
      return action.payload.sort((a, b) => a.timelineId - b.timelineId);

    case "CLEAR_MESSAGES":
      return [];

    default:
      throw new Error();
  }
};

const ChatScreen = () => {
  // 输入框输入的消息
  const [newMessage, setNewMessage] = useState("");
  // 当前chatid
  const [curChatId, setCurChatId] = useState();
  // 当前选择的聊天对象的id
  const [curRecipientId, setCurRecipientId] = useState();
  // 当前聊天对象的名字
  // const [curRecipientName, setCurRecipientName] = useState([]);
  // 当前聊天窗口的的头像
  // const [curChatAvatar, setCurChatAvatar] = useState([]);
  const [curUserInfo, setCurUserInfo] = useState([]);
  // 聊天列表
  const [chatListData, setChatListData] = useState([]);
  // 当前聊天窗口的聊天记录
  const [messages, dispatchMessages] = useReducer(messageReducer, []);
  // console.log("messages: ", messages);
  // 每个聊天列表的新消息数量
  const [newMsgCount, setNewMsgCount] = useState([]);
  // 读取数据的起始index
  const [startIndex, setStartIndex] = useState(0);
  // 是否在拉取数据
  const [isLoading, setIsLoading] = useState(false);
  // 初始显示的消息数量
  const [loadCount, setLoadCount] = useState(9);
  // 聊天搜索窗口是否打开
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  const [chatListInfo, setChatListInfo] = useState([]);

  const [curChatName, setCurChatName] = useState();

  const [curChatType, setCurChatType] = useState(
    LesConstants.IMMessageType.Single
  );

  const messagesRef = useRef();

  const bottomSheetRef = useRef(null);

  messagesRef.current = messages;

  const navigation = useNavigation();

  const route = useRoute();

  const loadMoreMessages = async () => {
    // setStartIndex((pre) => pre + 10);
    console.log("startIndex: ", startIndex);
    const loadedData = DataCenter.messageCache.getMesssageList(
      curChatId,
      startIndex,
      loadCount
    );
    if (loadedData.length > 0) {
      loadedData.reverse();
      // setStartIndex((pre) => pre + loadedData.length);
      dispatchMessages({
        type: "LOAD_MESSAGE",
        payload: loadedData,
      });
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleScrollEnd = async (event) => {
    console.log("scroll to end");
    if (event.nativeEvent.contentOffset.y === 0) {
      setIsLoading(true);
      // setTimeout(() => {
      loadMoreMessages();
      // }, 100);
      // await loadMoreMessages(); // directly calling loadMoreMessages
    }
  };

  const renderHeader = () => {
    if (!isLoading) return null;
    console.log("is loading: ", isLoading);
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  /**
   * 指定对话有数据更新时执行
   * @param {{string, MessageData}} chatId
   */
  const msgListener = ({ chatId, msgData }) => {
    // 如果聊天列表为空，来了新消息，直接显示
    console.log("msgData: ", msgData);

    // 如果当前chatId和接受到的信息chatId匹配就直接更新UI
    console.log("cur chat id and message id: ", curChatId, chatId);
    if (curChatId === chatId) {
      const isExisted = messagesRef.current.find(
        (item) => item.messageId === msgData.messageId
      );
      console.log("is existed? ", isExisted);
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
      }
    }
  };

  /**
   * 将获取的chatList数据转换成UI需要的格式
   * @param {ChatListItem[]} chatList
   * @returns {chatListData}
   */
  const handleChatListData = (chatList) => {
    // 将原始的数据转换成UI所需要的数据
    console.log("ccccc: ", chatList);
    const chatListData = chatList.map((item) => {
      // const targetId = item.targetId;
      // 目前头像为空，先用placeholder
      // const avatar = IMUserInfoService.Inst.getUser(targetId).avatar;
      if (item.type === LesConstants.IMMessageType.Single) {
        const chatId = item.chatId;
        let targetId = item.targetId;
        if (!targetId) {
          const [smallerId, biggerId] = chatId.split("-").slice(1, 3);
          targetId =
            smallerId == DataCenter.userInfo.accountId ? biggerId : smallerId;
        }
        const avatar = `https://i.pravatar.cc/150?img=${targetId}`;
        // console.log("mmm: ", item, chatId, targetId);
        return {
          chatId: chatId,
          targetId: targetId,
          type: item.type,
          avatar: avatar,
          name: targetId,
        };
      } else {
        const chatId = item.chatId;
        const avatar = `https://i.pravatar.cc/150?img=${1}`;
        return {
          chatId: chatId,
          targetId: chatId,
          avatar: avatar,
          name: "group",
        };
      }
    });
    // console.log("hhhhh: ", chatListData);
    return chatListData;
  };

  /**
   * 对话列表有数据更新时执行
   * 重新排序对话列表
   * 获取新消息数量
   * @param {string | null} chatId
   */
  const chatListListener = ({ chatId, action }) => {
    console.log("chat id & action: ", chatId, action, curChatId);
    if (action === "delete" && chatId === curChatId) {
      setCurUserInfo(null);
      dispatchMessages({
        type: "CLEAR_MESSAGES",
      });
    }
    // 重新将对话列表排序
    const chatList = DataCenter.messageCache.getChatList();
    console.log("chat listttt: ", chatList);
    // setChatListData(handleChatListData(chatList));
    setChatListData(chatList);
    // console.log("chat list listener updated id: ", chatId, chatList);

    // 获取新消息数量
    const chatListNewMsgCount = getChatListMsgCount(chatList);
    setNewMsgCount(chatListNewMsgCount);
  };

  /**
   * 点击chatList切换聊天对象时更新UI
   *
   * @param {string} chatId
   * @param {string} name
   * @param {number} targetId
   * @param {MessageData} data
   */
  const onClickChatHandler = async ({ chatListItem }) => {
    console.log("cccc: ", chatListItem, chatListData, chatListInfo);
    // 如果当前的列表不存在这个item
    // 这时的情况可能是新建群或者从用户列表进入
    if (!chatListData.some((item) => item.targetId === chatListItem.targetId)) {
      const getChatInfo = async () => {
        if (chatListItem.type === LesConstants.IMMessageType.Single) {
          return (
            await IMUserInfoService.Inst.getUser(chatListItem.targetId)
          ).pop();
        } else {
          return await ChatGroupService.Inst.getChatGroup(
            chatListItem.targetId
          );
        }
      };
      const chatInfo = await getChatInfo();
      console.log("snnbn", chatInfo, chatListInfo);
      setChatListInfo((pre) => [...pre, chatInfo]);
    }

    const { chatId, targetId, type } = chatListItem;
    console.log("chatId & targetId: ", chatId, targetId, curChatId);
    // 已经在这个窗口的话不操作
    if (curChatId !== chatId) {
      updateChatHandler(chatId, targetId, type);
      // const count =
      //   DataCenter.messageCache.getChatDataByChatId(chatId).messageList.length;
      dispatchMessages({
        type: "RESET_AND_ADD_MESSAGES",
        payload: DataCenter.messageCache.getMesssageList(chatId, 0, loadCount),
        // .reverse(),
      });
    }
    console.log("switched chat id: ", chatId);
  };

  const updateChatHandler = async (chatId, targetId, type) => {
    const chatListItem = DataCenter.messageCache.touchChatData(chatId);
    // console.log("chat list item: ", chatListItem);
    setCurChatId(chatId);
    setCurRecipientId(targetId);
    chatListListener({ chatId: chatId });
    if (type === LesConstants.IMMessageType.Group) {
      setCurChatType(LesConstants.IMMessageType.Group);
      // const name = chatListInfo.find((item) => item.id === targetId);
      // setCurChatName(name);
      // 获取当前群聊信息，如所有成员的targetId等
      const groupInfo = await ChatGroupService.Inst.getChatGroup(targetId);
      let groupMembers = await ChatGroupService.Inst.getGroupMembers(targetId);
      groupMembers = groupMembers.map((item) => item.userInfo);
      setCurChatName(groupInfo.name);
      // const userInfo = getUserInfo(targetId);
      // console.log("cur user info: ", userInfo);
      // setCurUserInfo(groupMembers);
      // console.log("ppppp: ", groupMembers);
    } else {
      const userInfo = await getUserInfo(targetId);
      const targetName = userInfo
        .filter((item) => item.id !== DataCenter.userInfo.accountId)
        .pop().name;
      setCurChatName(targetName);
      setCurUserInfo(userInfo);
      setCurChatType(LesConstants.IMMessageType.Single);
    }
  };

  const onSearchUpdateHandler = ({ chatId, targetId, messageId, data }) => {
    updateChatHandler(chatId, targetId);
    dispatchMessages({
      type: "RESET_AND_ADD_MESSAGES",
      payload: data,
      // .reverse(),
    });
    // const index = messages.findIndex((msg) => msg.messageId === messageId);
    // flatListRef.current.scrollToIndex({ index });
  };

  /**
   * 获取当前聊天窗口所有对象的信息
   * @param {number|number[]} targetId
   * @returns {userInfo}
   */
  const getUserInfo = async (targetId) => {
    // 目前头像为空，先用placeholder
    try {
      const oppositeInfo = await IMUserInfoService.Inst.getUser(targetId);
      // console.log("rrrr", result);
      // const oppositeInfo = result.map((item) => {
      //   console.log("iii", item.id, item.tag, item.name);
      //   return {
      //     id: item.id,
      //     // avatar: `https://i.pravatar.cc/150?img=${item.id}`,
      //     tag: item.tag,
      //     name: item.name,
      //   };
      // });
      // 加入用户自己的信息
      const userInfo = [
        ...oppositeInfo,
        {
          id: DataCenter.userInfo.accountId,
          // avatar: `https://i.pravatar.cc/150?img=${DataCenter.userInfo.accountId}`,
          tag: DataCenter.userInfo.imUserInfo.tag,
          name: DataCenter.userInfo.imUserInfo.name,
        },
      ];
      return userInfo;
    } catch (e) {
      console.log("get user info error: ", e);
    }
  };

  /**
   * 获取消息列表中的新消息数量
   * @param {ChatListItem[]} chatList
   * @returns {chatListNewMsgCount}
   */
  const getChatListMsgCount = (chatList) => {
    const chatListNewMsgCount = chatList.map((item) => {
      return item.chatId === curChatId
        ? { chatId: item.chatId, newMessageCount: 0 }
        : { chatId: item.chatId, newMessageCount: item.newMessageCount };
    });
    console.log("chat list new msg count: ", chatListNewMsgCount);
    return chatListNewMsgCount;
  };

  useEffect(() => {
    const initializeChatData = async (chatListItem) => {
      const { chatId, targetId, type } = chatListItem;

      updateChatHandler(chatId, targetId, type);

      const messageData = DataCenter.messageCache.getMesssageList(
        chatId,
        startIndex,
        loadCount
      );
      console.log("message dataaa:", messageData, chatId);
      dispatchMessages({
        type: "RESET_AND_ADD_MESSAGES",
        payload: messageData,
      });

      setCurRecipientId(targetId);
      const userInfo = await getUserInfo(targetId);
      console.log("cur user info:", userInfo, targetId);
      setCurUserInfo(userInfo);
    };

    const getInitData = async () => {
      const chatList = DataCenter.messageCache.getChatList();
      // let chatId = DataCenter.messageCache.getCurChatId();
      // let initChatListItem = DataCenter.messageCache.getCurChatListItem();

      // let initChatListItem = route.params?.chatListItem;
      // console.log("ccccm: ", initChatListItem);
      // const res = await ChatGroupService.Inst.getChatGroup(291467793747173400);
      // console.log("rrrr: ", res);
      console.log("chat list:", chatList);
      // 如果缓存中存在聊天列表
      if (chatList.length) {
        const getChatListInfo = async () => {
          const promises = chatList.map(
            (item) => {
              if (item.type === LesConstants.IMMessageType.Single) {
                return IMUserInfoService.Inst.getUser(item.targetId);
              } else {
                return ChatGroupService.Inst.getChatGroup(item.targetId);
              }
            }
            // IMUserInfoService.Inst.getUser(item.targetId)
          );
          try {
            let result = await Promise.all(promises);
            result = result.map((item) => {
              if (Array.isArray(item)) {
                // const info = item.pop();
                return { ...item.pop(), type: Constants.ChatListType.Single };
              } else {
                return { ...item, type: Constants.ChatListType.Group };
              }
            });
            console.log("chat list info ", result);
            setChatListInfo(result);
            // return result;
          } catch (e) {
            console.log(e);
          }
        };

        getChatListInfo();
        // setChatListInfo(getChatListInfo());

        const chatListNewMsgCount = getChatListMsgCount(chatList);
        console.log("cb", chatListNewMsgCount);
        setNewMsgCount(chatListNewMsgCount);
        // 如果用户不是在打开聊天窗口前从好友列表进入的
        // 获取头部列表
        // if (!initChatListItem) {
        const initChatListItem = chatList[0];
        // }
        setCurChatId(initChatListItem.chatId);
        initializeChatData(initChatListItem);
      }
      // else if (initChatListItem) {
      // 如果缓存中不存在聊天列表
      // 用户是在打开聊天窗口前从好友列表进入的
      // const userData = await IMUserInfoService.Inst.getUser(item.targetId);
      // console.log("uuu: ", userData);
      // initializeChatData(initChatListItem);
      // setCurChatId(initChatListItem.chatId);
      // 以后会有群组会在好友列表里吗
      // setChatListInfo([{ ...userData, type: Constants.ChatListType.Single }]);
    };
    // 如果聊天列表为空，但缓存中存在当前chatid，证明用户从好友列表进入
    // else if (!chatList.length && initChatListItem) {
    //   setCurChatId(initChatListItem.chatId);
    //   initializeChatData(initChatListItem);
    // }
    // };

    getInitData();
  }, []);

  useEffect(() => {
    JSEvent.on(UIEvents.Message.Message_Chat_Updated, msgListener);
    JSEvent.on(UIEvents.Message.Message_Chat_List_Updated, chatListListener);
    JSEvent.on(UIEvents.User.User_Click_Chat_Updated, onClickChatHandler);
    JSEvent.on(UIEvents.Message.Message_Search_Updated, onSearchUpdateHandler);
    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, (chatGroup) => {
      console.log("updated chat group: ", chatGroup);
    });

    return () => {
      JSEvent.remove(UIEvents.Message.Message_Chat_Updated, msgListener);
      JSEvent.remove(
        UIEvents.Message.Message_Chat_List_Updated,
        chatListListener
      );
      JSEvent.remove(UIEvents.User.User_Click_Chat_Updated, onClickChatHandler);
      JSEvent.remove(
        UIEvents.Message.Message_Search_Updated,
        onSearchUpdateHandler
      );
      JSEvent.remove(DataEvents.ChatGroup.ChatGroup_Updated);
    };
  }, [curChatId]);

  useEffect(() => {
    console.log("messages length: ", messages.length);
    setStartIndex(messages.length);
  }, [messages]);

  const flatListRef = useRef();

  const onMessageSendHandler = () => {
    if (curChatType === LesConstants.IMMessageType.Single) {
      MessageService.Inst.sendMessage(curRecipientId, newMessage);
    } else {
      MessageService.Inst.sendChatGroupMessage(curRecipientId, newMessage);
    }

    flatListRef.current?.scrollToEnd({ animated: true });
    // const msgData = new MessageData();
    // msgData.content = newMessage;
    // msgData.senderId = DataCenter.userInfo.accountId;
    // msgData.status = Constants.deliveryState.delivering;
    // dispatchMessages({
    //   type: "ADD_MESSAGE",
    //   payload: msgData,
    // });
  };

  const handleSheetOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleSheetEnd = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    console.log("The bottom sheet is now closed");
  }, []);

  const handleCreateGroupOpen = () => {
    navigation.navigate("GroupCreate");
  };

  const goToChatInfoHandler = () => {
    if (curChatType === Constants.ChatListType.Group) {
      navigation.navigate("GroupInfo", { targetId: curRecipientId });
    }
  };

  return (
    <View className="flex-1 flex-row pt-[5vh]">
      <View className="w-[20%] items-center flex-col">
        <View className="flex-1">
          <FlatList
            data={chatListData}
            renderItem={({ item }) => (
              // ChatList(item, onClickChatHandler)
              <ChatList
                curChatId={curChatId}
                chatListItem={item}
                // chatId={item.chatId}
                // avatar={item.avatar}
                // targetId={item.targetId}
                // chatListInfo={chatListInfo.find(
                //   (chatList) => chatList?.id === item.targetId
                // )}
                chatListInfo={chatListInfo}
                chatListNewMsgCount={newMsgCount}
                onClickChatHandler={onClickChatHandler}
              />
            )}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
          />
        </View>
        <View className="flex-2 justify-evenly border-t-2 border-[#575757] p-[5px]">
          <TouchableHighlight onPress={handleSheetOpen}>
            <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
              <Ionicons name="search-outline" color="#5FB54F" size={24} />
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={handleCreateGroupOpen}>
            <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
              <Ionicons name="add-outline" color="#5FB54F" size={24}></Ionicons>
            </View>
          </TouchableHighlight>
        </View>
      </View>
      <View className="flex-1 bg-[#262F38] rounded-lg">
        <View className="flex-row justify-between p-[10px]">
          {/* {curUserInfo
            ?.filter((item) => item.id !== DataCenter.userInfo.accountId)
            .map((item, index) => ( */}
          <Text className="text-white font-bold text-[20px]">
            {curChatName}
          </Text>
          {/* ))} */}
          <TouchableOpacity onPress={goToChatInfoHandler}>
            <Ionicons name="ellipsis-horizontal" color="white" size={24} />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // behavior="position"
          className="flex-1 px-[10px] mb"
          // keyboardVerticalOffset={-400}
          // keyboardVerticalOffset={140}
        >
          {/* <KeyboardAwareFlatList
          className="flex-1"
          // keyboardShouldPersistTaps="always"
        > */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => {
              const preMessage = messages[index - 1];
              return (
                <ChatBubble
                  // senderId={item.senderId}
                  // content={item.content}
                  // timestamp={item.timestamp}
                  // status={item.status}
                  message={item}
                  preMessage={preMessage}
                  userInfo={curUserInfo?.find(
                    (user) => user.id === item.senderId
                  )}
                />
              );
            }}
            ListEmptyComponent={<Text>No messages to display</Text>}
            keyExtractor={(item, index) => index.toString()}
            // onContentSizeChange={() =>
            //   messages.length > 0 &&
            //   flatListRef.current?.scrollToEnd({ animated: true })
            // }
            // onLayout={() =>
            //   messages.length > 0 &&
            //   flatListRef.current?.scrollToEnd({ animated: true })
            // }
            // onEndReached={() => console.log("end")}
            // inverted
            onMomentumScrollEnd={handleScrollEnd}
            // ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
          />

          <View className="flex-row items-center py-[10px] h-[50px]">
            <TextInput
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              className="flex-1 bg-[#1B1B1B] rounded h-[100%] mr-[10px] p-[5px] text-[#CACACA]"
              // onSubmitEditing={sendMessage}
              placeholderTextColor="#CACACA"
            />
            <TouchableOpacity
              onPress={onMessageSendHandler}
              className="bg-[#6E5EDB] p-[5px] rounded"
            >
              <Text className="text-white font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {/* </KeyboardAwareFlatList> */}
      </View>
      <ChatSearchBottomSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};

export default ChatScreen;
