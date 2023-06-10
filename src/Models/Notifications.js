import { LesConstants } from "les-im-components";
import DataCenter from "../modules/DataCenter";

const { IMNotificationType, IMNotificationState } = LesConstants;
class Notifications {
    /**
     * 通知消息列表
     * @type {Notification[]}
     */
    notificationList;

    constructor() {
        this.notificationList = [];
    }

    /**
     * 将protobuf通知消息数据，转化为Notification数据
     * @param {PBLesIMUserNotificationData} pbData 
     * @returns {Notification}
     */
    static PbDataToNofitication(pbData) {
        const noti = new Notification();
        noti.id = pbData.getId();
        noti.type = pbData.getType();
        const sender = pbData.getSender();
        const reci = pbData.getRecipient();
        noti.sender = {
            id: sender.getId(),
            name: sender.getName(),
            tag: sender.getTag()
        }
        noti.recipient = {
            id: reci.getId(),
            name: reci.getName(),
            tag: reci.getTag()
        }
        noti.state = pbData.getState();
        noti.time = pbData.getTime();
        const group = pbData.getGroup();
        if (group == null) {
            noti.groupInfo = { id: 0, name: "" }
        } else {
            noti.groupInfo = {
                id: pbData.getGroup().getGroupid(),
                name: pbData.getGroup().getName(),
            }
        }
        noti.content = pbData.content;
        return noti;
    }

    /**
     * 处理收到的通知消息
     * @param {PBLesIMUserNotificationData} pbData 
     * @returns {Notification}
     */
    processNotification(pbData) {
        const noti = Notifications.PbDataToNofitication(pbData);
        this.pushNotification(noti);
        return noti;
    }

    /**
     * 
     * @param {Notification} noti 
     */
    pushNotification(noti) {
        const { accountId } = DataCenter.userInfo;
        if (noti.sender.id == accountId) {
            //当前用户是消息发送者
            noti.mode = "sender";
        } else if (noti.recipient.id == accountId) {
            //当前用户是消息接收者
            noti.mode = "recipient";
        }
        if (noti.state <= IMNotificationState.Read) {
            //状态在Read之前的通知消息，放入列表中
            this.#addNotificationToList(noti);
        } else {
            //响应过的消息，从列表中移除
            this.#removeNotificationFromList(noti);
        }
    }

    /**
     * 将通知消息加入列表
     * @param {Notification} noti 
     */
    #addNotificationToList(noti) {
        const { index } = this.#findNotification(noti.id);
        if (index == -1) {
            this.notificationList.push(noti);
        } else {
            this.notificationList[idx] = noti;
        }
        this.#sortList();
    }

    /**
        * 将通知消息移出列表
        * @param {Notification} noti 
        */
    #removeNotificationFromList(noti) {
        const { index } = this.#findNotification(noti.id);
        if (index != -1) {
            this.notificationList.splice(index, 1);
        }
        this.#sortList();
    }

    #sortList() {
        this.notificationList.sort((n1, n2) => n1.time - n2.time)
    }

    /**
     * 查找指定id的notification
     * @param {number} id 
     * @returns {{index:number, notification:Notification}}
     */
    #findNotification(id) {
        var idx = this.notificationList.findIndex(item => item.id == id);
        const noti = idx == -1 ? null : this.notificationList[idx];
        return { index: idx, notification: noti };
    }

    /**
     * 将指定id的消息设置为已读状态
     * 
     * 只有未读状态的消息才会变成已读状态
     * 
     * @param {number} notificationId
     * @returns {Notification}
     */
    setNotificationRead(notificationId) {
        const { index, notification } = this.#findNotification(notificationId);
        if (index == -1) return null;

        if (notification.state == IMNotificationState.Unread) {
            notification.state = IMNotificationState.Read;
        }
        return notification;
    }


    //#region ui调用部分

    /**
     * 返回当前所有的通知消息，或指定类型的通知消息
     * 
     * 只会返回还未响应的消息
     * 
     * @param {IMNotificationType | null} type
     * @returns {Notification[]}
     */
    getAllNotifications(type = null) {
        if (type == null) {
            return [...this.notificationList];
        } else {
            return this.notificationList.filter(noti => noti.type == type);
        }
    }

    /**
     * 返回未读的通知数量，或指定类型的未读通知消息数量
     * @param {IMNotificationType | null} type
     * @returns {number}
     */
    unreadCount(type = null) {
        let count = 0;
        this.notificationList.forEach(noti => {
            if (noti.state == IMNotificationState.Unread && noti.mode == "recipient") {
                //非指定类型的消息，不计数
                if (type != null && type != noti.type) return;
                //只有接收者模式，状态是unread的通知，才算做未读消息
                count++;
            }
        })
        return count;
    }
    //#endregion

}

class Notification {
    /**
     * 通知id
     * @type {number}
     */
    id;

    /**
     * 通知类型
     * @type {IMNotificationType}
     */
    type;

    /**
     * 通知发送来源
     * @type {id:number, name:string, tag:number}
     */
    sender;

    /**
     * 通知接收人
     * @type {id:number, name:string, tag:number}
     */
    recipient;

    /**
     * 当前通知模式
     * 
     * 模式分为 "发送者模式" 和 "接收者模式"
     * 
     * 发送者模式 表示这个通知消息是由当前用户发出的
     * 
     * 接收者模式 表示这个通知消息是发送给当前用户的，需要用户响应
     * 
     * @type {"sender"|"recipient"}
     */
    mode;

    /**
     * 通知状态
     * @type {IMNotificationState}
     */
    state;

    /**
     * 通知时间
     * @type {number}
     */
    time;

    /**
     * 相关群组信息，只有跟群组相关的通知消息才会带这个数据
     * @type {id:number,name:string}
     */
    groupInfo;

    /**
     * 通知内容，一般系统消息会带有通知内容
     * @type {string}
     */
    content;
}

export { Notifications, Notification }