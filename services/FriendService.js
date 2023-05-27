import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
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

  pullData(data) {
    // 这个方法我以前放在MockServer里， 现在应该被UpdateService调用
    JSEvent.emit(DataEvents.Friend.FriendState_Updated, data);
  }

  addFriendStateListener() {
    JSEvent.on(DataEvents.Friend.FriendState_Updated, ({ id, state }) =>
      this.onFriendStateDataUpdated({ id, state })
    );
  }

  init() {
    this.addFriendStateListener();
  }
}

export default FriendService;
