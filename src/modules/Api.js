//const accountURL = "https://acc.metavirus.games/";

import Constants from "./Constants";

const API = {
  account: Constants.Address.AccountServer + "account/",

  registerRequest: () => API.account + "registerRequest",
  verifyCode: () => API.account + "verifyCode",
  resendCode: () => API.account + "resendCode",
  loginRequest: () => API.account + "loginRequest",
  loginCheck: () => API.account + "loginCheck",
};

export default API;
