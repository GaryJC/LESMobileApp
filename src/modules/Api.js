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

  Web3Api: {
    getMyVestings: (address) =>
      `${Address.PlatformServer}/web3/token_vesting/${address}`,
    getStakingList: () => `${Address.PlatformServer}/web3/token_staking_list`,
    getTokenList: () => `${Address.PlatformServer}/web3/token_list`,
    getUserStakingInfo: (address, chainId, contract) =>
      `${Address.PlatformServer}/web3/staking?address=${address}&chainId=${chainId}&contract=${contract}`,
  },

  PaypalApi: {
    createOrder: (userId, chainId, productName, price) =>
      `${Address.PlatformServer}/paypal/create_order?user_id=${userId}&chain_id=${chainId}&product_name=${productName}&price=${price}`,
    confirmOrder: (orderId) =>
      `${Address.PlatformServer}/paypal/confirm_order?order_id=${orderId}`,
  },

  /**
   *
   * @param {string} api api url
   * @param {object} params optional, 同fetch的第二个参数，包含method, header, body等等
   * @param {number | boolean} revalidateTime 重新认证缓存时间，可设置为null, false
   * @returns
   */
  fetchWithRevalidate: async (api, params = {}, revalidateTime = 3600) => {
    try {
      const response = await fetch(api, {
        ...params,
        next: { revalidate: revalidateTime },
      });
      const res = await response.json();

      if (res.code == 0) {
        return res.data;
      } else {
        throw new Error(`API Error: ${res.msg}`);
      }
    } catch (e) {
      console.error(e);
      throw new Error(`Fetch failed: ${e}`);
    }
  },
};

export default API;
