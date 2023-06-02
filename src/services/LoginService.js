import DataSavingService from "./DataSavingService";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";
import { loginRequest } from "../utils/auth";

const LoginExceptionType = Constants.LoginExceptionType;
const ErrorCodes = LesConstants.ErrorCodes;
/**
 * Login服务，用于登陆，连接IM服务器
 */
export default class LoginService {
    static #inst;

    /**
     * @type {LoginData}
     */
    #loginData;

    /**
     * @returns {LoginService}
     */
    static get Inst() {
        return LoginService.#inst ?? new LoginService();
    }

    constructor() {
        if (new.target !== LoginService) return;
        if (LoginService.#inst == null) {
            LoginService.#inst = this;
        }
        return LoginService.#inst;
    }

    async init() {
        await this.#loadLoginData();
        return this;
    }


    /**
     * 从SecureStore中读取登录信息
     * 登录信息数据格式为
     * {
     *      lastLoginId:上次登录成功所使用的账号id,
     *      loginInfos: {
     *          账号Id: {id:账号Id, token:登陆token，email:登录邮箱, name: im昵称, tag: 昵称tag}
     *      }
     * }
     */
    async #loadLoginData() {
        const savingService = DataSavingService.Inst;
        let loginData = await savingService.secureGetData(Constants.SecureStoreKeys.LoginData);
        this.#loginData = new LoginData();
        if (loginData != null) {
            this.#loginData = new LoginData(loginData);
        }
    }

    /**
     * 将当前登录信息保存到Secure Store
     */
    async #saveLoginData() {
        const savingService = DataSavingService.Inst;
        const loginData = this.#loginData.saveLoginData();
        savingService.secureSaveData(Constants.SecureStoreKeys.LoginData, loginData);
    }

    /**
     * 返回是否可以快速登录
     * 本地缓存中如果有loginId和Key，则可以快速登录，不经过accountServer的loginCheck
     */
    canQuickLogin() {
        if (this.#loginData != null && this.#loginData.lastLoginId != -1) {
            const loginInfo = this.#loginData.getLoginInfo();
            return loginInfo != null && loginInfo.id != null && loginInfo.token != null;
        }
        return false;
    }

    /**
     * 快速登录，直接使用当前已有的id和token连接IM服务器
     * @returns {ErrorCodes}
     */
    async quickLogin() {
        const loginInfo = this.#loginData.getLoginInfo();
        const device = LesConstants.IMDevices[DataCenter.deviceName];

        try {

            console.log(`trying to quick login ${loginInfo.id} => ${loginInfo.token}`)

            const result = await LesPlatformCenter.Inst.connect(Constants.Address.IMServer, loginInfo.id, loginInfo.token, device);
            //登陆成功
            const imUserInfo = { name: result.name, tag: result.tag, state: result.state }

            //保存登陆凭证
            this.#loginData.addLoginInfo(loginInfo);

            //保存当前用户数据
            DataSavingService.Inst.saveLoginDataToDataCenter(loginInfo.id, loginInfo.token, loginInfo.email, imUserInfo);
            this.#saveLoginData();

            //发送登陆成功事件
            JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
            return LesConstants.ErrorCodes.Success;
        } catch (e) {
            //错误，返回错误码
            return e;
        }
    }

    /**
     * 使用用户名密码进行登录
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {{id:number,name:string,tag:number,state:IMUserState}}
     * @throws {{type:LoginExceptionType, code:number, msg:string}}}
     */
    async login(username, password) {
        const device = DataCenter.deviceName;
        try {
            //向accountCenter请求登陆
            const response = await loginRequest(
                username,
                password,
                device
            );
            const data = response.data;
            //accountCenter登陆成功
            if (data.code == 0) {
                const { accountId, msg } = data.retObject;
                try {
                    const result = await LesPlatformCenter.Inst.connect(Constants.Address.IMServer, accountId, msg, LesConstants.IMDevices[device]);
                    //登陆成功
                    const imUserInfo = { name: result.name, tag: result.tag, state: result.state }

                    //保存登陆凭证
                    const loginInfo = { id: accountId, token: msg, email: username, name: imUserInfo.name, tag: imUserInfo.tag };
                    this.#loginData.addLoginInfo(loginInfo);

                    //保存当前用户数据
                    DataSavingService.Inst.saveLoginDataToDataCenter(accountId, msg, username, imUserInfo);
                    this.#saveLoginData();

                    //发送登陆成功事件
                    JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
                    return result;
                } catch (e) {
                    throw { type: LoginExceptionType.IMServerError, code: e };
                }
            } else {
                throw { type: LoginExceptionType.AccountCenterError, code: data.code, msg: data.msg };
            }
        } catch (e) {
            throw e;
        }
    }

}

class LoginInfo {
    id;
    token;
    email;
    name;
    tag;
}

class LoginData {

    /**
     * 上次登录成功的账号id
     */
    lastLoginId;
    /**
     * 所有账号的登录信息
     * @type {Map<number,LoginInfo>}
     */
    #loginInfoMap;

    constructor(loginData) {
        this.loadLoginData(loginData);
        return this;
    }

    loadLoginData(loginData) {
        if (loginData == null || loginData.lastLoginId == null) {
            this.lastLoginId = -1;
            this.#loginInfoMap = {};
        } else if (loginData.lastLoginId != null) {
            this.lastLoginId = loginData.lastLoginId;
            this.#loginInfoMap = loginData.loginInfos;
        }
    }

    saveLoginData() {
        const loginData = {
            lastLoginId: this.lastLoginId,
            loginInfos: { ...this.#loginInfoMap }
        }
        return loginData;
    }

    /**
     * 获取用户id对应的loginInfo，不存在返回null
     * @param {number} id 用户id，不填则返回上一次登陆成功的登录信息
     * @returns {LoginInfo}
     */
    getLoginInfo(id) {
        if (id == null) {
            id = this.lastLoginId;
        }
        const info = this.#loginInfoMap[id];
        return info;
    }

    /**
     * 将用户的登陆信息加入列表，并将lastLoginId设置为loginInfo.id
     * @param {{id:number,token:string,email:string,name:string,tag:number}} loginInfo 
     */
    addLoginInfo(loginInfo) {
        if (loginInfo == null || loginInfo.id == null) return;
        this.lastLoginId = loginInfo.id;
        this.#loginInfoMap[loginInfo.id] = loginInfo;
    }

}