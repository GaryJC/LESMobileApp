export const DataEvents = {
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
};
