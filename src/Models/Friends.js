import IMUserInfo from "./IMUserInfo";
import { LesConstants } from "les-im-components";
const { IMUserOnlineState, IMUserState } = LesConstants;
class FriendData {
  /**
   * friend id
   */
  id;
  /**
   * time to become friends
   */
  time;

  /**
   * 用户信息
   * @type {IMUserInfo}
   */
  #imUserInfo;

  constructor(id, time, userInfo) {
    this.id = id;
    this.time = time;
    this.#imUserInfo = userInfo;
  }

  get isOnline() {
    return this.#imUserInfo == null ? false : this.#imUserInfo.isOnline;
  }

  get name() {
    return this.#imUserInfo == null ? "" : this.#imUserInfo.name;
  }

  get fullName() {
    return this.#imUserInfo == null ? "" : this.#imUserInfo.fullName;
  }

  get tag() {
    return this.#imUserInfo == null ? 0 : this.#imUserInfo.tag;
  }

  get avatar() {
    return this.#imUserInfo?.avatar ?? "";
  }

  get state() {
    return this.#imUserInfo == null ? IMUserState.Hiding : this.#imUserInfo.state;
  }

  get onlineState() {
    return this.#imUserInfo == null ? IMUserOnlineState.Offline : this.#imUserInfo.onlineState;
  }

  get gameState() {
    return this.#imUserInfo == null ? 0 : this.#imUserInfo.gameState;
  }

  get avatar() {
    return this.#imUserInfo == null ? "" : this.#imUserInfo.avatar;
  }

  get bgImage() {
    return this.#imUserInfo == null ? "" : this.#imUserInfo.bgImage;
  }
}

export default FriendData;
