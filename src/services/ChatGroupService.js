import { LesConstants, LesPlatformCenter } from "les-im-components";
import ChatGroup from "../Models/ChatGroup";
import { reject } from "lodash";
import PBUtils from "../utils/PBUtils";
import DatabaseService from "./DatabaseService";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import { Notification, Notifications } from "../Models/Notifications";
import MessageData from "../Models/MessageData";
import DataCenter from "../modules/DataCenter";

const {
  IMUserState,
  IMUserOnlineState,
  IMNotificationType,
  IMNotificationState,
} = LesConstants;

class ChatGroupService {
  static #inst;
  /**
   * 群聊数据
   * @type {Map<number,ChatGroup>}
   */
  #chatGroups = {};

  /**
   * @returns {ChatGroupService}
   */
  static get Inst() {
    return ChatGroupService.#inst ?? new ChatGroupService();
  }

  constructor() {
    if (new.target !== ChatGroupService) return;
    if (ChatGroupService.#inst == null) {
      ChatGroupService.#inst = this;
    }
    return ChatGroupService.#inst;
  }

  init() {
    JSEvent.on(DataEvents.Notification.NotificationState_Updated, (noti) =>
      this.#onNotificationUpdated(noti)
    );
  }

  /**
   * 发送到群组的消息回执
   * @param {MessageData} messageData
   */
  onMessageSent(messageData) {
    //更新对应chatGroup的timelineId
    this.onTimelineUpdated(messageData);
  }

  /**
   * 群组的timeline更新
   * @param {MessageData} msgData
   */
  onTimelineUpdated(msgData) {
    let cg = this.#chatGroups[msgData.groupId];
    if (cg == null) {
      //本地还没有这个群组的信息
      cg = new ChatGroup();
      cg.id = msgData.groupId;
      cg.latestTimelineId = msgData.timelineId;
      //先用现有信息创建分组数据
      this.#pushChatGroup(cg);
      this.#updateChatGroup(cg.id);
    } else {
      cg.latestTimelineId = msgData.timelineId;
    }
  }

  /**
   * 请求更新群信息，如果本地缓存已经存在，则忽略
   * @param {number} groupId
   * @returns {Promise<ChatGroup>}
   */
  #updateChatGroup(groupId) {
    return new Promise((resolve, reject) => {
      const cg = this.#chatGroups[groupId];
      if (cg != null && cg.name != null) {
        resolve(this.#chatGroups[groupId]);
        return;
      }
      LesPlatformCenter.IMFunctions.getGroupInfo(groupId)
        .then((data) => {
          const newCg = PBUtils.pbChatGroupDataToChatGroup(data);
          newCg.latestTimelineId = cg.latestTimelineId;
          this.#pushChatGroup(newCg);
          DatabaseService.Inst.saveChatGroup(newCg);
          resolve(newCg);
        })
        .catch((err) => {
          console.error(
            `get group[${groupId}] info failed, code: ${err.toString(16)}`
          );
          reject(err);
        });
    });
  }

  #pushChatGroup(cg) {
    const has = this.#chatGroups[cg.id];
    this.#chatGroups[cg.id] = cg;
    if (has == null) {
      JSEvent.emit(DataEvents.ChatGroup.ChatGroup_New, cg);
    } else {
      JSEvent.emit(DataEvents.ChatGroup.ChatGroup_Updated, cg);
    }
  }

  /**
   *
   * @param {Notification} noti
   */
  #onNotificationUpdated(noti) {
    if (noti.type == IMNotificationType.FriendInvitation) {
      if (noti.state == IMNotificationState.Accepted) {
        //同意加入群聊
        let cg = new ChatGroup();
        cg.id = noti.groupInfo.id;
        cg.latestTimelineId = 0;
        this.#pushChatGroup(cg);
        this.#updateChatGroup(cg.id)
          .then((cg) => {})
          .catch((err) =>
            console.error(`更新群[${cg.id}]失败，code：${err.toString(16)}`)
          );
      }
    }
  }

  async loadChatGroups() {
    //从数据库中读取现有的群组信息，并向服务器拉取最新的群消息数据
    this.#chatGroups = {};
    try {
      const groups = await DatabaseService.Inst.loadChatGroup();
      groups.forEach((cg) => (this.#chatGroups[cg.id] = cg));
      await this.requestChatGroupsTimeline();
    } catch (e) {
      console.error(`读取群组数据失败`, e);
    }
  }

  requestChatGroupsTimeline() {
    return new Promise((resolve, reject) => {
      const groupIds = [];
      const timelineIds = [];

      for (const id in this.#chatGroups) {
        const cg = this.#chatGroups[id];
        groupIds.push(id);
        timelineIds.push(cg.timelineId);
      }

      LesPlatformCenter.IMFunctions.getGroupUpdates(groupIds, timelineIds)
        .then((updates) => {
          resolve(updates);
        })
        .catch((err) => {
          console.error("获取聊天群组更新失败，code " + err.toString(16));
          reject(err);
        });
    });
  }

  /**
   * 创建聊天群组
   * @param {string} name
   * @param {string} desc
   * @returns
   */
  createChatGroup(name, desc) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.createChatGroup(name, desc)
        .then((data) => {
          const cg = PBUtils.pbChatGroupDataToChatGroup(data);
          cg.latestTimelineId = 0;
          this.#pushChatGroup(cg);
          DatabaseService.Inst.saveChatGroup(cg);
          resolve(cg);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}

export default ChatGroupService;
