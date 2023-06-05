import FriendService from "./FriendService";
import IMListenerService from "./IMListenerService";
import DataSavingService from "./DataSavingService";
import LoginService from "./LoginService";
import IMUserinfoService from "./IMUserInfoService";
import DatabaseService from "./DatabaseService";
import MessageService from "./MessageService";

import { AppState, AppStateStatus, NativeEventSubscription } from "react-native";

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
 * onDestroy()，app被销毁时调用，一般只用于调试阶段(保存代码reload后，也需要销毁一次)
 */
export default class ServiceCenter {
    static #inst;
    #services;

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

        this.#appStateSubscribtion = AppState.addEventListener('change', state => this.#handleAppStateChanged(state))

        const serviceList = [
            DatabaseService,
            FriendService,
            IMListenerService,
            DataSavingService,
            LoginService,
            IMUserinfoService,
            MessageService
        ]


        let services = [];

        serviceList.forEach(service => {
            const inst = new service();
            inst.className = service.name;
            services.push(inst);
        })

        this.#services = services;

        //依次调用service的init方法
        //init方法可以是异步方法，不依赖其他服务的数据载入，应该在init中完成

        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            if (service.init) {
                await service.init();
            }
        }

        //所有service的init执行完毕后，再依次调用service的onServiceReady方法
        //依赖其他服务的数据载入，可以在onServiceReady方法中执行

        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            if (service.onServiceReady) {
                await service.onServiceReady();
            }
        }

    }

    onAppDestroyed() {
        this.#appStateSubscribtion.remove();
        this.#services.forEach(service => {
            if (service.onDestroy) {
                service.onDestroy();
            }
        })
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
        console.log(`app is changing state from [${this.#currentAppState}] to [${state}]`);

        for (let i = 0; i < this.#services.length; i++) {
            const service = this.#services[i];
            if (service.onAppStateChanged) {
                try {
                    await service.onAppStateChanged(this.#currentAppState, state);
                } catch (e) {
                    console.log(`Service[${service.className}] onAppStateChanged`, e)
                }
            }
        }

        //Promise.all(promises);
        this.#currentAppState = state;
        console.log(`app changed state to [${state}]`);
    }

}