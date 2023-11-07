import messaging, { firebase } from "@react-native-firebase/messaging";
import { PermissionsAndroid } from "react-native";
import DataCenter from "../modules/DataCenter";
import notifee from "@notifee/react-native";

class FirebaseMessagingService {
    static #inst;

    permissionsAllowed = false;

    fcmToken = "";

    /**
     * @returns {FirebaseMessagingService}
     */
    static get Inst() {
        return FirebaseMessagingService.#inst ?? new FirebaseMessagingService();
    }

    constructor() {
        if (new.target !== FirebaseMessagingService) return;
        if (FirebaseMessagingService.#inst == null) {
            FirebaseMessagingService.#inst = this;
        }
        return FirebaseMessagingService.#inst;
    }

    async init() {
        let enabled = false;

        // messaging().onMessage(async message => {
        //     console.log("got message=====", message);
        //     await this.displayMessage(message);
        // })
        // messaging().setBackgroundMessageHandler(async message => {
        //     console.log("got background message=====", message);
        //     await this.displayMessage(message);
        // })

        // notifee.requestPermission();
        // notifee.onForegroundEvent(async ({ type, detail }) => {
        //     console.log("===FFFF==", type, detail);
        // })

        // notifee.onBackgroundEvent(async ({ type, detail }) => {
        //     console.log("===BBBB==", type, detail);
        // })

        if (Platform.OS == 'android') {
            const permiStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            enabled = permiStatus != 'denied';
        } else if (Platform.OS == 'ios') {
            const authStatus = await messaging().requestPermission();
            enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        }

        if (!enabled) {
            console.log("Permission Notification Request Failed: User Denied")
        } else {
        }

        this.permissionsAllowed = enabled;

        try {
            const fcmToken = await messaging().getToken();
            DataCenter.userInfo.fcmToken = fcmToken;
            console.log("fcm token:", fcmToken);
            this.fcmToken = fcmToken;
        } catch (e) {
            console.log("Get Fcm Token error:", e);
        }

    }

    async getFcmToken() {
        try {
            const fcmToken = await messaging().getToken();
            return fcmToken;
        } catch (e) {
            console.log("Get Fcm Token error:", e);
            return "";
        }
    }

}

export default FirebaseMessagingService;