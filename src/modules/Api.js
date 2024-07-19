//const accountURL = "https://acc.metavirus.games/";

import Constants from "./Constants";

const { Address } = Constants;

const API = {
  account: Address.AccountServer + "account/",
  twitter: Address.AccountServer + "oauth/twitter/",

  registerRequest: () => API.account + "registerRequest",
  verifyCode: () => API.account + "verifyCode",
  resendCode: () => API.account + "resendCode",
  loginRequest: () => API.account + "loginRequest",
  loginRequestV2: () => API.account + "loginRequestV2",
  loginCheck: () => API.account + "loginCheck",
  sendCodeRequest: () => API.account + "requestSendCode",
  verifyCodeByToken: () => API.account + "verifyCodeByToken",
  updateReferrer: () => API.account + "updateReferrer",
  approveServiceLogin: () => API.account + "approveServiceLogin",

  twitterGetToken: () => API.twitter + "get_token",

  headerIndex: () => Address.ResServer + "/headers/index",
  headerUrl: (header) => Address.ResServer + "/headers/" + header,

  fetchImage: (name) => `${Address.ResServer}/platform/${name}`,

  Game: {
    getGameList: () => `${Address.PlatformServer}/game/list`,

    getSpecificGame: (id) => `${Address.PlatformServer}/game/${id}`,

    getPromotion: () => `${Address.PlatformServer}/game/promotion`,

    getFilterOption: () => `${Address.PlatformServer}/game/filter`,
  },

  Launchpad: {
    fetchImage: (name) => `${Address.ResServer}/platform/launchpads/${name}`,

    getLaunchpadList: (queryAndStatus) =>
      `${Address.PlatformServer}/launchpad/list?${queryAndStatus}`,

    getSpecificLaunchpad: (id) => `${Address.PlatformServer}/launchpad/${id}`,
  },

  News: {
    getNewsList: (genre) =>
      `${Address.PlatformServer}/news/list?genre=${genre}`,

    getSpecificNews: (id) => `${Address.PlatformServer}/news/${id}`,

    getGameNews: (id) => `${Address.PlatformServer}/news/game?id=${id}`,
  },
};

export default API;
