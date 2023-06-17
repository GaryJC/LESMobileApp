const Constants = {
  deliveryState: {
    delivered: 1,
    delivering: 2,
    deliveredyFailed: 3,
  },

  ReloginState: {
    /**
     * 开始尝试重新登陆
     */
    ReloginStarted: 1,
    /**
     * 重新登陆成功
     */
    ReloginSuccessful: 2,
    /**
     * 重新登陆失败
     */
    ReloginFailed: 3,
  },

  /**
   * 所有存入Secure Store的key
   */
  SecureStoreKeys: {
    LoginData: "LES_LoginData",
  },

  Address: {
    IMServer: "ws://15.222.78.167:19888/im/ws",
  },

  LoginExceptionType: {
    AccountCenterError: "AccountCenterError",
    IMServerError: "IMServerError",
  },

  NotificationTab: {
    Notification: "Notification",
    Invitation: "Invitation",
  },
};

export default Constants;
