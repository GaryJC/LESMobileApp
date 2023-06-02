const Constants = {
  deliveryState: {
    delivered: 1,
    delivering: 2,
    deliveredyFailed: 3,
  },

  /**
   * 所有存入Secure Store的key
   */
  SecureStoreKeys: {
    LoginData: "LES_LoginData"
  },

  Address: {
    IMServer: "ws://15.222.78.167:19888/im/ws"
  },

  LoginExceptionType: {
    AccountCenterError: "AccountCenterError",
    IMServerError: "IMServerError"
  }

};

export default Constants;
