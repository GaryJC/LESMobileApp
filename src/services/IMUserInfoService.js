import { LesPlatformCenter, LesConstants } from "les-im-components";
import IMUserInfo from "../Models/IMUserInfo";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import DataCenter from "../modules/DataCenter";

const { IMUserState, IMUserOnlineState } = LesConstants;

/**
 * 用户数据服务，监听服务器的用户状态变化事件，并更新
 * 本服务会占用LesPlatformCenter.IMListener.onIMUserStateChanged
 */
export default class IMUserInfoService {
  static #inst;

  /**
   * 用户列表
   * key = userId
   * value = IMUserInfo
   * @type {Map<number,IMUserInfo>}
   */
  userList = {};

  /**
   * @returns {IMUserInfoService}
   */
  static get Inst() {
    return IMUserInfoService.#inst ?? new IMUserInfoService();
  }

  constructor() {
    if (new.target !== IMUserInfoService) return;
    if (IMUserInfoService.#inst == null) {
      IMUserInfoService.#inst = this;
    }
    return IMUserInfoService.#inst;
  }

  /**
   * 更新用户数据，不存在则新增
   * @param {number} id id
   * @param {string} name name
   * @param {num} tag tag
   * @param {IMUserState} state state
   * @param {IMUserOnlineState} onlineState
   * @returns {IMUserInfo}
   */
  updateUser(id, name, tag, state, onlineState) {
    let userInfo = this.userList[id];
    let changed = false;
    if (userInfo == null) {
      changed = true;
      userInfo = this.userList[id] = new IMUserInfo(
        id,
        name,
        tag,
        state,
        onlineState
      );
    } else {
      changed =
        userInfo.updateName(name, tag) ||
        userInfo.changeState(state) ||
        userInfo.changeOnlineState(onlineState);
    }

    console.log(`update user info :${userInfo.toString()}`);

    if (changed) {
      JSEvent.emit(DataEvents.User.UserState_Changed, {
        id,
        state,
        onlineState,
      });
      this.#updateUserToDb(userInfo);
    }

    return userInfo;
  }

  /**
   * @todo 将用户数据更新到数据库
   * @param {IMUserInfo} user
   */
  async #updateUserToDb(user) { }

  init() {
    LesPlatformCenter.IMListeners.onIMUserStateChanged = (
      user,
      onlineState,
      state
    ) => {
      this.updateUser(
        user.getId(),
        user.getName(),
        user.getTag(),
        state,
        onlineState
      );
    };
  }

  /**
   * 设置当前用户的状态
   * @param {IMUserState} state 
   */
  setCurrentUserState(state) {
    return new Promise((resolve, reject) => {
      LesPlatformCenter.IMFunctions.setState(state).then(code => {
        DataCenter.userInfo.imUserInfo.changeState(state);
        resolve(state);
      }).catch(err => reject(err));
    })
  }

  /**
   * 获取指定id的用户数据
   * 不会返回本地缓存中不存在的用户数据
   * @param {number|number[]} userId 可以是一个或多个id
   * @returns {Promise<IMUserInfo[]>} 返回值一定是一个数组，如果没找到则返回空数组
   */
  getUser(userId) {
    return new Promise((resolve, reject) => {
      const { users, miss } = this.#getUserFromCache(userId);
      if (miss.length > 0) {
        //需要从服务器获取
        LesPlatformCenter.IMFunctions.getUsersData(miss).then(us => {
          us.forEach(u => {
            const { id, name, tag, state, onlineState } = u;
            const user = this.updateUser(id, name, tag, state, onlineState);
            users.push(user);
          })
        }).catch(err => reject(err));
      } else {
        resolve(users);
      }
    })
  }
  /**
   * 获取缓存中的用户数据，如果缓存中不存在，则会向服务器申请，更新后触发DataEvents.User.UserState_Changed事件
   * @param {number|number[]} userId 
   * @returns { IMUserInfo[] } 返回值一定是一个数组，如果没找到则返回空数组
   */
  getCachedUser(userId) {
    const { users, miss } = this.#getUserFromCache(userId);
    if (miss.length > 0) {
      this.getUser(miss);
    }
    return users;
  }

  #getUserFromCache(userId) {
    let ret = [];
    let miss = [];
    const currentUser = DataCenter.userInfo.imUserInfo;
    const pushUser = (id) => {
      const user = id == currentUser.id ? currentUser : this.userList[id];

      if (user == null) {
        miss.push(id);
      } else {
        ret.push(user);
      }
    };
    if (Array.isArray(userId)) {
      userId = Array.from(new Set(userId));
      userId.forEach((id) => {
        pushUser(id);
      });
    } else {
      pushUser(userId);
    }

    return { users: ret, miss: miss }
  }
}
