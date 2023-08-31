/*
    监听login成功事件
    读取sqlite重建datacenter缓存

    将从各服务收到的数据写进sqlite和datacenter
    
    监听数据缓存事件
    发布对应的UI更新事件
*/

import DataCenter from "../modules/DataCenter";
import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import Constants from "../modules/Constants";
import * as SecureStore from "expo-secure-store";
import { LesConstants } from "les-im-components";
import MessageData from "../Models/MessageData";
import DatabaseService from "./DatabaseService";
import { MessageCaches } from "../Models/MessageCaches";
import IMUserInfo from "../Models/IMUserInfo";
import UserProfile from "../Models/UserProfile";
const IMUserState = LesConstants.IMUserState;

class DataSavingService {
  static #inst;

  /**
   * @returns {DataSavingService}
   */
  static get Inst() {
    return DataSavingService.#inst ?? new DataSavingService();
  }

  constructor() {
    if (new.target !== DataSavingService) return;
    if (DataSavingService.#inst == null) {
      DataSavingService.#inst = this;
      //   this.friendListData = friendListData;
    }
    return DataSavingService.#inst;
  }

  /**
   * @deprecated 这个方法不再使用
   * @param {} message
   */
  onSavingMessage(message) {
    // 缓存消息
    // 发布消息UI更新事件
    console.log("timelineId: ", message.getTimelineid());
    const senderId = message.getSenderid();
    const recipientId = message.getRecipientid();
    const messageId = message.getMessageid();
    const content = message.getContent();
    const timelineId = message.getTimelineid();
    const messageType = message.getMessagetype();
    const groupId = message.getGroupid();
    const contentType = message.getContenttype();
    const timestamp = message.getTimestamp();

    // 信息的投递状态
    let status = Constants.deliveryState.delivering;

    // 如果有timelineId, 则设置为投递成功
    if (timelineId !== 0) {
      status = Constants.deliveryState.delivered;
    }

    console.log("status: ", status);

    // 对话窗口的id
    const chatId =
      senderId < recipientId
        ? senderId + "-" + recipientId
        : recipientId + "-" + senderId;

    const messageData = new MessageData();
    messageData.messageId = messageId;
    messageData.senderId = senderId;
    messageData.recipientId = recipientId;
    messageData.timelineId = timelineId;
    messageData.content = content;
    messageData.status = status;
    messageData.messageType = messageType;
    messageData.groupId = groupId;
    messageData.contentType = contentType;
    messageData.timestamp = timestamp;

    console.log("messageData: ", messageData);

    // 如果缓存中已经存在次对话窗口
    if (DataCenter.messageCaches[chatId]) {
      // 找这个对话的具体的messageId
      const index = DataCenter.messageCaches[chatId].findIndex(
        (item) => item.messageId === messageId
      );
      console.log("index: ", index);
      // 如果存在这个信息，更新这个信息
      if (index !== -1) {
        DataCenter.messageCaches[chatId][index] = messageData;
      } else {
        // 如果不存在，则缓存这个信息
        DataCenter.messageCaches[chatId].push(messageData);
      }
    } else {
      // 如果缓存中不存在次对话窗口，将值设置为array
      DataCenter.messageCaches[chatId] = [messageData];
    }
    console.log("sended message arg: ", messageData);
    // 发送UI更新事件
    JSEvent.emit(UIEvents.Message.MessageState_UIRefresh, messageData);
  }

  addDataSavingStateListener() {
    //JSEvent.on(DataEvents.Saving.SavingState_Message, this.onSavingMessage);
  }

  /**
   * 将用户的登录信息保存到DataCenter中
   * @param {number} id
   * @param {string} key
   * @param {{name:string, tag:number, email:string, state:IMUserState,userProfile:UserProfile}} imUserInfo
   */
  saveLoginDataToDataCenter(id, key, email, imUserInfo, userProfile) {
    DataCenter.userInfo.accountId = id;
    DataCenter.userInfo.loginKey = key;
    DataCenter.userInfo.email = email;
    this.setImUserInfo({ id, name: imUserInfo.name, tag: imUserInfo.tag, state: imUserInfo.state, onlineState: LesConstants.IMUserOnlineState.Online });
    DataCenter.userInfo.userProfile = userProfile;
  }




  /**
   * @param {{id: number | null, name: string | null, tag: number | null, state: IMUserState | null,  onlineState: IMUserOnlineState | null  } } userInfo 
   */
  setImUserInfo(userInfo) {
    const { id, name, tag, state, onlineState } = userInfo;
    if (DataCenter.userInfo.imUserInfo == null) {
      DataCenter.userInfo.imUserInfo = new IMUserInfo(id, name, tag, state, onlineState);
    } else {
      const info = DataCenter.userInfo.imUserInfo;
      if (id != null) {
        info.id = id;
      }
      if (name != null) {
        info.name = name;
      }
      if (tag != null) {
        info.tag = tag;
      }
      if (state != null) {
        info.state = state;
      }
      if (onlineState != null) {
        info.onlineState = onlineState;
      }
    }

    JSEvent.emit(DataEvents.User.UserInfo_Current_Updated, DataCenter.userInfo.imUserInfo);
  }

  /**
   * 将数据保存到Secure Store中
   * @param {string} key
   * @param {string|object} value
   */
  async secureSaveData(key, value) {
    const t = typeof value;
    let v = value;
    if (t != "string") {
      v = JSON.stringify(value);
    }

    const data = {
      type: t,
      value: v,
    };

    try {
      await SecureStore.setItemAsync(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.log(`setItem ${key} => ${v} Failed: `, e);
      return false;
    }
  }

  /**
   * 从Secure Store中读取数据
   * @param {string} key
   * @returns {string|object}
   */
  async secureGetData(key) {
    try {
      const value = await SecureStore.getItemAsync(key);

      if (value == null) {
        return null;
      }

      const json = JSON.parse(value);

      if (json.type == null || json.value == null) {
        return null;
      }

      if (json.type == "string") {
        return json.value;
      } else {
        return JSON.parse(json.value);
      }
    } catch (e) {
      console.log(`getItem ${key} => ${value} Failed: `, e);
      return null;
    }
  }

  init() {
    //this.addDataSavingStateListener();
    JSEvent.on(DataEvents.Message.MessageState_Sent, (msg) =>
      this.#onReceiveMessage(msg)
    );
    JSEvent.on(DataEvents.Message.TimelineState_Updated, (msg) =>
      this.#onReceiveMessage(msg)
    );
    JSEvent.on(DataEvents.Message.TimelineId_Updated, (timelineId) =>
      this.#onTimelineIdUpdated(timelineId)
    );
  }

  #onTimelineIdUpdated(timelineId) {
    DatabaseService.Inst.saveTimelineId(timelineId);
  }

  #onReceiveMessage(msgData) {
    //将收到的消息异步存库
    DatabaseService.Inst.saveMessage(msgData)
      .then((succ) => console.log("save success: ", succ))
      .catch((error) => console.log("save fail: ", error));

    const chatId = MessageCaches.MakeChatIDByMsgData(msgData);
    //保存chatlist
    const item = DataCenter.messageCache.getChatListItem(chatId);
    console.log("iiiii: ", item);
    if (item != null) {
      DatabaseService.Inst.saveChatListItem(item);
    }
  }
}

export default DataSavingService;
