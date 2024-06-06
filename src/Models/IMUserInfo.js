import { LesConstants } from "les-im-components";
const { IMUserState, IMUserOnlineState, SocialType } = LesConstants;

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
    gameState;
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
     * @param {string} avatar
     * @param {IMUserState} state 
     * @param {IMUserOnlineState} onlineState 
     * @param {number} gameState
     */
    constructor(id, name, tag, avatar, state, onlineState, gameState) {
        this.id = id;
        this.name = name;
        this.tag = tag;
        this.state = state;
        this.avatar = avatar;
        this.onlineState = onlineState;
        this.gameState = gameState;
    }

    get fullName() {
        return `${this.name} #${this.tag}`
    }


    toString() {
        return `[${this.id}]${this.fullName}  state[${StateToStr[this.state]}] online[${OnlineToStr[this.onlineState]}] avatar[${this.avatar}] gameState[${(this.gameState >> 16) & 0xFFFF} --> ${this.gameState & 0xFFFF}]`
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


    changeGameState(gameState) {
        if (gameState != this.gameState) {
            this.gameState = gameState;
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

    changeAvatar(avatar) {
        if (this.avatar != avatar) {
            this.avatar = avatar;
            return true;
        }
        return false;
    }

}

class IMUserProfile {
    /**
     * @type {IMUserInfo}
     */
    userInfo;

    /**
     * @type { Map<SocialType,string > }
     */
    links;
}

export { IMUserProfile }