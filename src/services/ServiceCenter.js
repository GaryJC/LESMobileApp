import FriendService from "./FriendService";
import IMListenerService from "./IMListenerService";
import DataSavingService from "./DataSavingService";
import LoginService from "./LoginService";

/**
 * 负责载入所有的service，并依次执行init方法
 */
export default class ServiceCenter {
    static #inst;
    #services;

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
        let services = [];
        services.push(new FriendService());
        services.push(new IMListenerService());
        services.push(new DataSavingService());
        services.push(new LoginService());

        this.#services = services;
        
        let promises = [];

        services.forEach((service) => {
            if (service.init) {
                promises.push(service.init());
            }
        });

        await Promise.all(promises);
    }

}