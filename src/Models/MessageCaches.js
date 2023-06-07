import { LesConstants } from "les-im-components";
import MessageData from "./MessageData";
const { IMMessageType } = LesConstants;
/**
 * 消息缓存
 */
class MessageCaches {
  #currUserId;

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
        msgData.recipentId,
        msgData.messageType
      );
    }
  }

  static MakeChatID(
    senderId,
    recipentId,
    type = LesConstants.IMMessageType.Single
  ) {
    if (type == LesConstants.IMMessageType.Single) {
      const id1 = Math.min(senderId, recipentId);
      const id2 = Math.max(senderId, recipentId);
      return `chat-${id1}-${id2}`;
    } else {
      return `group-${recipentId}`;
    }
  }

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
          ? msgData.recipentId
          : msgData.senderId;
      if (msgData.messageType == IMMessageType.Group) {
        targetId = msgData.groupId;
      }

      chatData = this.#chatDatMap[chatId] = new ChatData(
        chatId,
        msgData.messageType,
        targetId
      );
    }
    //同步建立dataSorted
    const dataSorted = this.#getChatListSorted(chatId);
    dataSorted.type = chatData.type;
    dataSorted.targetId = chatData.targetId;
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
   * 返回chatId对应的chatListItem
   * @param {string} chatId
   * @returns {ChatListItem}
   */
  getChatListItem(chatId) {
    return this.#chatListSorted.find((item) => item.chatId == chatId);
  }

  /**
   * 根据chatId查找对应的对话数据
   * @param {string} chatId
   * @returns {ChatData}
   */
  getChatDataByChatId(chatId) {
    return this.#chatDatMap[chatId];
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
   * 如果是群聊，则为对应群组id
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

  constructor(chatId) {
    this.#chatId = chatId;
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
  init(targetId, type, newMessageCount, updateTime, latestMessage) {
    this.targetId = targetId;
    this.type = type;
    this.#newMessageCount = newMessageCount;
    this.#updateTime = updateTime;
    this.latestMessage = latestMessage;
  }

  /**
   * 收到了新消息
   * @param {string} content
   * @param {boolean} incNewsCount 是否增加新消息数量，默认为true
   */
  gotNewMessage(content, incNewsCount = true) {
    this.refresh();
    if (incNewsCount) {
      this.incNewMsgCount();
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
    return this.#newMessageCount;
  }

  clearNewMsgCount() {
    this.newMessageCount = 0;
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
   * 对话目标的Id
   *
   * 如果是单聊，则为对方用户id，如果要查找用户详细信息，则需要从  IMUserInfoService  中获取
   *
   * 如果是群聊，则为对应群组id
   */
  get targetId() {
    return this.#targetId;
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
