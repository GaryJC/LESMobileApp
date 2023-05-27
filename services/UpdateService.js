import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import FriendService from "./FriendService";

class UpdateService {
  static #inst;

  static get inst() {
    return UpdateService.#inst ?? new UpdateService();
  }

  constructor() {
    if (new.target !== UpdateService) return;
    if (!UpdateService.#inst) {
      UpdateService.#inst = this;
    }
    return UpdateService.#inst;
  }

  // 在哪里调用这个方法？在DataCenter里初始化吗？
  onPullDataUpdated() {
    // 如果成功监听到服务器发送的事件，通知UI渲染加载界面
    // if...
    JSEvent.emit(DataEvents.PullData.PullDataState_isStarted);
    // 如果监听到了好友状态的更新, 调用FriendService的方法进行数据拉取更新
    // if...
    // FriendService.inst.PullData(data);

    // 全部更新完毕后
    JSEvent.emit(DataEvents.PullData.PullDataState_isFinished);
  }

  addPullDataStateListenter() {
    // 监听pullData事件开始和结束的事件
    JSEvent.on(DataEvents.PullData.PullDataState_isStarted, () =>
      JSEvent.emit(UIEvents.PullData.PullDataState_UILoading)
    );
    JSEvent.on(DataEvents.PullData.PullDataState_isFinished, () =>
      JSEvent.emit(UIEvents.PullData.PullDataState_UINotLoading)
    );
  }

  init() {
    this.addPullDataStateListenter();
  }
}

export default UpdateService;
