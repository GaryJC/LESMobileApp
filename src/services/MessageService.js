import MessageData from "../Models/MessageData";
import Constants from "../modules/Constants";
import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import { LesPlatformCenter, LesConstants } from "les-im-components";
import DatabaseService from "./DatabaseService";
import DataCenter from "../modules/DataCenter";
import { ChatListItem, MessageCaches } from "../Models/MessageCaches";
import { AppStateStatus } from "react-native";
import PBUtils from "../utils/PBUtils";
import ChatGroupService from "./ChatGroupService";
// import DataCenter from "../modules/DataCenter";

/**
 * MessageService 负责发送和接受消息
 * 收到的消息会存储到DataCenter.messageCache中
 * 并发送相应的事件
 */
class MessageService {
  static #inst;

  #latestTimelineId;

  /**
   * @returns {MessageService}
   */
  static get Inst() {
    return MessageService.#inst ?? new MessageService();
  }

  constructor() {
    if (new.target !== MessageService) return;
    if (MessageService.#inst == null) {
      MessageService.#inst = this;
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

  // 发送消息功能
  sendMessage(recipientId, message) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.sendMessage(recipientId, message)
        // 发布UI加载事件？
        .then((message) => {
          //如果服务器成功处理
          //存入缓存并发布事件
          // const msgData = this.#onTimelineUpdated(message);
          const msgData = this.#onMessageSent(message);

          // console.log("send message: ", message);
          // JSEvent.emit(DataEvents.Saving.SavingState_Message, message);

          // DataSavingService.Inst.onSavingMessage(message);
          resolve(msgData);
        })
        .catch((e) => {
          // 如果处理失败
          // 设置重新发送按钮
          console.log("messgae send error: ", e);
          reject(e);
        });
    });
  }

  sendChatGroupMessage(chatGroupId, message) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.sendGroupMessage(chatGroupId, message)
        .then((message) => {
          //如果服务器成功处理
          //存入缓存并发布事件
          // const msgData = this.#onTimelineUpdated(message);
          const msgData = this.#onMessageSent(message);

          // console.log("send message: ", message);
          // JSEvent.emit(DataEvents.Saving.SavingState_Message, message);

          // DataSavingService.Inst.onSavingMessage(message);
          resolve(msgData);
        })
        .catch((e) => {
          // 如果处理失败
          // 设置重新发送按钮
          console.log("messgae send error: ", e);
          reject(e);
        });
    });
  }

  /**
   *
   * @param {PBLesIMTimelineData} timelineData
   * @returns {MessageData}
   */
  #onMessageSent(timelineData) {
    //转化为  MessageData
    const msgData = this.#pbTimelineDataToMessageData(timelineData);
    console.log("on message sent: ", timelineData, msgData);
    //存入messageCaches
    DataCenter.messageCache.pushMessage(msgData);

    if (msgData.messageType == LesConstants.IMMessageType.Group) {
      //群消息数据，转给ChatGroupService处理，这里由于IMListeners只能挂1个响应函数，所以在此处集中接受，转给其他需要的服务器处理
      ChatGroupService.Inst.onMessageSent(msgData);
    } else {
      //更新当前timelinId
      this.#updateTimelineId(msgData.timelineId);
    }
    //发布消息送达事件，给系统使用
    JSEvent.emit(DataEvents.Message.MessageState_Sent, msgData);

    const chatId = MessageCaches.MakeChatIDByMsgData(msgData);

    //发布UI事件，通知ui指定对话有更新
    JSEvent.emit(UIEvents.Message.Message_Chat_Updated, { chatId, msgData });

    return msgData;
  }

  /**
   * 收到系统控制消息，根据消息内容发送不同事件
   * @param {MessageData} msgData
   */
  #onReceiveSystemMessage(msgData) {
    console.log("system message data: ", msgData);
    switch (msgData.contentType) {
      case LesConstants.IMMessageContentType.Group_MemberKick:
        //当前用户被踢出了群组
        // JSEvent.emit(DataEvents.ChatGroup.ChatGroup_RemovedFromGroup, {
        //   chatId: "group-" + msgData.groupId,
        //   action: "delete",
        // });
        // const chatId = MessageCaches.MakeChatIDByMsgData(msgData);
        // 移除缓存中对应的聊天列表
        // DataCenter.messageCache.removeChatListItem(chatId);
        // DataCenter.messageCache.removeChatGroup(msgData.groupId)
        // DatabaseService.Inst.removeChatGroup(msgData.groupId);
        // const groupId = "group-" + msgData.groupId;
        // JSEvent.emit(UIEvents.Message.Message_Chat_List_Removed, groupId);
        break;
    }
  }

  /**
   * @param {PBLesIMTimelineData} timelineData
   * @returns {MessageData}
   */
  #onTimelineUpdated(timelineData) {
    //转化为  MessageData
    const msgData = this.#pbTimelineDataToMessageData(timelineData);
    console.log("msgData: ", msgData);
    if (msgData.messageType == LesConstants.IMMessageType.System) {
      //这是一条系统消息
      this.#onReceiveSystemMessage(msgData);
      //发布新消息事件，供service使用
      JSEvent.emit(DataEvents.Message.TimelineState_Updated, msgData);
      return;
    }

    if (msgData.messageType == LesConstants.IMMessageType.Single) {
      if (msgData.timelineId == 0) {
        //新消息，先赋予一个当前timelineId的最大值，方便排序使用
        msgData.timelineId = this.#latestTimelineId + 1;
      } else {
        //更新当前timelinId
        this.#updateTimelineId(msgData.timelineId);
      }
    } else if (msgData.messageType == LesConstants.IMMessageType.Group) {
      ChatGroupService.Inst.onTimelineUpdated(msgData);
    }

    //存入messageCaches
    DataCenter.messageCache.pushMessage(msgData);

    const chatId = MessageCaches.MakeChatIDByMsgData(msgData);

    //发布新消息事件，供service使用
    JSEvent.emit(DataEvents.Message.TimelineState_Updated, msgData);

    //发布UI事件，通知ui指定对话有更新
    JSEvent.emit(UIEvents.Message.Message_Chat_Updated, { chatId, msgData });
    //更新对话列表，携带有更新的chatId
    JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated, { chatId });

    return msgData;
  }

  /**
   * @param {PBLesIMTimelineData} timelineData
   * @returns {MessageData}
   */
  #pbTimelineDataToMessageData(timelineData) {
    // const timelineId = timelineData.getTimelineid();
    // const senderId = timelineData.getSenderid();
    // const recipientId = timelineData.getRecipientid();
    // const messageId = timelineData.getMessageid();
    // const content = timelineData.getContent();
    // const messageType = timelineData.getMessagetype();
    // const groupId = timelineData.getGroupid();
    // const contentType = timelineData.getContenttype();
    // const timestamp = timelineData.getTimestamp();

    // // 信息的投递状态
    // let status =
    //   timelineId == 0
    //     ? Constants.deliveryState.delivering
    //     : Constants.deliveryState.delivered;

    // const messageData = new MessageData();
    // messageData.messageId = messageId;
    // messageData.senderId = senderId;
    // messageData.recipientId = recipientId;
    // messageData.timelineId = timelineId;
    // messageData.content = content;
    // messageData.status = status;
    // messageData.messageType = messageType;
    // messageData.groupId = groupId;
    // messageData.contentType = contentType;
    // messageData.timestamp = timestamp;

    // return messageData;
    return PBUtils.pbTimelineDataToMessageData(timelineData);
  }

  #updateTimelineId(timelineId) {
    const newTimelineId = Math.max(this.#latestTimelineId, timelineId);
    // 当初始化应用时或第一次在设备打开应用时， 如果这个账号之前存在过发送过聊天信息
    // 会造成读取之前所有的聊天记录
    if (
      this.#latestTimelineId !== 0 &&
      timelineId !== 0 &&
      timelineId - this.#latestTimelineId !== 1
    ) {
      LesPlatformCenter.IMFunctions.requestTimeline(
        this.#latestTimelineId,
        timelineId
      ).then((res) => {
        console.log("request: ", res);
        res.datas.forEach((data) => {
          this.#onTimelineUpdated(data);
        });
      });
    }
    this.#latestTimelineId = newTimelineId;
    JSEvent.emit(DataEvents.Message.TimelineId_Updated, this.#latestTimelineId);
  }

  init() {
    //监听onIMMessageSent
    LesPlatformCenter.IMListeners.onIMMessageSent = (message) => {
      console.log(
        `消息[${message.getMessageid()}] from [${message.getSenderid()}] to [${message.getRecipientid()}], content: ${message.getContent()} , 状态 已投递 time(${message.getTimestamp()}), 最新timelineId (${message.getTimelineid()})`
      );
      this.#onMessageSent(message);
    };

    //onIMTimelineUpdated
    LesPlatformCenter.IMListeners.onIMTimelineUpdated = (message) => {
      console.log(
        `收到消息[${message.getMessageid()}] from [${message.getSenderid()}] to [${message.getRecipientid()}], content: ${message.getContent()}`
      );
      this.#onTimelineUpdated(message);
    };

    LesPlatformCenter.IMListeners.onIMChatGroupTimelineUpdated = (message) => {
      console.log(
        `收到群消息[${message.getMessageid()}] sender [${message.getSenderid()}] group [${message.getGroupid()}], content: ${message.getContent()}`
      );

      this.#onTimelineUpdated(message);
    };

    //事件改为由ServiceCenter统一监听，并调用service.onUserLogin
    // JSEvent.on(DataEvents.User.UserState_DataReady, () => {
    //   this.#onUserLogin();
    // })
  }

  async onUserLogin() {
    //为新用户创建messageCache
    DataCenter.messageCache = new MessageCaches(DataCenter.userInfo.accountId);
    //从数据库中读取对话列表缓存
    try {
      const list = await DatabaseService.Inst.loadChatList();
      DataCenter.messageCache.setChatList(list);
      //更新对话列表事件
      // JSEvent.emit(UIEvents.Message.Message_Chat_List_Updated, {
      //   chatId: "",
      //   action: "",
      // });
    } catch (e) {
      console.error("load user chat list error", e);
    }
    try {
      const messages = await DatabaseService.Inst.loadAllMessages();
      messages.forEach((message) => {
        DataCenter.messageCache.pushMessage(message);
      });
      // const data = DataCenter.messageCache.getMesssageList("chat2-8", 0, 10);
      // console.log("database messages: ", messages);
    } catch (e) {
      console.error("load message error", e);
    }

    this.#latestTimelineId = await DatabaseService.Inst.loadTimelineId();
    console.log("timelineid in database: ", this.#latestTimelineId);

    //请求最新的timeline数据
    await this.#requestTimeline();
    //读取本地的聊天组
    await ChatGroupService.Inst.loadChatGroups();

    try {
      const msgDatas = await ChatGroupService.Inst.requestChatGroupsTimeline();
      msgDatas.forEach((msg) => this.#onTimelineUpdated(msg));
    } catch (e) {
      console.log("chatgroup updated failed: code", e.toString(16));
    }
    // const { startId, endId, datas } =
    //   await LesPlatformCenter.IMFunctions.requestTimeline(
    //     this.#latestTimelineId,
    //     -1
    //   );
    // datas.forEach((data) => {
    //   this.#onTimelineUpdated(data);
    // });
    //JSEvent.emit(UIEvents.User.UserState_IsLoggedin);
  }

  async onUserRelogin(state) {
    if (state == Constants.ReloginState.ReloginSuccessful) {
      //重连成功，尝试拉取最新的timeline数据
      try {
        // const { startId, endId, datas } =
        //   await LesPlatformCenter.IMFunctions.requestTimeline(
        //     this.#latestTimelineId,
        //     -1
        //   );
        // datas.forEach((data) => {
        //   this.#onTimelineUpdated(data);
        // });
        await this.#requestTimeline();
        const msgDatas =
          await ChatGroupService.Inst.requestChatGroupsTimeline();
        msgDatas.forEach((msg) => this.#onTimelineUpdated(msg));
      } catch (e) {
        console.error("request timeline failed: ", e);
      }
    }
  }

  #requestTimeline() {
    return new Promise((resolve, reject) => {
      if (this.#latestTimelineId == 0) {
        resolve([]);
        return;
      }
      LesPlatformCenter.IMFunctions.requestTimeline(this.#latestTimelineId, -1)
        .then((data) => {
          const { startId, endId, datas } = data;
          datas.forEach((data) => {
            this.#onTimelineUpdated(data);
          });
          resolve(datas);
        })
        .catch((e) => reject(e));
    });
  }
}

export default MessageService;
