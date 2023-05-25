import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import DataCenter from "../modules/DataCenter";

class FriendService {
  static #inst;

  static get inst() {
    return FriendService.#inst ?? new FriendService();
  }

  constructor() {
    if (new.target !== FriendService) return;
    if (!FriendService.#inst) {
      FriendService.#inst = this;
      // this.friendListData = friendListData;
      // this.friendListData = [];
    }
    return FriendService.#inst;
  }

  // setFriendListData(friendListData) {
  //   this.friendListData = friendListData;
  //   console.log(this.friendListData);
  // }

  #onFriendStateDataUpdated({ id, state }) {
    DataCenter.friendListData.forEach(({ friendId }, index) => {
      if (id === friendId) {
        DataCenter.friendListData[index].friendState = state;
      }
    });
    JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
  }

  #addFriendStateListener() {
    // console.log(this.onFriendStateDataUpdated);
    JSEvent.on(
      DataEvents.Friend.FriendState_Updated,
      this.#onFriendStateDataUpdated
    );
  }

  init() {
    this.#addFriendStateListener();
  }
}

export default FriendService;
