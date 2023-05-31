import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import { LesPlatformCenter, LesConstants } from "les-im-components";
// import DataCenter from "../modules/DataCenter";

class FriendService {
  static #inst;

  static get inst() {
    return FriendService.#inst ?? new FriendService();
  }

  constructor(friendListData) {
    if (new.target !== FriendService) return;
    if (!FriendService.#inst) {
      FriendService.#inst = this;
      this.friendListData = friendListData;
    }
    return FriendService.#inst;
  }

  // #onFriendStateDataUpdated({ id, state }) {
  //   if (this.friendListData) {
  //     this.friendListData.forEach(({ friendId }, index) => {
  //       if (id === friendId) {
  //         this.friendListData[index].friendState = state;
  //       }
  //     });
  //     JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
  //   }
  // }

  onFriendStateDataUpdated({ id, state }) {
    if (this.friendListData) {
      this.friendListData.forEach(({ friendId }, index) => {
        if (id === friendId) {
          this.friendListData[index].friendState = state;
        }
      });
      JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
    }
  }

  // #addFriendStateListener() {
  //   JSEvent.on(DataEvents.Friend.FriendState_Updated, ({ id, state }) =>
  //     this.#onFriendStateDataUpdated({ id, state })
  //   );
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

  // 这里的监听
  addFriendStateListener() {
    JSEvent.on(DataEvents.Friend.FriendState_Updated, ({ id, state }) =>
      this.onFriendStateDataUpdated({ id, state })
    );
  }

  //
  onSendMessage(recipentId, message) {
    LesPlatformCenter.IMFunctions.sendMessage(recipentId, message)
      .then((message) => {
        // 将发送的消息存入缓存
      })
      .catch((e) => {
        console.log("messgae send error: ", e);
      });
  }

  init() {
    this.addFriendStateListener();
  }
}

export default FriendService;
