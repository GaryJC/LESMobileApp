import API from "../modules/Api";
import axios from "axios";

export const sendVerifyCodeRequest = async (email, password, referCode) => {
  try {
    return await axios.post(API.registerRequest(), {
      username: email,
      password: password,
      channel: "OFFICIAL-WEB",
      serviceId: "",
      referralCode: referCode,
    });
  } catch (e) {
    console.log(e);
  }
};

export const resendCodeRequest = async (email, token) => {
  try {
    return await axios.get(API.resendCode(), {
      params: {
        username: email,
        token: token,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export const signupRequest = async (email, token, code) => {
  try {
    return await axios.post(API.verifyCode(), {
      username: email,
      token: token,
      code: code,
    });
  } catch (e) {
    console.log(e);
  }
};

export const loginRequest = async (email, password) => {
  try {
    return await axios.post(API.loginRequest(), {
      username: email,
      password: password,
      channel: "OFFICIAL-WEB",
      serviceId: "",
    });
  } catch (e) {
    console.log(e);
  }
};
