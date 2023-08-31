import FriendService from "./FriendService";
import IMListenerService from "./IMListenerService";
import DataSavingService from "./DataSavingService";
import LoginService from "./LoginService";
import IMUserinfoService from "./IMUserInfoService";
import DatabaseService from "./DatabaseService";
import MessageService from "./MessageService";

import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform,
} from "react-native";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import Constants from "../modules/Constants";
import NotificationService from "./NotificationService";
import ChatGroupService from "./ChatGroupService";
import FirebaseMessagingService from "./FirebaseMessagingService";

const { ReloginState } = Constants;

/**
 * 负责载入所有的service
 *
 * 约定接口
 * init(), 如果service含有init() 方法，会在service被载入时调用，可以是async方法
 *
 * onServiceReady()，如果service含有onServiceReady()方法，会在所有service的init方法都被执行过后，再依次执行所有service的onServiceReady()方法，可以是async方法
 *
 * onAppStateChanged(fromState, toState)，如果service含有onAppStateChanged()方法，会在app切换状态（前台，后台等）时被依次调用，可以是async方法
 *
 * onUserLogin(), 如果service含有onUserLogin方法，会在用户登录成功后，且已经从数据库中读取出缓存信息后，依次调用，可以使async方法
 *
 * onUserRelogin(state)，如果service含有onUserRelogin()方法，会在客户端尝试重连、成功或失败时依次调用，可以是async方法
 *
 * onDestroy()，app被销毁时调用，一般只用于调试阶段(保存代码reload后，也需要销毁一次)
 */
export default class ServiceCenter {
  static #inst;
  #services;

  #isLoading = false;

  /**
   * 当前app状态
   * @type {AppStateStatus}
   */
  #currentAppState = null;

  /**
   * @type {NativeEventSubscription}
   */
  #appStateSubscribtion;

  /**
   * @returns {ServiceCenter}
   */
  static get Inst() {
    return ServiceCenter.#inst ?? new ServiceCenter();
  }

  constructor() {
    if (new.target !== ServiceCenter) return;
    if (ServiceCenter.#inst == null) {
      ServiceCenter.#inst = this;
    }
    return ServiceCenter.#inst;
  }

  /**
   * 异步加载所有服务
   * 服务的init方法可以使同步方法，也可以是异步方法
   */
  async loadAllServices() {

    this.#isLoading = true;

    this.#appStateSubscribtion = AppState.addEventListener("change", (state) =>
      this.#handleAppStateChanged(state)
    );

    JSEvent.on(DataEvents.User.UserState_Relogin, (state) => {
      this.#onUserRelogin(state);
    });

    /**
     * UserState_DataReady 事件从DatabaseService中发出，在用户登录，且数据载入完毕后发出
     */
    JSEvent.on(DataEvents.User.UserState_DataReady, () => {
      this.#onUserLogin();
    });

    const serviceList = [
      DatabaseService,
      FriendService,
      IMListenerService,
      DataSavingService,
      LoginService,
      IMUserinfoService,
      MessageService,
      NotificationService,
      ChatGroupService,
      FirebaseMessagingService
    ];

    let services = [];

    serviceList.forEach((service) => {
      const inst = new service();
      inst.className = service.name;
      services.push(inst);
    });

    this.#services = services;

    //依次调用service的init方法
    //init方法可以是异步方法，不依赖其他服务的数据载入，应该在init中完成

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (service.init) {
        try {
          await service.init();
        } catch (e) {
          console.error(`Service[${service.className}] init `, e);
        }
      }
    }

    //所有service的init执行完毕后，再依次调用service的onServiceReady方法
    //依赖其他服务的数据载入，可以在onServiceReady方法中执行

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (service.onServiceReady) {
        try {
          await service.onServiceReady();
        } catch (e) {
          console.error(`Service[${service.className}] onServiceReady `, e);
        }
      }
    }

    this.#isLoading = false;
  }

  onAppDestroyed() {
    this.#appStateSubscribtion.remove();
    this.#services.forEach((service) => {
      if (service.onDestroy) {
        service.onDestroy();
      }
    });
  }

  async #onUserLogin() {
    console.log(`user login, start invoking service.onUserLogin`);
    for (let i = 0; i < this.#services.length; i++) {
      const service = this.#services[i];
      if (service.onUserLogin) {
        try {
          service.onUserLogin();
        } catch (e) {
          console.error(`Service[${service.className}] onUserLogin `, e);
        }
      }
    }
  }

  /**
   *
   * @param {ReloginState} state
   */
  async #onUserRelogin(state) {
    console.log(
      `user relogin state[${state}], start invoking service.onUserRelogin`
    );
    // JSEvent.emit(UIEvents.AppState_UIUpdated, true);
    for (let i = 0; i < this.#services.length; i++) {
      const service = this.#services[i];
      if (service.onUserRelogin) {
        try {
          await service.onUserRelogin(state);
        } catch (e) {
          console.error(`Service[${service.className}] onUserRelogin `, e);
        }
      }
    }
    // JSEvent.emit(UIEvents.AppState_UIUpdated, false);
  }

  /**
   *
   * @param {AppStateStatus} state
   */
  #handleAppStateChanged(state) {
    this.#onAppStateChanged(state);
  }

  /**
   * app状态变化时，回调各个service
   * @param {AppStateStatus} state
   */
  async #onAppStateChanged(state) {
    //active 前台
    //background 后台
    //inactive ios特有，处于多任务视图，或者来电状态中
    console.log(
      `app is changing state from [${this.#currentAppState}] to [${state}]`
    );

    if (!this.#isLoading) {
      JSEvent.emit(UIEvents.AppState_UIUpdated, true);
      for (let i = 0; i < this.#services.length; i++) {
        const service = this.#services[i];
        if (service.onAppStateChanged) {
          try {
            await service.onAppStateChanged(this.#currentAppState, state);
            console.log("from state to state: ", this.#currentAppState, state);
          } catch (e) {
            console.error(`Service[${service.className}] onAppStateChanged`, e);
          }
        }
      }
      JSEvent.emit(UIEvents.AppState_UIUpdated, false);
    }
    //Promise.all(promises);
    this.#currentAppState = state;
    console.log(`app changed state to [${state}]`);
  }
}
