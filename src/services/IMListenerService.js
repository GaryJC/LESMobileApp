/*
  这个个service需要接入所有IMListener的回调?
  当收到数据时发送对应的事件
  其他的服务监听对应的事件
*/

import { LesPlatformCenter, LesConstants } from "les-im-components";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

class IMListenerService {
  static #inst;

  static get inst() {
    return IMListenerService.#inst ?? new IMListenerService();
  }

  constructor() {
    if (new.target !== IMListenerService) return;
    if (!IMListenerService.#inst) {
      IMListenerService.#inst = this;
    }
    return IMListenerService.#inst;
  }

  addIMListeners() {
    LesPlatformCenter.IMListeners.onIMMessageSent = (message) => {
      console.log(
        `消息[${message.getMessageid()}] from [${message.getSenderid()}] to [${message.getRecipientid()}], content: ${message.getContent()} , 状态 已投递 time(${message.getTimestamp()}), 最新timelineId (${message.getTimelineid()})`
      );
      timelineStartId = message.getTimelineid();
      // 发布消息发送事件
      JSEvent.emit(DataEvents.Message.MessageState_Sent, message);
    };

    LesPlatformCenter.IMListeners.onIMTimelineUpdated = (message) => {
      const lastTimelineId = message.getTimelineid();
      console.log(`lastTimelineId更新： ${lastTimelineId}`);
      const data = message;
      console.log(
        `收到消息[${data.getMessageid()}] from [${data.getSenderid()}] to [${data.getRecipientid()}], content: ${data.getContent()}`
      );
      timelineStartId = lastTimelineId;
      // 发布消息接受事件
      JSEvent.emit(DataEvents.Message.TimelineState_Updated, message);
    };

    LesPlatformCenter.IMListeners.onIMUserNotification = (notification) => {
      console.log(`收到通知消息`, notification);
    };

    LesPlatformCenter.IMListeners.onIMUserStateChanged = (
      user,
      onlineState,
      state
    ) => {
      console.log(
        `Friend[${user.getId()}] ${user.getName()}#${user.getTag()} State[${
          UserState[state]
        }] Online[${OnlineState[onlineState]}]`
      );
    };

    LesPlatformCenter.IMListeners.onFriendRemoved = (friendId) => {
      console.log(`被好友 ${friendId} 从列表中移除`);
    };

    LesPlatformCenter.IMListeners.onBlockUser = (blockedUser) => {
      console.log("已屏蔽用户:", userToString(blockedUser));
    };

    LesPlatformCenter.IMListeners.onUnblockUser = (unblockId) => {
      console.log("已解禁用户:", unblockId);
    };

    LesPlatformCenter.IMListeners.onUserInfoUpdated = (user, state) => {
      console.log(
        "状态更新：",
        `[${user.getId()}]${user.getName()}#${user.getTag()} ${
          UserState[state]
        }`
      );
    };
  }
}

export default IMListenerService;
