import { Platform } from "react-native";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "./Events";
import FriendData from "../Models/Friends";
import MessageData from "../Models/MessageData";
import { MessageCaches } from "../Models/MessageCaches";
import { Notifications } from "../Models/Notifications";
import IMUserInfo from "../Models/IMUserInfo";
import UserProfile from "../Models/UserProfile";


const services = [];
// services.push(new FriendService());

// 程序启动的时候，从数Sqlite中读取并重建DataCenter的数据缓存

/**
 * DataCenter作为数据中心，负责app中所有数据的缓存
 * UI部分读取数据时可以直接从DataCenter读取
 * 
 * DataSavingService用于DataCenter数据的写入，其他服务和ui不要直接将数据写入DataCenter，可调用DataSavingService提供的方法进行数据保存
 */
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

  /**
   * 当前登录的用户数据，
   */
  userInfo: {
    accountId: "",
    /**
     * @deprecated
     * 移到了userProfile中
     */
    email: "",
    loginKey: "",

    fcmToken:"",
    /**
     * 用户账户信息
     * @type {UserProfile}
     */
    userProfile: new UserProfile(),
    /**
     * im用户信息
     * @type {IMUserInfo}
     */
    imUserInfo: new IMUserInfo()
  },

  /**
   * @deprecated 登录操作都移动到了LoginService中
   */
  setLogin(accountId, email, loginKey, serviceId) {
    this.userInfo.accountId = accountId;
    this.userInfo.email = email;
    this.userInfo.loginKey = loginKey;
    // this.userInfo.serviceId = serviceId;

    JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
  },

  // friendId, friendName, friendState, friendAvatar
  /**
   * 好友列表
   * @type {FriendData[]}
   */
  friendListData: [],

  // getFriendListData() {
  //   this.friendListData = [
  //     new Friends(1, "Tony", 0, "https://i.pravatar.cc"),
  //     new Friends(2, "Michael", 1, "https://i.pravatar.cc"),
  //     new Friends(3, "Bruce", 2, "https://i.pravatar.cc"),
  //     new Friends(4, "Peter", 2, "https://i.pravatar.cc"),
  //     new Friends(5, "Roy", 2, "https://i.pravatar.cc"),
  //     new Friends(6, "Devin", 0, "https://i.pravatar.cc"),
  //     new Friends(7, "Kevin", 1, "https://i.pravatar.cc"),
  //     new Friends(8, "Mike", 2, "https://i.pravatar.cc"),
  //     new Friends(9, "Jack", 2, "https://i.pravatar.cc"),
  //     new Friends(10, "Wendy", 2, "https://i.pravatar.cc"),
  //   ];
  // },

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
    {
      1-17:[
        {
          messageId:
          timelineId:
          content:
        }
      ]
    }
   */

  /**
   * 消息缓存
   * key = chat id
   * value = MessageData[]
   * @deprecated 改用messageCache了
   * @type {Map<string, MessageData[]>}
   */
  messageCaches: {},

  /**
   * 消息缓存
   * @type {MessageCaches}
   */
  messageCache: null,

  /**
   * 通知消息
   * @type {Notifications}
   */
  notifications: null,
};

export default DataCenter;
