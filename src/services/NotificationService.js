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
        LesPlatformCenter.IMListeners.onIMUserNotification = notification => {
            this.#onRecvNotification(notification);
        }
    }

    #onRecvNotification(pbNoti) {
        const noti = DataCenter.notifications.processNotification(pbNoti);
        JSEvent.emit(DataEvents.Notification.NotificationState_Updated, noti);

        //save to database
        //DatabaseService.Inst.saveNotification(noti);
    }

    async onUserLogin() {
        console.log("create notifications")
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

    async #loadNotificationsFromServer() {
        try {
            const resps = await LesPlatformCenter.IMFunctions.getNotifications();

            resps.forEach(resp => {
                this.#onRecvNotification(resp);
            })

        } catch (e) {
            console.error("loadNotificationsFromServer failed:", e)
        }
    }

}

export default NotificationService;