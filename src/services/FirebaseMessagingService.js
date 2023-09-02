import { PermissionsAndroid } from "react-native";
import messaging  from "@react-native-firebase/messaging";
import DataCenter from "../modules/DataCenter";

class FirebaseMessagingService {
    static #inst;

    permissionsAllowed = false;

    fcmToken = "";

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
        }else{
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


}

export default FirebaseMessagingService;