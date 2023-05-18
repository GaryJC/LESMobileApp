import Friends from "../Models/Friends";

//登录成功后初始化所有用户相关的数据
const DataCenter = {
  // friendId, friendName, friendState, friendAvatar
  friendListData: [
    new Friends(1, "Tony", 0, "https://i.pravatar.cc"),
    new Friends(2, "Michael", 1, "https://i.pravatar.cc"),
    new Friends(3, "Bruce", 2, "https://i.pravatar.cc"),
    new Friends(4, "Peter", 2, "https://i.pravatar.cc"),
    new Friends(5, "Roy", 2, "https://i.pravatar.cc"),
    new Friends(6, "Devin", 0, "https://i.pravatar.cc"),
    new Friends(7, "Kevin", 1, "https://i.pravatar.cc"),
    new Friends(8, "Mike", 2, "https://i.pravatar.cc"),
    new Friends(9, "Jack", 2, "https://i.pravatar.cc"),
    new Friends(10, "Wendy", 2, "https://i.pravatar.cc"),
  ],
  getFriendListData() {
    this.friendListData = [];
  },
};

export default DataCenter;
