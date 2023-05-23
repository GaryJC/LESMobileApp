import { DataEvents } from "../modules/Events";
import JSEvent from "../utils/JSEvent";

class MockServer {
  constructor() {}
  sendMockFriendStateData() {
    let id = 1;
    setInterval(() => {
      JSEvent.emit(DataEvents.Friend.FriendState_Updated, {
        id: id,
        state: 1,
      });
      id++;
      if (id > 4) {
        clearInterval();
      }
    }, 1000);
    JSEvent.emit(DataEvents.Friend.FriendState_Updated, { id: 1, state: 1 });
  }
}

export default MockServer;
