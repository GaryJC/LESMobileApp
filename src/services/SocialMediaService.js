import { LesConstants, LesPlatformCenter } from "les-im-components";
import { SocialMediaBindInfo } from "../Models/UserProfile";
import DataCenter from "../modules/DataCenter";

const { SocialType } = LesConstants;

export default class SocialMediaService {
    /**
     * @type {SocialMediaService}
     */
    static #inst;

    /**
     * @return {SocialMediaService}
     */
    static get Inst() {
        return SocialMediaService.#inst ?? new SocialMediaService();
    }

    /**
     * @type {"oauth1"|"oauth2"}
     */
    #twitterAuthMode = "oauth2";

    get TwitterAuthMode() {
        return this.#twitterAuthMode;
    }

    set TwitterAuthMode(mode) {
        this.#twitterAuthMode = mode;
    }

    constructor() {
        if (new.target !== SocialMediaService) return;
        if (SocialMediaService.#inst == null) {
            SocialMediaService.#inst = this;
        }
        return SocialMediaService.#inst;
    }

    /**
     * 返回指定社交媒体的绑定信息
     * @param {SocialType} socialMedia 
     * @returns {SocialMediaBindInfo}
     */
    getSocialMediaBindInfo(socialMedia) {
        const bind = DataCenter.userInfo.userProfile.getSocialMediaBindInfo(socialMedia);
        return bind;
    }

    getTwitterAuthLink(token) {
        if (this.#twitterAuthMode == "oauth1") {
            return "https://api.twitter.com/oauth/authorize?oauth_token=" + token
        } else if (this.#twitterAuthMode == "oauth2") {
            return token;
        }
    }

    getTwitterFollowLink(screenName) {
        return "https://twitter.com/intent/follow?screen_name=" + screenName
    }

    /**
     * 
     * @returns {Promise<{socialType:SocialType, oauthToken:string}>}
     */
    requestTwitterOauthToken() {
        const mediaType = this.#twitterAuthMode == "oauth1" ? SocialType.Twitter : SocialType.Twitter_Oauth2;
        return LesPlatformCenter.SocialMediaFunctions.requestOauthToken(mediaType);
    }

    /**
     * 
     * @param {string} oauthToken 
     * @param {string} tokenVerifier 
     * @returns {Promise<{retCode:number, socialType:SocialType, socialId:string, socialName:string}>}
     */
    requestTwitterConnect(oauthToken, tokenVerifier) {
        const mediaType = this.#twitterAuthMode == "oauth1" ? SocialType.Twitter : SocialType.Twitter_Oauth2;

        return LesPlatformCenter.SocialMediaFunctions
            .connectSocialMedia(mediaType, oauthToken, tokenVerifier)
    }

}