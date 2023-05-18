import { DataEvents, UIEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";
import DataCenter from "../modules/DataCenter";

class FriendService {
  constructor() {}

  onFriendStateDataUpdated({ id, state }) {
    DataCenter.friendListData.forEach(({ friendId }, index) => {
      if (id === friendId) {
        DataCenter.friendListData[index].friendState = state;
      }
    });
    JSEvent.emit(UIEvents.Friend.FriendState_UIRefresh);
  }

  addFriendStateListener() {
    // console.log(this.onFriendStateDataUpdated);
    JSEvent.on(
      DataEvents.Friend.FriendState_Updated,
      this.onFriendStateDataUpdated
    );
  }
}

export default FriendService;
