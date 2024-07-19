import ExpoConstants from "expo-constants";

const Address_Local = {
  IMServer: "ws://10.0.0.173:8888/im/ws",
  AccountServer: "http://10.0.0.173:18881/",
  WalletAddress: "http://10.0.0.173:3001",
  ResServer: "https://res.nexgami.com",
  PlatformServer: "https://platform-test.nexgami.com/api/v1",
};

const Address_Public_Test = {
  IMServer:
    "ws://lb-nq58eno0-0xb78t4k5fsu3qzy.clb.na-siliconvalley.tencentclb.com:19989/im/ws",
  AccountServer: "https://acc-test.metavirus.games/",
  WalletAddress: "https://release-test.dao88movsiygm.amplifyapp.com",
  ResServer: "https://res.nexgami.com",
  PlatformServer: "https://platform-test.nexgami.com/api/v1",
};

const Address_Production = {
  IMServer:
    "ws://lb-nq58eno0-0xb78t4k5fsu3qzy.clb.na-siliconvalley.tencentclb.com:19888/im/ws",
  AccountServer: "https://acc.metavirus.games/",
  WalletAddress: "http://wallet.metavirus.games",
  ResServer: "https://res.nexgami.com",
  PlatformServer: "https://platform-test.nexgami.com/api/v1",
};

const AddressOverride = Address_Production;
console.log("============", process.env, ExpoConstants.expoConfig.appMode);

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
      ? ExpoConstants.expoConfig.appMode == "preview"
        ? Address_Public_Test
        : Address_Production
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
    googleIcon: require("../../assets/img/google.png"),
    nexgamiIcon: require("../../assets/img/icon-nexgami.png"),
    telegramIcon: require("../../assets/img/telegram_icon.png"),
    twitterIcon: require("../../assets/img/twitter_X.png"),
    discordIcon: require("../../assets/img/discord_icon.png"),
    metavirusIcon: require("../../assets/img/metavirus-icon.png"),
    appleIcon: require("../../assets/img/apple_icon.png"),
    metamythIcon: require("../../assets/img/metamyth-icon.png"),

    /**
     * 根据类型获取系统图标, -1是NexGami,-2是QuestSystem
     * 1 = Discord, 2=Telegram, 3=Twitter (这部分值和LesConstants.SocialType匹配)
     * @param {-1|-2|1|2|3|"nexgami"|"quest"|"telegram"|"twitter"|"discord"|"google"|"metavirus"} type 图标ID或者名称
     */
    getSystemIcon: (type, defaultValue = Constants.Icons.nexgamiIcon) => {
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
        case "apple":
          return icons.appleIcon;
        case "google":
          return icons.googleIcon;
        case "metavirus":
          return icons.metavirusIcon;
        case "metamyth":
          return icons.metamythIcon;
        default:
          return defaultValue;
      }
    },

    getProviderIcon: (providerId) => {
      let providerIcon = "";
      switch (providerId) {
        case "google.com":
          providerIcon = "google";
          break;
        case "twitter.com":
          providerIcon = "twitter";
          break;
        case "apple.com":
          providerIcon = "apple";
          break;
        default:
          providerIcon = "nexgami";
          break;
      }

      return Constants.Icons.getSystemIcon(providerIcon);
    },
  },

  SocialId: {
    Website: 0,
    Discord: 1,
    Telegram: 2,
    Twitter: 3,
  },

  PlatformId: {
    IOS: 1,
    Android: 2,
    PCWIN: 3,
    Web: 4,
    Mac: 5,
  },

  ChainID: {
    Eth: 1,
    Polygon: 2,
    Avalanche: 3,
    BNB: 4,
  },

  News: {
    Genre: {
      News: 1,
      Guide: 2,
    },
  },

  Launchpad: {
    Genre: {
      Token: 1,
      NFT: 2,
    },
    IDOStatus: {
      Upcoming: 1,
      Ended: 2,
      Opening: 3,
    },
    SwappableCoins: {
      USDC: 1,
      USDT: 2,
      NEXG: 3,
      NEXU: 4,
    },
  },
};

console.log(
  `=======Using Address: ${JSON.stringify(Constants.Address)}========`
);

export default Constants;
