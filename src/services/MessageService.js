import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import { LesPlatformCenter, LesConstants } from "les-im-components";
// import DataCenter from "../modules/DataCenter";

class MessageService {
  static #inst;

  static get Inst() {
    return MessageService.#inst ?? new MessageService();
  }

  constructor(friendListData) {
    if (new.target !== MessageService) return;
    if (MessageService.#inst) {
      MessageService.#inst = this;
      //   this.friendListData = friendListData;
    }
    return MessageService.#inst;
  }

  pullData() {
    /* 
      调用API拉取数据，发布pulldata事件
      拉取结束后发布pulldata结束事件
      这些事件被UpdateService所监听，并触发ui加载页面

      发布对应的数据更新事件
      JSEvent.emit(DataEvents.Friend.FriendState_Updated, args)
    */
    // JSEvent.emit(DataEvents.PullData.PullDataState_IsStarted);
    // JSEvent.emit(DataEvents.PullData.PullDataState_IsFinished);
  }

  // 这里的监听
  addMessageStateListener() {
    this.onReciveMessage();
  }

  // 发送消息功能
  onSendMessage(recipentId, message) {
    LesPlatformCenter.IMFunctions.sendMessage(recipentId, message)
      // 发布UI加载事件？
      .then((message) => {
        // 如果服务器成功处理
        // 将发送的消息存入缓存(发布信息缓存事件)
        console.log("send message: ", message);
        JSEvent.emit(DataEvents.Saving.SavingState_Message, message);
        // DataSavingService.Inst.onSavingMessage(message);
      })
      .catch((e) => {
        // 如果处理失败
        // 设置重新发送按钮
        console.log("messgae send error: ", e);
      });
  }

  // 监听消息接受事件
  onReciveMessage() {
    // 收到事件后发布信息缓存事件
    // JSEvent.on(DataEvents.Message.TimelineState_Updated, (message) =>
    //   JSEvent.emit(DataEvents.Saving.SavingState_Message, message)
    // );
  }

  init() {
    this.addMessageStateListener();
  }
}

export default MessageService;
