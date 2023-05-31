import Friends from "../Models/Friends";
import FriendService from "../services/FriendService";

import JSEvent from "../utils/JSEvent";
import { DataEvents } from "./Events";
import { Platform } from "react-native";

import { db } from "./dataBase";

const services = [];
// services.push(new FriendService());

// 程序启动的时候，从数Sqlite中读取并重建DataCenter的数据缓存
const DataCenter = {
  isLoggedin: false,

  deviceName:
    Platform.OS === "ios"
      ? "IOS"
      : Platform.OS === "android"
      ? "Android"
      : Platform.OS === "web"
      ? "Web"
      : "PC",
  // deviceName: "IOS",

  userInfo: {
    accountId: "",
    email: "",
    loginKey: "",
  },

  setLogin(accountId, email, loginKey, serviceId) {
    this.userInfo.accountId = accountId;
    this.userInfo.email = email;
    this.userInfo.loginKey = loginKey;
    // this.userInfo.serviceId = serviceId;

    JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
  },

  // friendId, friendName, friendState, friendAvatar
  friendListData: [],

  getFriendListData() {
    this.friendListData = [
      new Friends(1, "Tony", 0, "https://i.pravatar.cc"),
      new Friends(2, "Michael", 1, "https://i.pravatar.cc"),
      new Friends(3, "Bruce", 2, "https://i.pravatar.cc"),
      new Friends(4, "Peter", 2, "https://i.pravatar.cc"),
      new Friends(5, "Roy", 2, "https://i.pravatar.cc"),
      new Friends(6, "Devin", 0, "https://i.pravatar.cc"),
      new Friends(7, "Kevin", 1, "https://i.pravatar.cc"),
      new Friends(8, "Mike", 2, "https://i.pravatar.cc"),
      new Friends(9, "Jack", 2, "https://i.pravatar.cc"),
      new Friends(10, "Wendy", 2, "https://i.pravatar.cc"),
    ];
  },

  // 消息记录缓存
  /*
    recipientId:{
      messageId:{
        content:
        ...
      }
    }
  */
  /*
    accountId-accountId:{
    }
    e.g. 
      1-17:{
        messageId:{
          ...
        }
      }
   */

  messageCatches: {},

  initServices() {
    // 程序开始时就识别设备平台
    // this.deviceName = Platform.OS.toLocaleUpperCase();
    // console.log(this.deviceName);

    this.getFriendListData();
    services.push(new FriendService(this.friendListData));

    services.forEach((service) => {
      if (service.init) {
        service.init();
      }
    });
  },
};

export default DataCenter;
