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
  
  twitterGetToken: () => API.twitter +"get_token_sec"
};

export default API;
