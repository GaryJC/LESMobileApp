import API from "../modules/Api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { firebase } from "@react-native-firebase/auth";
import LoginService from "../services/LoginService";
import { NativeModules } from "react-native";
const { RNTwitterSignIn } = NativeModules;

const CHANNEL_FIREBASE = "Firebase";
const CHANNEL_DEFAULT = "Default";

const serviceId = (device) => `les-im-${device}`;

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

export const Firebase = {
  /**
   *
   * @param {userToken} token
   * @param {deviceId} device
   * @param {string} fcmToken
   * @returns
   */
  loginRequest: async (token, device, fcmToken) => {
    return await axios.post(API.loginRequestV2(), {
      username: token,
      password: "",
      channel: CHANNEL_FIREBASE,
      serviceId: serviceId(device),
      fcmToken: fcmToken,
    });
  },

  /**
   * 请求发送验证码邮件
   * @param {string} token
   * @returns
   */
  sendVerifyCodeRequest: async (token) => {
    return await axios.postForm(API.sendCodeRequest(), {
      firebaseToken: token,
    });
  },

  /**
   *
   * @param {string} firebaseToken
   * @param {string} verifyCodeToken
   * @param {string} code
   * @returns
   */
  verifyCode: async (firebaseToken, verifyCodeToken, code) => {
    return await axios.post(API.verifyCodeByToken(), {
      username: firebaseToken,
      token: verifyCodeToken,
      code: code,
    });
  },

  updateReferrer: async (firebaseToken, referralCode) => {
    return await axios.postForm(API.updateReferrer(), {
      firebaseToken: firebaseToken,
      referralCode: referralCode,
    });
  },

  googleSignin: async (navigation) => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential

      await auth().signInWithCredential(googleCredential);
      const { loginState, id, imServerState } =
        await LoginService.Inst.firebaseQuickLogin();
      navigation.navigate("VerifyEmail", { id, loginState, imServerState });
      // console.log("google result; ", result);
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  },

  twitterSignin: async (navigation) => {
    try {
      const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();
      const twitterCredential = auth.TwitterAuthProvider.credential(
        authToken,
        authTokenSecret
      );
      await auth().signInWithCredential(twitterCredential);
      const { loginState, id, imServerState } =
        await LoginService.Inst.firebaseQuickLogin();
      navigation.navigate("VerifyEmail", { id, loginState, imServerState });
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  },
};
