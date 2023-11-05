import { LesConstants } from "les-im-components";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

const { SocialType } = LesConstants;

class SocialMediaBindInfo {
    /**
     * @type {number}
     */
    accountId;
    /**
     * @type {SocialType}
     */
    mediaType;
    /**
    * @type {string}
    */
    socialId;
    /**
     * @type {string}
     */
    socialName;
    /**
     * 绑定和解绑的时间戳
     * @type {number}
     */
    timestamp;

    /**
     * 账号重新绑定cd时间
     * @type {number}
     */
    reconnectCd;
    /**
     * 当前账号是否是连接状态
     * @type {boolean}
     */
    connect;
}
export default class UserProfile {
    /**
     * @type string
     */
    id;
    /**
     * @type string
     */
    username;
    /**
     * @type string
     */
    phone;
    /**
     * @type number
     */
    createTime;
    /**
     * @type string
     */
    referralCode;
    /**
     * @type string
     */
    email;

    /**
     * @type {string}
     */
    providerId;

    /**
     * @type string
     */
    displayName;
    /**
     * @type string
     * @deprecated 使用IMUserInfo中的Avatar
     */
    avatarUrl;
    /**
     * @type string[]
     */
    socialMediaAccounts;

    /**
     * @type {SocialMediaBindInfo[]}
     */
    socialMediaBindInfo = {};

    /**
     * 
     * @param {UserProfile} info 
     */
    update(p) {
        this.id = p.id;
        this.username = p.username;
        this.phone = p.phone;
        this.createTime = p.createTime;
        this.referralCode = p.referralCode;
        this.email = p.email;
        this.displayName = p.displayName;
        this.avatarUrl = p.avatarUrl;
        this.socialMediaAccounts = p.socialMediaAccounts;
        this.providerId = p.providerId;

        p.bindInfos.forEach(bind => {
            const bindInfo = new SocialMediaBindInfo();
            bindInfo.accountId = bind.accountId;
            bindInfo.connect = bind.connect;
            bindInfo.mediaType = SocialType[bind.mediaType];
            bindInfo.reconnectCd = bind.reconnectCd;
            bindInfo.socialId = bind.socialId;
            bindInfo.socialName = bind.socialName;
            bindInfo.timestamp = bind.timestamp;
            this.socialMediaBindInfo[bindInfo.mediaType] = bindInfo;
        })

    }

    /**
     * 
     * @param {SocialMediaBindInfo} bindInfo 
     */
    setSocialMedialBindInfo(bindInfo) {
        this.socialMediaBindInfo[bindInfo.mediaType] = bindInfo;
        JSEvent.emit(DataEvents.SocialMedia.SocialMedia_Bound, bindInfo);
    }

    /**
     * 
     * @param {SocialType} socialMediaType 
     */
    getSocialMediaBindInfo(socialMediaType) {
        return this.socialMediaBindInfo[socialMediaType];
    }

}

export { SocialMediaBindInfo }
