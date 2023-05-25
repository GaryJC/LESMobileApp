import API from "../modules/Api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

export const loginCheck = async (accountId, loginKey, serviceId) => {
  try {
    return await axios.get(API.loginCheck(), {
      params: {
        accountId: accountId,
        loginCheck: loginKey,
        serviceId: serviceId,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export async function saveData(key, value) {
  try {
    await SecureStore.setItemAsync(key, String(value));
  } catch (e) {
    console.log(e);
  }
}

export async function retrieveData(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.log("Error retrieving data", error);
  }
}
