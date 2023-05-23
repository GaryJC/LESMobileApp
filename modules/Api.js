const accountURL = "https://acc.metavirus.games/";

const API = {
  account: accountURL + "account/",

  registerRequest: () => API.account + "registerRequest",
  verifyCode: () => API.account + "verifyCode",
  resendCode: () => API.account + "resendCode",
  loginRequest: () => API.account + "loginRequest",
  tokenCheck: () => API.account + "loginCheck",
};

export default API;
