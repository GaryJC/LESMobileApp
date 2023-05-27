export const DataEvents = {
  /*
    拉取数据的状态更新
  */
  PullData: {
    PullDataState_isStarted: "DATA_EVENT_PullData_isStarted",
    PullDataState_isFinished: "DATA_EVENT_PullData_isFinished",
  },

  /*
    用户登录状态更新（已登陆）
    无携带参数
  */
  User: {
    UserState_isLoggedin: "DATA_EVENT_UserState_isLoggedin",
  },

  /* 
    好友状态数据更新
    携带参数为 {id: 好友id, status:当前状态}
  */
  Friend: {
    FriendState_Updated: "DATA_EVENT_FriendState_Updated",
  },
};

export const UIEvents = {
  /* 
    好友状态UI更新
    无携带参数
  */
  Friend: {
    FriendState_UIRefresh: "UI_EVENT_FriendState_UIRefresh",
  },

  /*
    拉取数据时的加载页面
    无携带参数
  */
  PullData: {
    PullDataState_UILoading: "UI_EVENT_PullDataState_UILoading",
    PullDataState_UINotLoading: "UI_EVENT_PullDataState_UIIsNotLoading",
  },
};
