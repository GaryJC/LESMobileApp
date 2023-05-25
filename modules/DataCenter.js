import Friends from "../Models/Friends";
import FriendService from "../services/FriendService";

import JSEvent from "../utils/JSEvent";
import { DataEvents } from "./Events";

const services = [];
// services.push(new FriendService());

//登录成功后初始化所有用户相关的数据
const DataCenter = {
  isLoggedin: false,
  userInfo: {
    accountId: "",
    username: "",
    loginKey: "",
    serviceId: "",
  },

  setLogin(accountId, username, loginKey, serviceId) {
    this.userInfo.accountId = accountId;
    this.userInfo.username = username;
    this.userInfo.loginKey = loginKey;
    this.userInfo.serviceId = serviceId;

    JSEvent.emit(DataEvents.User.UserState_isLoggedin);
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

  initServices() {
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
