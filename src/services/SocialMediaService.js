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
    const bind =
      DataCenter.userInfo.userProfile.getSocialMediaBindInfo(socialMedia);
    return bind;
  }

  getTwitterAuthLink(token) {
    if (this.#twitterAuthMode == "oauth1") {
      return this.getTwiterAuth1Link(token);
    } else if (this.#twitterAuthMode == "oauth2") {
      return token;
    }
  }

  getTwitterAuth1Link(token) {
    return "https://api.twitter.com/oauth/authorize?oauth_token=" + token;
  }

  getTwitterFollowLink(screenName, scheme = false) {
    if (scheme) {
      return "twitter://user?screen_name=" + screenName;
    }
    return "https://twitter.com/intent/user?screen_name=" + screenName;
  }

  getTwitterRetweetLink(twitterId, scheme = false) {
    if (scheme) {
      return "twitter://status?id=" + twitterId;
    } else {
      return "https://twitter.com/intent/retweet?tweet_id=" + twitterId;
    }
  }

  getTwitterQuoteLink(twitterId, twitterPosterName, post) {
    const p = `${post} https://twitter.com/${twitterPosterName}/status/${twitterId}`;
    const text = encodeURI(p)
    return "https://twitter.com/intent/tweet?text=" + text;
  }
  /**
   * 
   * @returns {Promise<{socialType:SocialType, oauthToken:string}>}
   */
  requestTwitterOauthToken() {
    const mediaType = this.#twitterAuthMode == "oauth1" ? SocialType.Twitter : SocialType.Twitter_OAuth2;
    return LesPlatformCenter.SocialMediaFunctions.requestOauthToken(mediaType);
  }

  /**
   * 
   * @param {string} oauthToken 
   * @param {string} tokenVerifier 
   * @returns {Promise<{retCode:number, socialType:SocialType, socialId:string, socialName:string}>}
   */
  requestTwitterConnect(oauthToken, tokenVerifier) {
    const mediaType = this.#twitterAuthMode == "oauth1" ? SocialType.Twitter : SocialType.Twitter_OAuth2;

    return LesPlatformCenter.SocialMediaFunctions
      .connectSocialMedia(mediaType, oauthToken, tokenVerifier)
  }

  requestDiscordOauthToken() {
    return LesPlatformCenter.SocialMediaFunctions.requestOauthToken(SocialType.Discord);
  }

  requestDiscordConnect(oauthToken, tokenVerifier) {
    return LesPlatformCenter.SocialMediaFunctions
      .connectSocialMedia(SocialType.Discord, oauthToken, tokenVerifier)
  }

}