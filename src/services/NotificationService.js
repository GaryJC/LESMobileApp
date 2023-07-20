import { LesConstants, LesPlatformCenter } from "les-im-components";
import { Notifications, Notification } from "../Models/Notifications";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import DatabaseService from "./DatabaseService";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";

const { IMNotificationType, IMNotificationState } = LesConstants;

/**
 * 系统通知消息服务
 */
class NotificationService {
  static #inst;

  /**
   * @returns {NotificationService}
   */
  static get Inst() {
    return NotificationService.#inst ?? new NotificationService();
  }

  constructor() {
    if (new.target !== NotificationService) return;
    if (NotificationService.#inst == null) {
      NotificationService.#inst = this;
    }
    return NotificationService.#inst;
  }

  init() {
    LesPlatformCenter.IMListeners.onIMUserNotification = (notification) => {
      this.#onRecvNotification(notification);
    };
  }

<<<<<<< HEAD
  /**
   * 向目标用户发送好友邀请
   *
   * 调用成功返回对应的通知消息内容，并触发NotificationState_Updated事件
   * @param {number} recipientId
   * @returns {Promise<Notification>}
   */
  sendFriendInvitation(recipientId) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.sendFriendInvitation(recipientId)
        .then((pbNoti) => {
          this.#onRecvNotification(pbNoti);
          resolve(noti);
        })
        .catch((error) => {
          reject(error);
=======
    init() {
        LesPlatformCenter.IMListeners.onIMUserNotification = notification => {
            this.#onRecvNotification(notification);
        }
    }

    /**
     * 向目标用户发送好友邀请
     * 
     * 调用成功返回对应的通知消息内容，并触发NotificationState_Updated事件
     * @param {number} recipientId 
     * @returns {Promise<Notification>}
     */
    sendFriendInvitation(recipientId) {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.sendFriendInvitation(recipientId)
                .then(pbNoti => {
                    const noti = this.#onRecvNotification(pbNoti);
                    resolve(noti);
                }).catch(error => {
                    reject(error);
                })
        });
    }

    /**
     * 响应指定id的通知消息
     * @param {number} notificationId 
     * @param {IMNotificationState.Accepted|IMNotificationState.Rejected} respondState  
     */
    respondInvitation(notificationId, respondState) {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.respondNotification(notificationId, respondState).then(id => {
                //调用成功后续不用做处理，客户端会收到服务器发来的最新状态的通知，由onRecvNotification处理
                resolve(id);
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * 响应指定id的通知消息
     * @deprecated 直接调用 respondInvitation 方法
     * @param {number} notificationId 
     * @param {IMNotificationState.Accepted|IMNotificationState.Rejected} respondState  
     */
    respondFriendInvitation(notificationId, respondState) {
        return respondInvitation(notificationId, respondState)
    }

    /**
     * 向目标用户发送群组邀请
     * 
     * 调用成功返回对应的通知消息内容，并触发NotificationState_Updated事件
     * 
     * @param {number} groupId 
     * @param {number} recipientId 
     * @returns 
     */
    sendGroupInvitation(groupId, recipientId) {
        return new Promise((resolve, reject) => {
            LesPlatformCenter.IMFunctions.sendChatGroupInvitation(groupId, recipientId)
                .then(pbNoti => {
                    const noti = this.#onRecvNotification(pbNoti);
                    resolve(noti);
                }).catch(error => {
                    reject(error);
                })
>>>>>>> 41d6cdec83d8703c1fdf2226f76a9df46ef82cdc
        });
    });
  }

  /**
   * 响应指定id的通知消息
   * @param {number} notificationId
   * @param {IMNotificationState.Accepted|IMNotificationState.Rejected} respondState
   */
  respondInvitation(notificationId, respondState) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.respondNotification(
        notificationId,
        respondState
      )
        .then((id) => {
          //调用成功后续不用做处理，客户端会收到服务器发来的最新状态的通知，由onRecvNotification处理
          resolve(id);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 响应指定id的通知消息
   * @deprecated 直接调用 respondInvitation 方法
   * @param {number} notificationId
   * @param {IMNotificationState.Accepted|IMNotificationState.Rejected} respondState
   */
  respondFriendInvitation(notificationId, respondState) {
    return respondInvitation(notificationId, respondState);
  }

  /**
   * 向目标用户发送群组邀请
   *
   * 调用成功返回对应的通知消息内容，并触发NotificationState_Updated事件
   *
   * @param {number} groupId
   * @param {number} recipientId
   * @returns
   */
  sendGroupInvitation(groupId, recipientId) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.sendChatGroupInvitation(
        groupId,
        recipientId
      )
        .then((pbNoti) => {
          this.#onRecvNotification(pbNoti);
          resolve(noti);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  #onRecvNotification(pbNoti) {
    const noti = DataCenter.notifications.processNotification(pbNoti);
    JSEvent.emit(DataEvents.Notification.NotificationState_Updated, noti);

    //save to database
    //DatabaseService.Inst.saveNotification(noti);
  }

  async onUserLogin() {
    console.log("create notifications");
    DataCenter.notifications = new Notifications();
    //load notifications from db

    // try {
    //     const result = await DatabaseService.Inst.loadNotifications();
    //     result.forEach(r => {
    //         this.#notifications.pushNotification(r);
    //     })

    //     console.log('notifications loaded ', result.length);
    // } catch (e) {
    //     console.error("NotificationService.onUserLogin",e)
    // }

    //直接从服务器拉取最新的通知消息
    this.#loadNotificationsFromServer();
  }

  async onUserRelogin(state) {
    if (state == Constants.ReloginState.ReloginSuccessful) {
      DataCenter.notifications = new Notifications();
      await this.#loadNotificationsFromServer();
    }
  }

<<<<<<< HEAD
  async #loadNotificationsFromServer() {
    try {
      const resps = await LesPlatformCenter.IMFunctions.getNotifications();

      resps.forEach((resp) => {
        this.#onRecvNotification(resp);
      });
    } catch (e) {
      console.error("loadNotificationsFromServer failed:", e);
=======
    #onRecvNotification(pbNoti) {
        const noti = DataCenter.notifications.processNotification(pbNoti);
        JSEvent.emit(DataEvents.Notification.NotificationState_Updated, noti);
        return noti;
        //save to database
        //DatabaseService.Inst.saveNotification(noti);
>>>>>>> 41d6cdec83d8703c1fdf2226f76a9df46ef82cdc
    }
  }
}

export default NotificationService;
