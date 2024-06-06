//const accountURL = "https://acc.metavirus.games/";

import Constants from "./Constants";

const API = {
  account: Constants.Address.AccountServer + "account/",
  twitter: Constants.Address.AccountServer + "oauth/twitter/",

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

  headerIndex: () => Constants.Address.ResServer + "/headers/index",
  headerUrl: (header) => Constants.Address.ResServer + "/headers/" + header,
};

export default API;
