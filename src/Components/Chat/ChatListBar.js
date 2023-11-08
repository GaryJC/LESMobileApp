import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import DataCenter from "../../modules/DataCenter";
import { ChatList } from "../ChatList";
import { ChatListItem } from "../../Models/MessageCaches";
import { useEffect, useRef, useState } from "react";
import JSEvent from "../../utils/JSEvent";
import { DataEvents, UIEvents } from "../../modules/Events";
import { TouchableHighlight } from "react-native-gesture-handler";
import Avatar from "../Avatar";
import Constants from "../../modules/Constants";
import { LesConstants } from "les-im-components";
import IMUserInfoService from "../../services/IMUserInfoService";
import ChatGroupService from "../../services/ChatGroupService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ChatSearchBottomSheet from "../ChatSearchBottomSheet";
import { StateIndicator } from "../StateIndicator";
import Popover from "react-native-popover-view";
import { MaterialIcons } from "@expo/vector-icons";
import Divider from "../Divider";

const { IMMessageType } = LesConstants;
/**
 * ChatScreenV2左侧聊天列表
 * @param {{onItemSelected:(item:ChatListItem, focusMsgId:string|null)=>void}} params
 */
export default ChatListBar = ({ onItemSelected }) => {
  const [chatList, setChatList] = useState(
    DataCenter.messageCache.getChatList() ?? []
  );

  const [currSelId, setCurrSelId] = useState("");
  const [focus, setFocus] = useState(false);

  const nav = useNavigation();
  const bottomSheetRef = useRef(null);
  const flatListRef = useRef();

  /**
   * 接收点击chatList切换聊天对象的事件
   */
  const onClickChatHandler = async ({ chatListItem }) => {
    const { chatId, targetId, type } = chatListItem;
    if (!chatList.some((item) => item.chatId === chatId)) {
      //当前会话列表不包含这个对话id，刷新对话列表
      DataCenter.messageCache.getChatListItem(chatId);
      setChatList(DataCenter.messageCache.getChatList());
    }

    // 已经在这个窗口的话不操作
    if (currSelId !== chatId) {
      setCurrSelId(chatId);
      if (onItemSelected) {
        onItemSelected(chatListItem);
      }
    }
  };

  const onItemUpdated = (item) => {
    setChatList(DataCenter.messageCache.getChatList());
    if (focus && item.chatId == currSelId) {
      DataCenter.messageCache.touchChatData(currSelId);
    }
  };

  const onItemRemoved = (chatId) => {
    const chatList = DataCenter.messageCache.getChatList();
    setChatList(chatList);
    // 如果删除的正好是当前聊天列表
    if (currSelId === chatId) {
      const latestChatId = chatList.length == 0 ? "" : chatList[0].chatId;
      setCurrSelId(latestChatId);
      if (onItemSelected) {
        const currSel = DataCenter.messageCache.getChatListItem(latestChatId);
        if (currSel != null) {
          onItemSelected(currSel);
        } else {
          onItemSelected(null);
        }
      }
    }
  };

  useEffect(() => {
    JSEvent.on(UIEvents.Message.Message_Chat_List_Updated, onItemUpdated);
    JSEvent.on(UIEvents.User.User_Click_Chat_Updated, onClickChatHandler);
    JSEvent.on(UIEvents.Message.Message_Chat_List_Removed, onItemRemoved);
    return () => {
      JSEvent.remove(UIEvents.Message.Message_Chat_List_Updated, onItemUpdated);
      JSEvent.remove(UIEvents.User.User_Click_Chat_Updated, onClickChatHandler);
      JSEvent.remove(UIEvents.Message.Message_Chat_List_Removed, onItemRemoved);
    };
  }, [currSelId, focus]);

  useEffect(() => {
    //获得焦点时要清理掉当前选中聊天的newMessageCount
    if (focus && currSelId != "") {
      DataCenter.messageCache.touchChatData(currSelId);
    }
  }, [focus]);

  const onSearchUpdateHandler = ({ chatId, targetId, messageId, data }) => {
    setCurrSelId(chatId);
    if (onItemSelected) {
      onItemSelected(
        DataCenter.messageCache.getChatListItem(chatId),
        messageId
      );
    }
  };

  useEffect(() => {
    const focusListener = (e) => {
      if (e.type == "focus") {
        //获得焦点
        setFocus(true);
      } else {
        //失去焦点
        setFocus(false);
      }
    };
    nav.addListener("focus", focusListener);
    nav.addListener("blur", focusListener);

    const selChatId = chatList.length == 0 ? "" : chatList[0].chatId;
    setCurrSelId(selChatId);
    if (onItemSelected) {
      const currSel = DataCenter.messageCache.getChatListItem(selChatId);
      if (currSel != null) {
        onItemSelected(currSel);
      }
    }

    JSEvent.on(UIEvents.Message.Message_Search_Updated, onSearchUpdateHandler);

    // JSEvent.on(DataEvents.User.UserState_DataReady, );

    return () => {
      nav.removeListener("focus", focusListener);
      nav.removeListener("blur", focusListener);

      JSEvent.remove(
        UIEvents.Message.Message_Search_Updated,
        onSearchUpdateHandler
      );

      //   JSEvent.remove(DataEvents.User.UserState_DataReady);
    };
  }, []);

  /**
   *
   * @param {ChatListItem} item
   */
  const onItemClicked = (item) => {
    if (currSelId != item.chatId) {
      setCurrSelId(item.chatId);
      if (onItemSelected) {
        onItemSelected(item);
      }
    }
  };

  const handleCreateGroupOpen = () => {
    nav.navigate("GroupCreate");
  };

  const handleSearchAction = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <View className="flex-1 flex-col">
      <FlatList
        ref={flatListRef}
        data={chatList}
        renderItem={({ item }) => {
          return (
            <ChatListBarItem
              chatListItemData={item}
              isSelected={currSelId == item.chatId}
              onClick={onItemClicked}
            />
          );
        }}
        keyExtractor={(item, index) =>
          item.chatId ? item.chatId : index.toString()
        }
      />
      <View className="flex-2 justify-evenly border-t-2 border-[#575757] m-[5px] pt-2 pb-2 pr-2 items-center">
        <TouchableHighlight onPress={handleSearchAction}>
          <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
            <Ionicons name="search-outline" color="#5FB54F" size={24} />
          </View>
        </TouchableHighlight>

        <Popover
          popoverStyle={{
            backgroundColor: "#505050",
          }}
          backgroundStyle={{
            backgroundColor: 0,
          }}
          from={
            <TouchableHighlight>
              <View className="overflow-hidden w-[40px] h-[40px] bg-[#262F38] rounded-full mb-[5px] items-center justify-center">
                <Ionicons
                  name="add-outline"
                  color="#5FB54F"
                  size={24}
                ></Ionicons>
              </View>
            </TouchableHighlight>
          }
        >
          <AddPopupMenu nav={nav} />
        </Popover>
      </View>
      <ChatSearchBottomSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};

const AddPopupMenu = ({ nav }) => {
  const popMenuHandler = (option) => {
    if (option === "CreateGroup") {
      nav.navigate("GroupCreate");
    } else {
      nav.navigate("FriendAdd");
    }
  };

  return (
    <View className="p-[10px]">
      <TouchableOpacity onPress={() => popMenuHandler("AddFriend")}>
        <View className="flex-row items-center my-[5px]">
          <MaterialIcons name="person-add-alt-1" size={20} color="white" />
          <Text className="ml-[5px] text-[16px] text-white font-bold">
            Add Friends
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => popMenuHandler("CreateGroup")}>
        <View className="flex-row items-center my-[5px]">
          <MaterialIcons name="group-add" size={20} color="white" />
          <Text className="ml-[5px] text-[16px] text-white font-bold">
            Create a group
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * 左侧聊天列表的列表项
 * @param {{chatListItemData:ChatListItem, isSelected:boolean, onClick:(chatListItemData:ChatListItem)=>void}} params
 */
const ChatListBarItem = ({ chatListItemData, isSelected, onClick }) => {
  const [itemData, setItemData] = useState([chatListItemData]);
  const [target, setTarget] = useState(null);
  const [selected, setSelected] = useState(isSelected);

  useEffect(() => {
    setSelected(isSelected);
    if (isSelected != selected) {
      const item = DataCenter.messageCache.touchChatData(itemData[0].chatId);
      setItemData([item]);
    }
  }, [isSelected]);

  useEffect(() => {
    const onItemUpdated = (item) => {
      if (item.chatId == itemData[0].chatId) {
        const newData = DataCenter.messageCache.getChatListItem(item.chatId);
        setItemData([newData]);
      }
    };

    const onChatGroupUpdated = (cg) => {
      if (cg.id == itemData[0].targetId) {
        const tn = { ...target };
        tn.data = cg;
        setTarget(tn);
      }
    };

    const onUserDataUpdated = ({ id }) => {
      if (id == itemData[0].targetId) {
        const user = IMUserInfoService.Inst.getCachedUser(id).pop();
        const tn = { ...target };
        tn.data = user;
        setTarget(tn);
      }
    };

    const t = { id: itemData[0].targetId };
    if (itemData[0].type == IMMessageType.Group) {
      t.data = ChatGroupService.Inst.getCachedChatGroup(itemData[0].targetId);
    } else {
      t.data = IMUserInfoService.Inst.getCachedUser(itemData[0].targetId).pop();
    }

    setTarget(t);

    JSEvent.on(DataEvents.ChatGroup.ChatGroup_Updated, onChatGroupUpdated);
    JSEvent.on(DataEvents.User.UserState_Changed, onUserDataUpdated);
    JSEvent.on(UIEvents.Message.Message_Chat_List_Updated, onItemUpdated);

    return () => {
      JSEvent.remove(UIEvents.Message.Message_Chat_List_Updated, onItemUpdated);
      JSEvent.remove(DataEvents.User.UserState_Changed, onUserDataUpdated);
      JSEvent.remove(
        DataEvents.ChatGroup.ChatGroup_Updated,
        onChatGroupUpdated
      );
    };
  }, []);

  const countBadgeClass =
    itemData[0].type == IMMessageType.Group
      ? "absolute bottom-[-5px] right-[-5px] rounded-full w-[20px] h-[20px] bg-[#FF3737] justify-center items-center"
      : "absolute bottom-0 right-0 rounded-full w-[20px] h-[20px] bg-[#FF3737] justify-center items-center";
  const countBadge =
    itemData[0].newMessageCount == 0 || isSelected ? (
      itemData[0].type == IMMessageType.Group ? (
        <></>
      ) : (
        <View className="absolute right-0 bottom-0">
          <StateIndicator
            state={target?.data?.state}
            onlineState={target?.data?.onlineState}
            bgColor={"#080F14"}
          />
        </View>
      )
    ) : (
      <View className={countBadgeClass}>
        <Text className="text-white font-bold text-[10px]">
          {itemData[0].newMessageCount > 99
            ? "99+"
            : itemData[0].newMessageCount}
        </Text>
      </View>
    );

  const bgClass = isSelected ? "bg-[#262F38]" : "";

  return (
    <View className={bgClass}>
      <TouchableHighlight
        onPress={() => {
          if (onClick != null) onClick(itemData[0]);
        }}
      >
        <View className="relative w-20 h-[70px] justify-center items-center">
          <Avatar
            size={{ w: 50, h: 50, font: 20, groupMark: 20 }}
            tag={target?.data?.tag ?? 0}
            name={target?.data?.name ?? "?"}
            avatar={target?.data?.avatar}
            isGroup={itemData[0]?.type === Constants.ChatListType.Group && true}
            isSelected={selected}
          >
            {countBadge}
          </Avatar>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export { ChatListBarItem };
