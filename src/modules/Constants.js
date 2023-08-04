const Address_Local = {
  IMServer: "ws://10.0.2.2:8888/im/ws",
  AccountServer: "http://10.0.2.2:18881/",
};

const Address_Production = {
  IMServer: "ws://15.222.78.167:19888/im/ws",
  AccountServer: "https://acc.metavirus.games/",
};

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

  Address: Address_Production,

  LoginExceptionType: {
    AccountCenterError: "AccountCenterError",
    IMServerError: "IMServerError",
  },

  Notification: {
    NotificationType: {
      Notifications: "Notifications",
      Invitations: "Invitations",
      SelfSent: "SelfSent",
    },

    NotificationMode: {
      Sender: "sender",
      Recipient: "recipient",
      SelfSentGroup: "SelfSentGroup",
    },
  },

  ChatListType: {
    Single: 0,
    Group: 1,
  },
};

export default Constants;
