import { LesConstants } from "les-im-components";
import MessageData from "./MessageData";
import DatabaseService from "../services/DatabaseService";
import DataCenter from "../modules/DataCenter";
import JSEvent from "../utils/JSEvent";
import { UIEvents } from "../modules/Events";
const { IMMessageType } = LesConstants;
/**
 * 消息缓存
 */
class MessageCaches {
  #currUserId;

  /**
   * 如果用户在加载聊天页面之前在好友页面点击了聊天按钮
   * 因为更新聊天窗口事件还没有被监听，会导致导入的聊天窗口不匹配
   * 现在如果缓存中没有保存的chatListItem才获取的chatList的第一个
   */
  // #curChatListItem;

  /**
   * 根据messageData，生成对应的chatId
   * @param {MessageData} msgData
   */
  static MakeChatIDByMsgData(msgData) {
    if (msgData.messageType == LesConstants.IMMessageType.Group) {
      return MessageCaches.MakeChatID(
        msgData.senderId,
        msgData.groupId,
        msgData.messageType
      );
    } else {
      return MessageCaches.MakeChatID(
        msgData.senderId,
        msgData.recipientId,
        msgData.messageType
      );
    }
  }

  static MakeChatID(
    senderId,
    recipientId,
    type = LesConstants.IMMessageType.Single
  ) {
    if (type == LesConstants.IMMessageType.Single) {
      const id1 = Math.min(senderId, recipientId);
      const id2 = Math.max(senderId, recipientId);
      return `chat-${id1}-${id2}`;
    } else {
      return `group-${recipientId}`;
    }
  }

  /*
  setCurChatListItem(chatListItem) {
    this.#curChatListItem = chatListItem;
  }

  getCurChatListItem() {
    return this.#curChatListItem;
  }
  */

  /**
   * 对话数据，key = chatId, value = ChatData
   * @type {Map<string,ChatData>}
   */
  #chatDatMap = {};

  /**
   * 对话排序列表，根据最新更新时间排序
   * @type {ChatListItem[]}
   */
  #chatListSorted = [];

  constructor(currUserId) {
    this.#currUserId = currUserId;
  }

  /**
   * 设置对话列表
   * @param {ChatListItem[]} chatlist
   */
  setChatList(chatlist) {
    this.#chatListSorted = [...chatlist];
    this.#sortChatList();
  }

  /**
   *
   * @param {string} chatId
   * @returns {ChatListItem}
   */
  #getChatListSorted(chatId) {
    const idx = this.#chatListSorted.findIndex((item) => item.chatId == chatId);
    let dataSorted = null;
    if (idx == -1) {
      //没找到，插入一个
      const data = new ChatListItem(chatId);
      this.#chatListSorted.push(data);
      dataSorted = data;
      this.#sortChatList();
    } else {
      dataSorted = this.#chatListSorted[idx];
    }
    return dataSorted;
  }

  #sortChatList() {
    this.#chatListSorted.sort((c1, c2) => c2.updateTime - c1.updateTime);
  }

  /**
   * 获取指定chatId的对话对象，如果不存在则新建
   * @param {MessageData} msgData
   * @returns {ChatData}
   */
  #getChatData(msgData) {
    const chatId = MessageCaches.MakeChatIDByMsgData(msgData);
    let chatData = this.#chatDatMap[chatId];
    if (chatData == null) {
      let targetId =
        msgData.senderId == this.#currUserId
          ? msgData.recipientId
          : msgData.senderId;
      if (msgData.messageType == IMMessageType.Group) {
        targetId = msgData.groupId;
      }

      // chatData = this.#chatDatMap[chatId] = new ChatData(
      //   chatId,
      //   msgData.messageType,
      //   targetId
      // );

      chatData = this.#makeChatData(chatId, targetId, msgData.messageType);
    }
    //同步建立dataSorted
    const dataSorted = this.#getChatListSorted(chatId);
    dataSorted.type = chatData.type;
    dataSorted.targetId = chatData.targetId;
    return chatData;
  }

  /**
   * @param {string} chatId 
   * @param {number} targetId 
   * @param {IMMessageType} messageType 
   * @return {ChatData}
   */
  #makeChatData(chatId, targetId, messageType) {
    const chatData = this.#chatDatMap[chatId] = new ChatData(
      chatId,
      messageType,
      targetId
    );
    return chatData;
  }

  /**
   * 如果当前缓存中包含指定chatId的对话，则会将制定对话的新消息数清零，并返回这个对话对象
   * 如果当前缓存中不包含指定的chatId，则返回空
   * @param {string} chatId
   * @returns {ChatListItem}
   */
  touchChatData(chatId) {
    const chatSort = this.#getChatListSorted(chatId);
    chatSort.clearNewMsgCount();
    DatabaseService.Inst.saveChatListItem(chatSort);
    return chatSort;
  }

  /**
   * 将消息数据加入缓存中
   * @param {MessageData} msgData
   */
  pushMessage(msgData) {
    const chatId = MessageCaches.MakeChatIDByMsgData(msgData);
    const chatData = this.#getChatData(msgData);
    const chatSort = this.#getChatListSorted(chatId);
    if (chatData.addOrUpdate(msgData)) {
      //收到新消息，自己发出的消息不增加新消息数量
      chatSort.gotNewMessage(
        msgData.content,
        msgData.timelineId,
        msgData.senderId != this.#currUserId
      );
      this.#sortChatList();
    }
    return msgData;
  }

  //#region 供UI部分使用的方法

  /**
   * 返回所有对话列表
   *
   * 返回的列表为已排序过的
   *
   * @returns {ChatListItem[]}
   */
  getChatList() {
    return [...this.#chatListSorted];
  }

  /**
   * 返回当前新消息总数
   * @returns {number}
   */
  getNewMessageCount() {
    let count = 0;
    this.#chatListSorted.forEach(item => {
      count += item.newMessageCount;
    });
    return count;
  }

  /**
   * 删除指定的对话数据
   * e.g. 删除好友后将聊天列表移除
   * 还需要从database里移除
   * @param {string} chatId
   */
  removeChatListItem(chatId) {
    const idx = this.#chatListSorted.findIndex(
      (item) => item.chatId === chatId
    );
    if (idx > -1) {
      this.#chatListSorted.splice(idx, 1);
      // JSEvent.emit(UIEvents.User.UserState_UIRefresh);
      DatabaseService.Inst.removeChatListItem(chatId);
    }
  }

  /**
   * 返回chatId对应的chatListItem
   * @param {string} chatId
   * @returns {ChatListItem}
   */
  getChatListItem(chatId) {
    // return this.#chatListSorted.find((item) => item.chatId == chatId);
    let chatListItem = this.#chatListSorted.find(
      (item) => item.chatId == chatId
    );
    if (!chatListItem && chatId != null && chatId != "") {
      //没找到，建立一个并插入
      chatListItem = new ChatListItem(chatId);
      this.#chatListSorted.push(chatListItem);
      this.#sortChatList();
      return chatListItem;
    }
    return chatListItem;
  }

  /**
   * 根据chatId查找对应的对话数据
   * @param {string} chatId
   * @param {boolean} autoCreate 是否自动新建
   * @returns {ChatData}
   */
  getChatDataByChatId(chatId, autoCreate = false) {
    let chatData = this.#chatDatMap[chatId];
    if (chatData == null && autoCreate && chatId != null && chatId != "") {
      const chatListItem = this.getChatListItem(chatId);
      chatData = this.#makeChatData(chatId, chatListItem.targetId, chatListItem.type)
    }
    return chatData;
  }

  /**
   * 从指定位置，获取指定数量的聊天数据
   * @param {string} chatId
   * @param {number} startIndex
   * @param {number} count
   * @returns {MessageData[]}
   */
  getMesssageList(chatId, startIndex, count) {
    const chatData = this.getChatDataByChatId(chatId);

    if (chatData == null) {
      return [];
    }
    return chatData.getMessages(startIndex, count);
  }

  //#endregion
}

/**
 * 用于给对话排序的数据
 * 根据对话的最新更新时间，越新的越靠前
 */
class ChatListItem {
  /**
   * 对话Id
   * @type {string}
   */
  #chatId;

  /**
   * 对话目标的Id
   *
   * 如果是单聊，则为对方用户id，如果要查找用户详细信息，则需要从  IMUserInfoService  中获取
   *
   * 如果是群聊，则为对应群组id，如果要查找群详情，则需要从 ChatGroupService 中获取
   */
  targetId;

  /**
   * 对话类型
   *
   * 单聊或者群聊
   * @type {IMMessageType}
   */
  type;

  /**
   * 新消息数量
   * @type {number}
   */
  #newMessageCount;

  /**
   * 对话更新时间
   */
  #updateTime;

  /**
   * 最新的一条消息
   * @type {string}
   */
  latestMessage;

  /**
   * 当前对话最新的timelineId
   * 收到的消息的timelineId如果大于这个id，则计数新消息
   */
  latestTimelineId = 0;

  constructor(chatId) {
    this.#chatId = chatId;
    this.type =
      chatId.split("-")[0] === "chat"
        ? LesConstants.IMMessageType.Single
        : LesConstants.IMMessageType.Group;
    this.targetId = chatId
      .split("-")
      .slice(1, 3)
      .filter((id) => id != DataCenter.userInfo.accountId)
      .pop();
    this.#newMessageCount = 0;
    this.refresh();
  }

  get updateTime() {
    return this.#updateTime;
  }

  get newMessageCount() {
    return this.#newMessageCount;
  }

  get chatId() {
    return this.#chatId;
  }

  /**
   * 初始化chatlistItem，从数据库中创建数据使用
   * @param {number} targetId
   * @param {IMMessageType} type
   * @param {number} newMessageCount
   * @param {number} updateTime
   * @param {string} latestMessage
   */
  init(targetId, type, newMessageCount, updateTime, latestMessage, latestTimelineId) {
    this.targetId = targetId;
    this.type = type;
    this.#newMessageCount = newMessageCount;
    this.#updateTime = updateTime;
    this.latestMessage = latestMessage;
    this.latestTimelineId = latestTimelineId;
  }

  /**
   * 收到了新消息
   * @param {string} content
   * @param {number} timelineId 当前消息的timelineId
   * @param {boolean} incNewsCount 是否增加新消息数量，默认为true
   */
  gotNewMessage(content, timelineId, incNewsCount = true) {
    this.refresh();
    if (incNewsCount) {
      if (timelineId > this.latestTimelineId) {
        this.latestTimelineId = timelineId;
        this.incNewMsgCount();
      }
    }
    this.latestMessage = content;
  }

  /**
   * 增加新消息的数量，不填count默认为+1
   * @param {number|null} count
   */
  incNewMsgCount(count) {
    if (count == null) count = 1;
    this.#newMessageCount += count;
    JSEvent.emit(UIEvents.Message.Message_New_Count_Changed, { chatId: this.#chatId, currCount: this.#newMessageCount })
    return this.#newMessageCount;
  }

  clearNewMsgCount() {
    this.#newMessageCount = 0;
    JSEvent.emit(UIEvents.Message.Message_New_Count_Changed, { chatId: this.#chatId, currCount: this.#newMessageCount })
  }

  refresh() {
    this.#updateTime = Date.now();
  }
}

/**
 * 一组聊天数据，可能是单聊对话，也可能是群聊
 */
class ChatData {
  /**
   * 对话Id
   * @type {string}
   */
  #chatId;

  /**
   * 对话类型
   *
   * 单聊或者群聊
   * @type {IMMessageType}
   */
  #type;

  /**
   * 消息列表
   * @type {MessageData[]}
   */
  #messageList = [];

  #targetId;

  /**
   * @type {string}
   */
  get chatId() {
    return this.#chatId;
  }

  /**
   * 对话目标的Id
   *
   * 如果是单聊，则为对方用户id，如果要查找用户详细信息，则需要从  IMUserInfoService  中获取
   *
   * 如果是群聊，则为对应群组id
   */
  get targetId() {
    return this.#targetId;
  }

  get messageList() {
    return this.#messageList;
  }

  /**
   * 对话类型
   *
   * 单聊或者群聊
   * @type {IMMessageType}
   */
  get type() {
    return this.#type;
  }

  /**
   *
   * @param {string} chatId
   * @param {IMMessageType} type
   * @param {number} targetId
   */
  constructor(chatId, type, targetId) {
    this.#chatId = chatId;
    this.#type = type;
    this.#targetId = targetId;
  }

  /**
   * 返回指定消息id在列表中的索引
   * @param {string} messageId 消息id
   */
  indexOf(messageId) {
    const idx = this.#messageList.findIndex(m => m.messageId == messageId);
    return idx;
  }

  /**
   *
   * @param {number} startIndex 起始索引
   * @param {number} count 数量
   * @returns {MessageData[]}
   */
  getMessages(startIndex, count) {
    const end = startIndex + count;
    return this.#messageList.slice(startIndex, end);
  }

  /**
   * 将消息加入列表，或者更新列表中的消息
   * @param {MessageData} msgData
   */
  addOrUpdate(msgData) {
    const idx = this.#messageList.findIndex(
      (item) => item.messageId == msgData.messageId
    );
    let isNew = false;
    if (idx == -1) {
      this.#messageList.push(msgData);
      isNew = true;
    } else {
      this.#messageList[idx] = msgData;
    }
    this.#sortList();
    return isNew;
  }

  #sortList() {
    this.#messageList.sort((m1, m2) => {
      if (m1.timelineId == m2.timelineId) {
        return m2.timestamp - m1.timestamp;
      } else {
        return m2.timelineId - m1.timelineId;
      }
    });
  }
}

export { MessageCaches, ChatData, ChatListItem };
