import { LesConstants } from "les-im-components";
const { IMUserState, IMUserOnlineState } = LesConstants;

const StateToStr = {
    0: "Init",
    1: "Online",
    2: "Busy",
    3: "Away",
    4: "Hiding"
}

const OnlineToStr = {
    0: "Offline",
    1: "Online",
    2: "MobileBackground",
    3: "MobileOnline"

}

export default class IMUserInfo {
    id;
    name;
    tag;
    state;
    onlineState;
    bgImage;
    avatar;

    get isOnline() {
        return this.onlineState != IMUserOnlineState.Offline;
    }
    /**
     * 
     * @param {number} id 用户id
     * @param {string} name 用户昵称
     * @param {number} tag 识别tag
     * @param {IMUserState} state 
     * @param {IMUserOnlineState} onlineState 
     */
    constructor(id, name, tag, state, onlineState) {
        this.id = id;
        this.name = name;
        this.tag = tag;
        this.state = state;
        this.onlineState = onlineState;
    }

    get fullName() {
        return `${this.name} #${this.tag}`
    }


    toString() {
        return `[${this.id}]${this.fullName}  state[${StateToStr[this.state]}] online[${OnlineToStr[this.onlineState]}]`
    }

    /**
     * 更新用户昵称和tag
     * @param {string} name name
     * @param {number} tag tag
     */
    updateName(name, tag) {
        if (this.name != name || this.tag != tag) {
            this.name = name;
            this.tag = tag;
            return true;
        }
        return false;
    }

    /**
     * 改变状态
     * @param {IMUserState} state 
     */
    changeState(state) {
        if (state != this.state) {
            this.state = state;
            return true;
        }
        return false;
    }
    /**
     * 改变在线状态
     * @param {IMUserOnlineState} state 
     */
    changeOnlineState(onlineState) {
        if (this.onlineState != onlineState) {
            this.onlineState = onlineState;
            return true;
        }
        return false;
    }

}