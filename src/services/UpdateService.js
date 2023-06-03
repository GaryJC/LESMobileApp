import JSEvent from "../utils/JSEvent";
import { DataEvents, UIEvents } from "../modules/Events";
import FriendService from "./FriendService";

/*
  其他的服务在拉取数据时，发布一个pullData_started事件
  监听这个事件, 并发布一个UI事件告诉UI在读取数据，加载loading界面
  当其他的服务拉取数据结束时，发布一个pullData_finished事件
  监听这个事件，并发布一个UI结束事件告诉UI读取数据结束，关闭loading界面
*/

class UpdateService {
  static #inst;

  static get inst() {
    return UpdateService.#inst ?? new UpdateService();
  }

  constructor() {
    if (new.target !== UpdateService) return;
    if (UpdateService.#inst == null) {
      UpdateService.#inst = this;
    }
    return UpdateService.#inst;
  }

  // 监听pullData事件开始和结束的事件
  addPullDataStateListenter() {
    JSEvent.on(DataEvents.PullData.PullDataState_IsStarted, () =>
      JSEvent.emit(UIEvents.PullData.PullDataState_UILoading)
    );
    JSEvent.on(DataEvents.PullData.PullDataState_IsFinished, () =>
      JSEvent.emit(UIEvents.PullData.PullDataState_UINotLoading)
    );
  }

  init() {
    this.addPullDataStateListenter();
  }
}

export default UpdateService;
