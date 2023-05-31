/*
    监听login成功事件
    读取sqlite重建datacenter缓存

    将从各服务收到的数据写进sqlite和datacenter
    
    监听数据缓存事件
    发布对应的UI更新事件
*/

import { DataEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";

class DataSavingService {
  static #inst;

  static get inst() {
    return DataSavingService.#inst ?? new DataSavingService();
  }

  constructor() {
    if (new.target !== DataSavingService) return;
    if (DataSavingService.#inst) {
      DataSavingService.#inst = this;
      //   this.friendListData = friendListData;
    }
    return DataSavingService.#inst;
  }

  onSavingMessage(message) {
    const senderId = message.getSenderId();
    const recipentId = message.getRecipientId();
  }

  addDataSavingStateListener() {
    JSEvent.on(DataEvents.Saving.SavingState_Message, this.onSavingMessage);
  }
}

export default DataSavingService;
