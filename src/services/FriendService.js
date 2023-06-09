import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import { LesPlatformCenter, LesConstants } from "les-im-components";
import DataSavingService from "./DataSavingService";
import DataCenter from "../modules/DataCenter";
import IMUserInfoService from "./IMUserInfoService";
import FriendData from "../Models/Friends";
import Constants from "../modules/Constants";
import { Notification, Notifications } from "../Models/Notifications";

const { IMUserState, IMUserOnlineState, IMNotificationType, IMNotificationState } = LesConstants;

class FriendService {
  static #inst;

  /**
   * 好友列表
   * id: friendId
   * time: time to become friends
   * @type {{id:number, time:number}[]}
   */
  #friendList = [];

  /**
   * @returns {FriendService}
   */
  static get Inst() {
    return FriendService.#inst ?? new FriendService();
  }

  constructor() {
    if (new.target !== FriendService) return;
    if (FriendService.#inst == null) {
      FriendService.#inst = this;
    }
    return FriendService.#inst;
  }

  // onFriendStateDataUpdated({ id, state }) {
  //   if (this.friendListData) {
  //     this.friendListData.forEach(({ friendId }, index) => {
  //       if (id === friendId) {
  //         this.friendListData[index].friendState = state;
  //       }
  //     });
  //     JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
  //   }
  // }

  pullData() {
    /* 
      调用API拉取数据，发布pulldata事件
      拉取结束后发布pulldata结束事件
      这些事件被UpdateService所监听，并触发ui加载页面

      发布对应的数据更新事件
      JSEvent.emit(DataEvents.Friend.FriendState_Updated, args)
    */
    // JSEvent.emit(DataEvents.PullData.PullDataState_IsStarted);
    // JSEvent.emit(DataEvents.PullData.PullDataState_IsFinished);
  }

  async init() {
    //监听用户状态变化事件
    JSEvent.on(DataEvents.User.UserState_Changed, (id, state, onlineState) => this.#onUserStateChanged(id, state, onlineState));

    JSEvent.on(DataEvents.Notification.NotificationState_Updated, noti => this.#onNotificationUpdated(noti))
    LesPlatformCenter.IMListeners.onFriendRemoved = (friendId) => {
      this.#onFriendRemoved(friendId);
    };

    //监听用户登录事件
    //改为由ServiceCenter统一监听，并调用service.onUserLogin方法
    // JSEvent.on(DataEvents.User.UserState_DataReady, () => {
    //   this.#onUserLogin();
    // })
  }

  /**
   * 
   * @param {Notification} noti 
   */
  #onNotificationUpdated(noti) {
    if (noti.type == IMNotificationType.FriendInvitation) {
      if (noti.state == IMNotificationState.Accepted) {
        //好友邀请被通过了，加到好友列表中
        const friend = { id: 0, name: "", tag: 0, state: IMUserState.Online, onlineState: IMUserOnlineState.Offline };
        if (noti.mode == "sender") {
          friend.id = noti.recipient.id;
          friend.name = noti.recipient.name;
          friend.tag = noti.recipient.tag;
        } else {
          friend.id = noti.sender.id;
          friend.name = noti.sender.name;
          friend.tag = noti.sender.tag;
        }
        this.#addFriend(friend.id, friend.name, friend.tag, friend.state, friend.onlineState, noti.time);
        JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
      }
    }
  }

  #onFriendRemoved(friendId) {
    const idx = this.#friendList.findIndex(item => item.id == friendId);
    if (idx > -1) {
      this.#friendList.splice(idx, 1);
      JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
    }
  }

  /**
   * 
   * @param {number} id 
   * @param {string} name 
   * @param {number} tag 
   * @param {IMUserState} state 
   * @param {IMUserOnlineState} onlineState 
   * @param {number} time 
   */
  #addFriend(id, name, tag, state, onlineState, time) {
    IMUserInfoService.Inst.updateUser(id, name, tag, state, onlineState);
    const idx = this.#friendList.findIndex(item => item.id == id);
    if (idx > -1) return;
    this.#friendList.push({ id: id, time: time });
  }

  async onUserLogin() {
    await this.#pullFriendsDataFromServer();
  }

  async #pullFriendsDataFromServer() {
    const { accountId } = DataCenter.userInfo;
    try {
      const friends = await LesPlatformCenter.IMFunctions.getFriends();
      let friendList = [];

      friends.forEach((f) => {
        const baseData = f.getFriendinfo();
        const id = baseData.getId();
        const name = baseData.getName();
        const tag = baseData.getTag();
        const state = f.getState();
        const onlineState = f.getOnlinestate();
        const time = f.getTime();

        IMUserInfoService.Inst.updateUser(id, name, tag, state, onlineState);
        friendList.push({ id: id, time: time });
      });

      this.#friendList = friendList;

      //读取完毕，发送好友更新事件
      JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
    } catch (e) {
      console.log("好友获取失败:", e.toString(16));
    }
  }

  /**
   * 返回好友列表
   * filter为过滤器，可以为空
   * @param {function(FriendData):boolean | null} filter
   */
  getFriendList(filter) {
    let friends = [];

    this.#friendList.forEach((f) => {
      const user = IMUserInfoService.Inst.getUser(f.id);
      let u = null;
      if (user.length != null && user.length > 0) {
        u = user[0];
      }
      const friendData = new FriendData(f.id, f.time, user[0]);
      console.log("ffdsa: ", user[0]);
      if (filter == null) {
        friends.push(friendData);
      } else {
        const r = filter(friendData);
        if (r) {
          friends.push(friendData);
        }
      }
    });

    return friends.sort((f1, f2) => {
      if (f1.isOnline != f2.isOnline) {
        return f1.isOnline ? 1 : -1;
      } else {
        return f1.name.localeCompare(f2.name);
      }
    });
  }

  /**
   * @todo 从数据库中读取用户的好友数据
   * @param {number} id
   * @returns {boolean}
   */
  async #loadFriendsFromDb(id) {
    return false;
  }

  /**
   *
   * @param {number} id
   * @param {IMUserState} state
   * @param {IMUserOnlineState} onlineState
   */
  #onUserStateChanged(id, state, onlineState) {
    JSEvent.emit(UIEvents.User.UserState_UIRefresh, { id, state, onlineState });
  }

  async onUserRelogin(state) {
    if (state == Constants.ReloginState.ReloginSuccessful) {
      await this.#pullFriendsDataFromServer();
    }
  }

}

export default FriendService;
