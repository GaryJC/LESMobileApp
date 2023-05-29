/*
    监听login成功事件
    读取sqlite重建datacenter缓存
    
    将从各服务收到的数据写进sqlite和datacenter
    发布对应的数据更新事件（）
        从各个服务监听数据更新事件？还是在这里集中调用所有的IMListener回调》

    和其他服务一样，也要发布拉取数据事件，加载loading界面
*/

/*
    JSEvent.on(DataEvents.Friend.FriendState_Updated, handler);
*/
