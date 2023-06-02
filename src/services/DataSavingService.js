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

  onSavingMessage(message) {
    // 缓存消息
    // 发布消息UI更新事件
    console.log("timelineId: ", message.getTimelineid());
    const senderId = message.getSenderid();
    const recipentId = message.getRecipientid();
    const messageId = message.getMessageid();
    const content = message.getContent();
    const timelineId = message.getTimelineid();
    // 信息的投递状态
    let status = Constants.deliveryState.delivering;

    // 如果有timelineId, 则设置为投递成功
    if (timelineId !== 0) {
      status = Constants.deliveryState.delivered;
    }

    console.log("status: ", status);

    // 对话窗口的id
    const chatId =
      senderId < recipentId
        ? senderId + "-" + recipentId
        : recipentId + "-" + senderId;

    // 缓存信息的格式
    const messageData = {
      messageId: messageId,
      senderId: senderId,
      recipentId: recipentId,
      timelineId: timelineId,
      content: content,
      status: status,
    };

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
    JSEvent.on(DataEvents.Saving.SavingState_Message, this.onSavingMessage);
  }

  /**
   * 将用户的登录信息保存到DataCenter中
   * @param {number} id 
   * @param {string} key 
   * @param {{name:string, tag:number, email:string, state:IMUserState}} imUserInfo 
   */
  saveLoginDataToDataCenter(id, key, email, imUserInfo) {
    DataCenter.userInfo.accountId = id;
    DataCenter.userInfo.loginKey = key;
    DataCenter.userInfo.email = email;
    DataCenter.userInfo.imUserInfo = imUserInfo;
  }

  /**
   * 将数据保存到Secure Store中
   * @param {string} key 
   * @param {string|object} value 
   */
  async secureSaveData(key, value) {
    const t = typeof (value);
    let v = value;
    if (t != 'string') {
      v = JSON.stringify(value);
    }

    const data = {
      type: t,
      value: v,
    }

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

      if (json.type == 'string') {
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
    this.addDataSavingStateListener();
  }
}

export default DataSavingService;
