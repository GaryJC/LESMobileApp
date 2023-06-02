export const DataEvents = {
  /**
   * 拉取数据的状态更新
   */
  PullData: {
    PullDataState_IsStarted: "DATA_EVENT_PullData_IsStarted",
    PullDataState_IsFinished: "DATA_EVENT_PullData_IsFinished",
  },

  /**
   * 用户登录状态更新（已登陆）
   * 无携带参数
   */
  User: {
    UserState_IsLoggedin: "DATA_EVENT_UserState_IsLoggedin",
  },

  /**
   * 好友状态数据更新
   * 携带参数为 {id: 好友id, status:当前状态}
   */
  Friend: {
    FriendState_Updated: "DATA_EVENT_FriendState_Updated",
  },

  /**
   * 消息状态数据更新
   * 携带参数为 PBLesIMTimelineData
   */
  Message: {
    MessageState_Sent: "DATA_EVENT_MessageState_Sent",
    TimelineState_Updated: "DATA_EVENT_Message_Received",
  },

  /**
   * 通知状态数据更新
   * 携带参数为 LesIMUserNotificationData
   */
  Notification: {
    NotificationState_Invoked: "DATA_EVENT_NotificationState_Invoked",
  },

  /**
   * 存储数据更新
   * 携带参数为 PBLesIMTimelineData
   */
  Saving: {
    SavingState_Message: "DATA_EVENT_SavingState_Message",
  },
};

export const UIEvents = {
  /**
   * 好友状态UI更新
   * 无携带参数
   */
  Friend: {
    FriendState_UIRefresh: "UI_EVENT_FriendState_UIRefresh",
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
   * 消息UI更新
   * 携带参数为 PBLesIMTimelineData
   */
  Message: {
    MessageState_UIRefresh: "UI_EVENT_MessageState_UIRefresh",
  },
};
