import { LesConstants, LesPlatformCenter } from "les-im-components";
import ChatGroup, { ChatGroupMember } from "../Models/ChatGroup";
import { reject } from "lodash";
import PBUtils from "../utils/PBUtils";
import DatabaseService from "./DatabaseService";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import { Notification, Notifications } from "../Models/Notifications";
import MessageData from "../Models/MessageData";
import DataCenter from "../modules/DataCenter";
import IMUserInfoService from "./IMUserInfoService";
import IMUserInfo from "../Models/IMUserInfo";

const {
  IMUserState,
  IMUserOnlineState,
  IMNotificationType,
  IMNotificationState,
  IMGroupMemberState,
  IMGroupMemberRole,
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
      cg.latestTimelineId = Math.max(cg.latestTimelineId, msgData.timelineId);
      DatabaseService.Inst.saveChatGroup(cg);
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
          const newCg = PBUtils.pbChatGroupDataToChatGroup(data.groupData);
          newCg.latestTimelineId = cg == null ? 0 : cg.latestTimelineId;
          this.#pushChatGroup(newCg);
          DatabaseService.Inst.saveChatGroup(newCg);
          resolve(newCg);
        })
        .catch((err) => {
          console.error(
            `get group[${groupId}] info failed, code: ${err.toString(16)}`
          );
          reject(err);
          // delete this.#chatGroups[groupId];
          // DatabaseService.Inst.removeChatGroup(groupId);
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
    if (noti.type == IMNotificationType.GroupInvitation) {
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
      groups.forEach((g) => {
        this.#chatGroups[g.id] = g;
      });
    } catch (e) {
      console.error(`读取群组数据失败`, e);
    }
  }

  /**
   *
   * @returns {Promise<PBLesIMTimelineData[]>}
   */
  requestChatGroupsTimeline() {
    return new Promise(async (resolve, reject) => {
      try {
        //获取所有群组的最新timelineId
        const updates = await this.#requestChatGroupsTimelineUpdate();
        //拉取消息
        const req = updates.map((u) => {
          return {
            groupId: u.groupId,
            from: u.currentTimelineId,
            to: u.latestTimelineId,
          };
        });
        LesPlatformCenter.IMFunctions.getGroupTimeline(req)
          .then((msgs) => {
            resolve(msgs);
          })
          .catch((e) => {
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * 向服务器请求所有聊天分组的最新timelineId
   * @returns {Promise<{groupId:number,currentTimelineId:number,latestTimelineId:number,updateTime:number}[]>}
   */
  #requestChatGroupsTimelineUpdate() {
    return new Promise((resolve, reject) => {
      const groupIds = [];
      const timelineIds = [];

      for (const id in this.#chatGroups) {
        const cg = this.#chatGroups[id];
        groupIds.push(id);
        timelineIds.push(cg.latestTimelineId);
      }

      LesPlatformCenter.IMFunctions.getGroupUpdates(groupIds, timelineIds)
        .then(async (updates) => {
          const ret = [];

          for (let index = 0; index < updates.length; index++) {
            const u = updates[index];
            const groupId = u.getGroupid();
            const latestTimelineId = u.getLatesttimelineid();
            const updateTime = u.getUpdatetime();

            const cg = await this.getChatGroup(groupId);
            if (cg.latestTimelineId == null || cg.latestTimelineId == 0) {
              //本地是0，表示没有提取过消息，线设置为当前分组的最新timelineId
              cg.latestTimelineId = latestTimelineId;
              DatabaseService.Inst.saveChatGroup(cg);
            }
            ret.push({
              groupId,
              currentTimelineId: cg.latestTimelineId,
              latestTimelineId,
              updateTime,
            });
          }
          resolve(ret);
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

  /**
   * 获取指定聊天群组的详情数据
   * @param {number} chatGroupId
   * @returns {Promise<ChatGroup>}
   */
  getChatGroup(chatGroupId) {
    return this.#updateChatGroup(chatGroupId);
  }
  /**
   * 从缓存中获取指定聊天群组的详情数据
   * 如果数据不存在，则返回空，并向服务器请求数据，服务器返回后，触发DataEvents.ChatGroup.ChatGroup_Updated事件
   * @param {number} chatGroupId
   * @returns {ChatGroup}
   */
  getCachedChatGroup(chatGroupId) {
    const cg = this.#chatGroups[chatGroupId];
    if (cg != null && cg.name != null) {
      return cg;
    } else {
      this.#updateChatGroup(chatGroupId);
      return null;
    }
  }

  /**
   * 获取群组成员列表
   * @param {number} groupId
   * @param {(state:IMGroupMemberState)=>boolean} stateFilter 状态过滤器，null表示获取全部状态
   * @returns {Promise<ChatGroupMember[]>}
   */
  getGroupMembers(groupId, stateFilter) {
    return new Promise(async (resolve, reject) => {
      try {
        const group = await this.#updateChatGroup(groupId);
        const members = await group.getMembers(stateFilter);

        const ids = members.map((v) => v.userInfo.id);
        const users = await IMUserInfoService.Inst.getUser(ids);

        const userMap = {};

        users.forEach((user) => {
          userMap[user.id] = user;
        });

        members.forEach((member) => {
          const userInfo = userMap[member.userInfo.id];
          if (userInfo != null) {
            member.userInfo = userInfo;
          }
        });

        resolve(members);
      } catch (err) {
        reject(err);
      }

      this.#updateChatGroup(groupId)
        .then((group) => {
          group
            .getMembers(stateFilter)
            .then((ms) => {
              const ids = ms.map((v) => v.userInfo.id);
              const users = IMUserInfoService.Inst.getUser(ids);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * 退出群聊
   * @param {number} groupId
   */
  quitChatGroup(groupId) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.quitGroup(groupId)
        .then((id) => {
          this.#chatGroups[groupId] = null;
          delete this.#chatGroups[groupId];
          DataCenter.messageCache.removeChatGroup(groupId);
          resolve(id);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * 移除群聊，包括聊天记录
   * @param {number} groupId 
   */
  removeChatGroupData(groupId){
    this.#chatGroups[groupId] = null;
    delete this.#chatGroups[groupId];
    DataCenter.messageCache.removeChatGroup(groupId);
  }

  /**
   * 移除群内成员
   * @param {number} groupId
   * @param {number} memberId
   */
  removeGroupMember(groupId, memberId) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.removeGroupMember(groupId, memberId)
        .then((removedUserId) => {
          resolve(removedUserId);
        })
        .catch((err) => reject(err));
    });
  }
}

export default ChatGroupService;
