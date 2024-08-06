import { LesConstants } from "les-im-components";
import { AppStateStatus } from "react-native";
import ChatGroup from "../Models/ChatGroup";
import FriendData from "../Models/Friends";
import MessageData from "../Models/MessageData";
import Constants from "./Constants";
const { IMUserState, IMUserOnlineState, IMMessageType, SocialType } =
  LesConstants;
const { ReloginState } = Constants;
export const DataEvents = {
  /**
   * 拉取数据的状态更新
   */
  PullData: {
    PullDataState_IsStarted: "DATA_EVENT_PullData_IsStarted",
    PullDataState_IsFinished: "DATA_EVENT_PullData_IsFinished",
  },

  User: {
    /**
     * 用户重登陆成功
     * 携带参数 {ReloginState}
     * @type {ReloginState}
     */
    UserState_Relogin: "DATA_EVENT_UserState_Relogin",

    /**
     * 用户成功登陆IM服务器以后
     *
     * 调用顺序
     * UserState_LoginIm -> UserState_DataReady -> UserState_IsLoggedin
     */
    UserState_LoginIm: "DATA_EVENT_UserState_LoginIm",
    /**
     * 用户登陆im服务器成功后，且数据库已准备好，会发送这个事件
     * 需要登陆且同时需要数据库数据的服务，监听这个事件
     */
    UserState_DataReady: "DATA_EVENT_UserState_DataReady",

    /**
     * 用户登录状态更新（已登陆），且service都已调用过onUserLogin
     * 无携带参数
     *
     */
    UserState_IsLoggedin: "DATA_EVENT_UserState_IsLoggedin",

    /**
     * 用户状态变化事件
     * @type {{id:number, state:IMUserState, onlineState:IMUserOnlineState, avatar:string, gameState:number}}
     * 用户的详细数据，可通过IMUserInfoService.getUser(id)获取
     */
    UserState_Changed: "DATA_EVENT_UserState_Changed",

    /**
     * 当前用户数据变化，例如改了名字，改了上下线状态等等
     * @type {info:IMUserInfo}
     */
    UserInfo_Current_Updated: "DATA_EVENT_UserInfo_Current_Updated",

    /**
     * 任务用户数据发生变化
     * 无数据，自行到DataCenter.userInfo.questUserInfo获取
     */
    QuestUser_Updated: "DATA_EVENT_QuestUser_Updated",
  },

  /**
   * @deprecated 这个事件废弃了，使用UserState_Changed事件监听用户状态变化 
  
    好友状态数据更新
    携带参数为 {id: 好友id, status:当前状态}
  */
  Friend: {
    FriendState_Updated: "DATA_EVENT_FriendState_Updated",
  },

  Message: {
    /**
     * 消息被投递后事件
     * @type {MessageData}
     */
    MessageState_Sent: "DATA_EVENT_MessageState_Sent",
    /**
     * 收到新的timelineData事件
     * 携带参数为 MessageData
     * @type {MessageData}
     */
    TimelineState_Updated: "DATA_EVENT_Message_Updated",

    /**
     * 本地timelineId更新事件
     *
     * 携带参数为 latestTimelineId
     * @type {number}
     */
    TimelineId_Updated: "DATA_EVENT_TimelineId_Updated",
  },

  /**
   * 通知状态数据更新
   * 携带参数为 LesIMUserNotificationData
   */
  Notification: {
    NotificationState_Invoked: "DATA_EVENT_NotificationState_Invoked",

    /**
     * 通知消息有更新时发出
     *
     * 携带数据为变更的通知消息
     *
     * @type {Notification}
     */
    NotificationState_Updated: "DATA_EVENT_NotificationState_Updated",
  },

  ChatGroup: {
    /**
     * 加入群，或者新建群聊成功后，会发送此事件，携带参数类型为ChatGroup，需要注意的是，此事的ChatGroup中可能只包含ID，没有名字，需要监听ChatGroup_Updated事件更新
     *
     * @type {ChatGroup}
     */
    ChatGroup_New: "DATA_EVENT_ChatGroup_OnNewChatGroup",

    /**
     * 群数据更新后，会发送此事件
     */
    ChatGroup_Updated: "DATA_EVENT_ChatGroup_ChatGroup_Updated",

    /**
     * 被移出群聊
     * @type {groupId:number}
     */
    ChatGroup_RemovedFromGroup:
      "DATA_EVENT_ChatGroup_ChatGroup_RemovedFromGroup",
  },

  SocialMedia: {
    /**
     * 绑定了社交媒体
     * @type {bindInfo:SocialMediaBindInfo}
     */
    SocialMedia_Bound: "DATA_EVENT_SocialMedia_Bound",
    /**
     * 解绑了社交媒体
     * @type {socialType:SocialType}
     */
    SocialMedia_Unbound: "DATA_EVENT_SocialMedia_Unbound",
  },

  Saving: {
    /**
     * @deprecated 暂时不用了
     * 存储数据更新
     * 携带参数为 PBLesIMTimelineData
     */
    SavingState_Message: "DATA_EVENT_SavingState_Message",
  },

  Staking: {
    StakingState_Updated: "EVENT_StakingState_Updated",
  },
};

export const UIEvents = {
  /**
   * 好友状态UI更新
   * 无携带参数
   */
  Friend: {
    FriendState_UIRefresh: "UI_EVENT_FriendState_UIRefresh",
    /**
     * @type {{friendInfo:FriendData}}
     */
    PopupFriendBottomSheet: "UI_EVENT_PopupFriendBottomSheet",
  },

  /**
   * 拉取数据时的加载页面
   * 无携带参数
   */
  PullData: {
    PullDataState_UILoading: "UI_EVENT_PullDataState_UILoading",
    PullDataState_UINotLoading: "UI_EVENT_PullDataState_UIIsNotLoading",
  },

  /**
   * App的状态发生改变时加载loading bar UI
   * 携带参数为 fromState, state
   * @type {AppStateStatus} state
   */
  AppState_UIUpdated: "UI_EVENT_AppState_UIUpdated",

  User: {
    /**
     * 好有状态更新时刷新UI
     * @type {{id: number, state: IMUserState, onlineState:IMUserOnlineState}}
     */
    UserState_UIRefresh: "UI_EVENT_UserState_UIRefresh",
    /**
     * 从用户列表进入聊天
     * 携带参数为目标的chatId, targetId, IMMessageType
     * @type {{chatId:string, targetId:number ｜ null, type: null | IMMessageType}}
     */
    User_Click_Chat_Updated: "UI_EVENT_User_Click_Chat_Updated",

    UserState_IsLoggedin: "UI_EVENT_UserState_IsLoggedin",
  },

  Message: {
    /**
     * 消息UI更新
     * 携带参数为 PBLesIMTimelineData
     *
     * 目前这个不用了
     */
    MessageState_UIRefresh: "UI_EVENT_MessageState_UIRefresh",

    /**
     * 通知UI，指定对话有数据更新
     * 携带参数为数据有更新的对话id
     *
     * UI部分监听这个消息，如果对应的对话id为开启状态，则更新对话的状态
     *
     * @type {{chatId: string, msgData: MessageData}}
     */
    Message_Chat_Updated: "UI_EVENT_Message_Chat_Updated",

    /**
     * 通知UI，对话列表数据有更新
     * 携带参数为数据有更新的对话id，为空则表示全部更新, action为delete时代表当前聊天被删除，为空表示更新
     * 收到事件后去DataCenter.messageCache获取最新的列表
     * @type {{chatId: string | null, action:string | null}}
     */
    Message_Chat_List_Updated: "UI_EVENT_Message_Chat_List_Updated",

    /**
     * 通知UI, 对话列表项被删除
     * 包括群组聊天项和私人聊天项
     * 发送事件通常伴随着从缓存和数据库删除数据
     * @type {{chatId: string | groupId: string}}
     */
    Message_Chat_List_Removed: "UI_EVENT_Message_Chat_List_Removed",

    /**
     * 点击聊天记录后通知UI,指定对话有数据更新
     * 携带参数为对话Id, 聊天目标Id, 聊天数据
     *
     * @type {{chatId: string, targetId: number, data: MessageData[]}}
     */
    Message_Search_Updated: "UI_EVENT_Message_Search_Updated",

    /**
     * 新消息数量变化通知事件
     *
     * @type {{chatId:string, currCount:number}}
     */
    Message_New_Count_Changed: "UI_EVENT_Message_New_Count_Changed",
  },

  ChatGroup: {
    /**
     *  移除群组里的成员后通知UI，成员列表有更新
     *  无携带参数
     */
    ChatGroup_RemoveMember: "UI_EVENT_ChatGroup_ChatGroup_RemoveMember",

    /**
     * 当群组用户的数据更新时，例如用户接受了群组邀请以后，通知UI
     */
    ChatGroup_GroupMember_Updated: "UI_EVENT_ChatGroup_GroupInfo_Updated",
  },

  Drawer: {
    Drawer_Open: "UI_EVENT_Drawer_Open",
  },
};
