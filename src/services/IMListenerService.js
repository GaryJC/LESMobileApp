/**
 * 这个服务负责接受所有的服务器回调
 * 并将回调的数据通过事件发送出去
 * 本服务只负责回调转事件，不做任何逻辑处理
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
    if (IMListenerService.#inst == null) {
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
      // 收到消息发送事件->发布缓存消息事件
      console.log("onsend timelineid: ", timelineStartId);
      JSEvent.emit(DataEvents.Saving.SavingState_Message, message);
    };

    LesPlatformCenter.IMListeners.onIMTimelineUpdated = (message) => {
      const lastTimelineId = message.getTimelineid();
      console.log(`lastTimelineId更新： ${lastTimelineId}`);
      const data = message;
      console.log(
        `收到消息[${data.getMessageid()}] from [${data.getSenderid()}] to [${data.getRecipientid()}], content: ${data.getContent()}`
      );
      timelineStartId = lastTimelineId;
      // 收到消息接受事件->发布缓存消息事件
      JSEvent.emit(DataEvents.Saving.SavingState_Message, message);
    };

    LesPlatformCenter.IMListeners.onIMUserNotification = (notification) => {
      console.log(`收到通知消息`, notification);
    };

    //onIMUserStateChanged在UserDataService中进行监听
    // LesPlatformCenter.IMListeners.onIMUserStateChanged = (
    //   user,
    //   onlineState,
    //   state
    // ) => {
    //   console.log(
    //     `Friend[${user.getId()}] ${user.getName()}#${user.getTag()} State[${
    //       UserState[state]
    //     }] Online[${OnlineState[onlineState]}]`
    //   );
    // };

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
        `[${user.getId()}]${user.getName()}#${user.getTag()} ${UserState[state]
        }`
      );
    };
  }

  init() {
    this.addIMListeners();
  }
}

export default IMListenerService;
