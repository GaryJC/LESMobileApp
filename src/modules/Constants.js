const Address_Local = {
  IMServer: "ws://localhost:8888/im/ws",
  AccountServer: "http://localhost:18881/",
  WalletAddress: "http://localhost:3001"
};

const Address_Public_Test = {
  IMServer: "ws://15.222.78.167:19888/im/ws",
  AccountServer: "https://acc-test.metavirus.games/",
  WalletAddress: "https://release-test.dao88movsiygm.amplifyapp.com/login"
};

const Address_Production = {
  IMServer: "ws://15.222.78.167:19888/im/ws",
  AccountServer: "https://acc.metavirus.games/",
  WalletAddress: "http://wallet.metavirus.games"
};

const AddressOverride = null;

const Constants = {
  deliveryState: {
    delivered: 1,
    delivering: 2,
    deliveredyFailed: 3,
  },

  LoginState: {
    /**
     * 未登录
     */
    Logout: -1,
    /**
     * 正常登陆
     */
    Normal: 0,
    /**
     * 需要验证邮箱
     */
    VerifyEmail: 1,
    /**
     * 需要设置推荐人
     */
    UpdateReferrer: 2,
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

  EmailState: {
    Registered: "password",
    UnRegistered: undefined,
    RegisteredWithGoogle: "google.com",
    Unchecked: "Unchecked",
  },

  /**
   * 所有存入Secure Store的key
   */
  SecureStoreKeys: {
    LoginData: "LES_LoginData",
  },

  Address: AddressOverride != null ? AddressOverride : (process.env.NODE_ENV == "production" ? Address_Production : Address_Public_Test),

  LoginExceptionType: {
    AccountCenterError: "AccountCenterError",
    IMServerError: "IMServerError",
    VerificationError: "VerificationError",
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

  SigninButtonType: {
    Twitter: 0,
    Google: 1,
    Email: 2,
  },
};

export default Constants;
