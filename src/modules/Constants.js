const Address_Local = {
  IMServer: "ws://10.0.0.173:8888/im/ws",
  AccountServer: "http://10.0.0.173:18881/",
  WalletAddress: "http://10.0.0.173:3001",
  ResServer: "https://res.nexgami.com",
};

const Address_Public_Test = {
  IMServer: "ws://15.222.78.167:19888/im/ws",
  AccountServer: "https://acc-test.metavirus.games/",
  WalletAddress: "https://release-test.dao88movsiygm.amplifyapp.com/login",
  ResServer: "https://res.nexgami.com",
};

const Address_Production = {
  IMServer: "ws://3.98.76.182:19888/im/ws",
  AccountServer: "https://acc.metavirus.games/",
  WalletAddress: "http://wallet.metavirus.games",
  ResServer: "https://res.nexgami.com",
};

const AddressOverride = Address_Public_Test;

const Constants = {
  /**
   * 使用 29 组分隔符 做为聊天信息和quote信息的分隔符
   */
  quoteDelimiter: String.fromCharCode(29),

  /**
   * 将聊天内容分离成message和quote两部分
   * @param {string} content
   * @return {message:string, quote:string}
   */
  splitContent: (content) => {
    if (content == null) {
      return { message: "", quote: "" };
    }
    const arr = content.split(Constants.quoteDelimiter);
    if (arr.length <= 1) {
      return { message: content, quote: "" };
    } else {
      return { message: arr[0], quote: arr[1] };
    }
  },

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
    RegisteredWithTwitter: "twitter.com",
    Unchecked: "Unchecked",
  },

  /**
   * 所有存入Secure Store的key
   */
  SecureStoreKeys: {
    LoginData: "LES_LoginData",
  },

  Address:
    AddressOverride != null
      ? AddressOverride
      : process.env.NODE_ENV == "production"
        ? Address_Production
        : Address_Public_Test,

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

    ResponseType: {
      Decline: "Decline",
      Cancel: "Cancel",
      Accept: "Accept",
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

  SocialTabButtonType: {
    Friends: "Friends",
    Groups: "Groups",
  },

  Icons: {
    nexgamiIcon: require("../../assets/img/icon-nexgami.png"),
    telegramIcon: require("../../assets/img/telegram_icon.png"),
    twitterIcon: require("../../assets/img/twitter_X.png"),
    discordIcon: require("../../assets/img/discord_icon.png"),

    /**
     * 根据类型获取系统图标, -1是NexGami,-2是QuestSystem
     * 1 = Discord, 2=Telegram, 3=Twitter (这部分值和LesConstants.SocialType匹配)
     * @param {-1|-2|1|2|3|"nexgami"|"quest"|"telegram"|"twitter"|"discord"} type 图标ID或者名称
     */
    getSystemIcon: (type) => {
      const icons = Constants.Icons;
      switch (type) {
        case -1:
        case "nexgami":
          return icons.nexgamiIcon;
        case -2:
        case "quest":
          return icons.nexgamiIcon;
        case 1:
        case "discord":
          return icons.discordIcon;
        case 2:
        case "telegram":
          return icons.telegramIcon;
        case 3:
        case "twitter":
          return icons.twitterIcon;
        default:
          return icons.nexgamiIcon;
      }
    }

  }

};

console.log(
  `=======Using Address: ${JSON.stringify(Constants.Address)}========`
);

export default Constants;
