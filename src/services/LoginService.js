import DataSavingService from "./DataSavingService";
import Constants from "../modules/Constants";
import DataCenter from "../modules/DataCenter";
import { LesConstants, LesPlatformCenter } from "les-im-components";
import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import { loginRequest, Firebase } from "../utils/auth";
import { AppState, AppStateStatus } from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import UserProfile from "../Models/UserProfile"

const LoginChannel = "Firebase";

const { LoginExceptionType, LoginState } = Constants;
const { ErrorCodes, WebsocketState } = LesConstants;
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
    // auth().onAuthStateChanged(user => {
    //   console.log("====", user);
    //   user?.getIdToken().then(token => { console.log("login token:", token) })
    // })

    await this.#loadLoginData();
    LesPlatformCenter.IMListeners.onWebsocketStateChanged = (state) => {
      if (state == WebsocketState.Disconnected) {
        //连接断开了
        if (AppState.currentState == "active") {
          //当前处于激活状态，网络连接断开了，尝试重连
          // setTimeout(() => this.quickLogin(true), 1000);
        }
      }
    };
    return this;
  }

  /**
   *
   * @param {AppStateStatus} fromState
   * @param {AppStateStatus} toState
   */
  async onAppStateChanged(fromState, toState) {
    if (toState == "background") {
      //ios切换到后台以后会断开socket，android需要手动断开
      LesPlatformCenter.Inst.disconnect();
    }

    if (toState == "active" && fromState != null) {
      //应用被重新激活了
      //检测连接是否正常

      if (LesPlatformCenter.Inst.ConnectState != WebsocketState.Connected) {
        console.log("websocket disconnected, need to re-reconnect");
        // 重新连接
        // 发送重新连接事件通知UI加载loading bar
        // JSEvent.emit(UIEvents.AppState_UIUpdated, true);
        await this.quickLogin(true);
        // JSEvent.emit(UIEvents.AppState_UIUpdated, false);
      }
    }
  }

  onDestroy() {
    //LesPlatformCenter.Inst.disconnect();
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
    let loginData = await savingService.secureGetData(
      Constants.SecureStoreKeys.LoginData
    );
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
    savingService.secureSaveData(
      Constants.SecureStoreKeys.LoginData,
      loginData
    );
  }

  /**
   * @deprecated
   * 旧的登录逻辑，废弃了
   * 返回是否可以快速登录
   * 本地缓存中如果有loginId和Key，则可以快速登录，不经过accountServer的loginCheck
   */
  canQuickLogin() {
    if (this.#loginData != null && this.#loginData.lastLoginId != -1) {
      const loginInfo = this.#loginData.getLoginInfo();
      return (
        loginInfo != null && loginInfo.id != null && loginInfo.token != null
      );
    }
    return false;
  }

  /**
   * @deprecated
   * 旧的登录逻辑，废弃了
   * 快速登录，直接使用当前已有的id和token连接IM服务器
   * @returns {ErrorCodes}
   */
  async quickLogin(isReconnect = false) {
    const loginInfo = this.#loginData.getLoginInfo();
    const device = LesConstants.IMDevices[DataCenter.deviceName];

    try {
      console.log(
        `trying to quick login ${loginInfo.id} => ${loginInfo.token}`
      );

      if (isReconnect) {
        JSEvent.emit(
          DataEvents.User.UserState_Relogin,
          Constants.ReloginState.ReloginStarted
        );
      }

      const result = await LesPlatformCenter.Inst.connect(
        Constants.Address.IMServer,
        loginInfo.id,
        loginInfo.token,
        device
      );

      //登陆成功
      const imUserInfo = {
        name: result.name,
        tag: result.tag,
        state: result.state,
      };

      //保存登陆凭证
      this.#loginData.addLoginInfo(loginInfo);

      //保存当前用户数据
      DataSavingService.Inst.saveLoginDataToDataCenter(
        loginInfo.id,
        loginInfo.token,
        loginInfo.email,
        imUserInfo
      );
      this.#saveLoginData();

      //发送登陆成功事件
      if (isReconnect) {
        JSEvent.emit(
          DataEvents.User.UserState_Relogin,
          Constants.ReloginState.ReloginSuccessful
        );
      } else {
        JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
      }

      return LesConstants.ErrorCodes.Success;
    } catch (e) {
      if (isReconnect) {
        //重连失败
        JSEvent.emit(
          DataEvents.User.UserState_Relogin,
          Constants.ReloginState.ReloginFailed
        );
      }
      //错误，返回错误码
      return e;
    }
  }

  /**
   * firebase快速登录
   * @returns {Promise<{loginState:LoginState, imServerState:ErrorCodes}>} id--用户id，loginState--当前登录状态，详见{@link Constants.LoginState}
   * @throws {{type:LoginExceptionType, code:number, msg:string}}}
   */
  async firebaseQuickLogin(isReconnect = false) {
    if (auth().currentUser == null) {
      return { loginState: LoginState.Logout, imServerState: ErrorCodes.Timeout };
    }
    const token = await auth().currentUser.getIdToken();
    try {
      const device = LesConstants.IMDevices[DataCenter.deviceName];
      if (isReconnect) {
        JSEvent.emit(
          DataEvents.User.UserState_Relogin,
          Constants.ReloginState.ReloginStarted
        );
      }

      const result = await this.firebaseLogin(token);
      const { id, loginState, profile } = result;

      if (loginState == LoginState.Normal) {
        //登陆成功，连接im服务器
        try {
          const result = await LesPlatformCenter.Inst.connect(
            Constants.Address.IMServer,
            id,
            token,
            device,
            LoginChannel
          );

          //登陆成功
          const imUserInfo = {
            name: result.name,
            tag: result.tag,
            state: result.state,
          };

          //保存当前用户数据
          DataSavingService.Inst.saveLoginDataToDataCenter(
            id,
            "",
            "",
            imUserInfo,
            profile
          );

          //发送登陆成功事件
          if (isReconnect) {
            JSEvent.emit(
              DataEvents.User.UserState_Relogin,
              Constants.ReloginState.ReloginSuccessful
            );
          } else {
            JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
          }

        } catch (e) {
          return { loginState: loginState, imServerState: e };
        }
        return { loginState: loginState, imServerState: ErrorCodes.Success };
      } else {
        return { loginState: loginState, imServerState: ErrorCodes.Timeout };
      }
    } catch (e) {
      console.log("got exception: ", e);
      throw e;
    }
  }

  /**
   * 通过firebase的token登录
   * @param {string} userToken 
   * @returns {Promise<{id:number, loginState:LoginState, profile:UserProfile}>} id--用户id，loginState--当前登录状态，详见{@link Constants.LoginState}
   * @throws {{type:LoginExceptionType, code:number, msg:string}}}
   */
  async firebaseLogin(userToken) {
    const device = DataCenter.deviceName;
    try {
      const response = await Firebase.loginRequest(userToken, device);
      const data = response.data;
      if (data.code == 0) {
        const ret = data.retObject;
        return { id: ret.accountId, loginState: ret.loginState, profile: ret.profile }
      } else {
        throw {
          type: LoginExceptionType.AccountCenterError,
          code: data.code,
          msg: data.msg,
        };
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 用户请求发送邮箱验证码
   * @param {string} userToken 
   * @return {string} 验证码token
   */
  async firebaseRequestSendVaildCode(userToken) {
    try {
      const response = await Firebase.sendVerifyCodeRequest(userToken);
      const data = response.data;
      if (data.code == 0) {
        return data.msg;
      } else {
        throw {
          type: LoginExceptionType.VerificationError,
          code: data.code,
          msg: data.msg,
        };
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 
   * @param {number} accountId 用户id
   * @param {string} userToken firebase用户token
   * @param {string} codeToken 验证码token
   * @param {string} code 验证码
   * @returns {boolean} 验证结果
   */
  async firebaseRequestVerifyCode(accountId, userToken, codeToken, code) {
    try {
      const response = await Firebase.verifyCode(userToken, codeToken, code);
      const data = response.data;
      if (data.code == 0) {
        return data.msg == accountId;
      } else {
        throw {
          type: LoginExceptionType.VerificationError,
          code: data.code,
          msg: data.msg,
        };
      }
    } catch (e) {

    }
    return false;
  }

  /**
   * 设置用户推荐码，成功与否都进行下一步
   * @param {string} userToken firebase用户token
   * @param {string} referralCode 推荐码
   */
  async firebaseUpdateReferrer(userToken, referralCode) {
    try {
      const response = await Firebase.updateReferrer(userToken, referralCode);
      const data = response.data;
      return data.code;
    } catch (e) {

    }
    return -1;
  }

  /**
   * @deprecated
   * 旧的登录逻辑，废弃了
   * 使用用户名密码进行登录(旧的账号登陆)
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {{id:number,name:string,tag:number,state:IMUserState}}
   * @throws {{type:LoginExceptionType, code:number, msg:string}}}
   */
  async login(username, password) {
    const device = DataCenter.deviceName;
    try {
      //向accountCenter请求登陆
      const response = await loginRequest(username, password, device);
      const data = response.data;
      //accountCenter登陆成功
      if (data.code == 0) {
        const { accountId, msg } = data.retObject;
        try {
          const result = await LesPlatformCenter.Inst.connect(
            Constants.Address.IMServer,
            accountId,
            msg,
            LesConstants.IMDevices[device]
          );
          //登陆成功
          const imUserInfo = {
            name: result.name,
            tag: result.tag,
            state: result.state,
          };

          //保存登陆凭证
          const loginInfo = {
            id: accountId,
            token: msg,
            email: username,
            name: imUserInfo.name,
            tag: imUserInfo.tag,
          };
          this.#loginData.addLoginInfo(loginInfo);

          //保存当前用户数据
          DataSavingService.Inst.saveLoginDataToDataCenter(
            accountId,
            msg,
            username,
            imUserInfo
          );
          this.#saveLoginData();

          //发送登陆成功事件
          JSEvent.emit(DataEvents.User.UserState_IsLoggedin);
          return result;
        } catch (e) {
          throw { type: LoginExceptionType.IMServerError, code: e };
        }
      } else {
        throw {
          type: LoginExceptionType.AccountCenterError,
          code: data.code,
          msg: data.msg,
        };
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
      loginInfos: { ...this.#loginInfoMap },
    };
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
