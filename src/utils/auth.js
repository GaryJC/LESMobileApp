import API from "../modules/Api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const sendVerifyCodeRequest = async (email, password, referCode) => {
  return await axios.post(API.registerRequest(), {
    username: email,
    password: password,
    channel: "OFFICIAL-WEB",
    serviceId: "",
    referralCode: referCode,
  });
};

export const resendCodeRequest = async (email, token) => {
  return await axios.get(API.resendCode(), {
    params: {
      username: email,
      token: token,
    },
  });
};

export const signupRequest = async (email, token, code) => {
  return await axios.post(API.verifyCode(), {
    username: email,
    token: token,
    code: code,
  });
};

export const loginRequest = async (email, password, serviceId) => {
  return await axios.post(API.loginRequest(), {
    username: email,
    password: password,
    channel: "les-platform-im",
    serviceId: "les-im-" + serviceId,
  });
};

export const loginCheck = async (accountId, loginKey, serviceId) => {
  return await axios.get(API.loginCheck(), {
    params: {
      accountId: accountId,
      loginKey: loginKey,
      // serviceId: LesConstants.IMDevices[serviceId],
      serviceId: "les-im-" + serviceId,
    },
  });
};

export async function saveData(key, value) {
  try {
    await SecureStore.setItemAsync(key, String(value));
  } catch (e) {
    // console.log(e);
    throw e;
  }
}

export async function retrieveData(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    // console.log("Error retrieving data", error)
    throw e;
  }
}
