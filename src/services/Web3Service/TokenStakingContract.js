import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import { useEffect, useState } from "react";
import { w3Modal } from "../../../App";
import API from "../../modules/Api";
import { fetchWithRevalidate } from "../../modules/Api";
import { Web3Result, waitTransaction } from "./WalleService";
import Contracts from "./Contracts";
import Constants from "../../modules/Constants";
import {
  BrowserProvider,
  Contract,
  FixedNumber,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";

const { Web3Api } = API;

const TokenStakingContract = {
  abi: [
    "function stake(uint256 _baseAmount)",
    "function unstake(uint256 _amount)",
    "function claimReward()",
    "function getStakingInfo(address _user) external view returns (uint256, uint256, uint256[], uint256, uint256)",
  ],
};

export class UserStakingInfo {
  /**
   * 开始质押时间 timestamp(秒)
   * @type {number}
   */
  startTime = 0;

  /**
   * 最后一次Claim的时间 timestamp(秒)
   * @type {number}
   * @deprecated 暂时没用了
   */
  lastClaimTime = 0;

  /**
   * 所有token质押的数量
   * key = tokenSymbol，例如NEXG, NEXU
   * value = amount
   * @type {{}}
   */
  amounts = {};

  /**
   * 尚未领取的奖励数量
   * @type {number}
   */
  pendingRewards;

  /**
   * 尚未领取的奖励数量
   * @type {number}
   */
  pendingRewards = 0;

  /**
   * nft状态
   * 0=不可领取 1=可领取 2=已领取
   * @deprecated 暂时没用了
   * @type {number}
   */
  nftStatus = 0;
}

export class TokenStaking {
  /**
   * 所在链Id
   * 这个id是区块链id
   * @type {number}
   */
  chainId;

  /**
   * 合约地址
   * @type {string}
   */
  address;
  /**
   * Staking的基础token
   * @type {{name:string, symbol:string, address:string}}
   */
  baseToken;

  /**
   * Staking的其他token
   * @type {{name:string, symbol:string, address:string}[]}
   */
  otherTokens;

  /**
   * otherTokens和baseToken的比例
   * 例如 baseToken质押100，ratio=10，则对应的otherToken需要质押1000
   * @type {number[]}
   */
  ratios;

  /**
   * 年化利率
   * 整数，510表示5.1%
   * @type {number}
   */
  annualRate;

  /**
   * Staking奖励的NFT地址
   * @type {{name:string, symbol:string, address:string}[]}
   */
  nft;

  /**
   * 获得nft所需的最少质押数量
   * @type {number}
   */
  nftThreshold;

  /**
   * 最小的质押时长，单位是秒数
   * @type {number}
   */
  minDuration;

  /**
   * 最小质押的baseToken的数量
   * @type {number}
   */
  minStakingAmount;

  /**
   * 质押奖励的Token
   * @deprecated 暂时没用了
   * @type {{name:string, symbol:string, address:string}[]}
   */
  rewardToken;

  /**
   * 用户质押信息
   * @type {UserStakingInfo}
   */
  stakingInfo;

  /**
   * 返回用户额质押详情
   * @returns {Promise<UserStakingInfo>}
   */
  async getStakingInfo() {
    const chainId = w3Modal.getChainId();
    const address = w3Modal.getAddress();
    const isConnected = w3Modal.getIsConnected();
    if (chainId != this.chainId) {
      //目前不在同一个链上， 从服务器取
      if (isConnected) {
        const r = await fetchWithRevalidate(
          Web3Api.getUserStakingInfo(address, this.chainId, this.address),
          null,
          false
        );
        this.stakingInfo = new UserStakingInfo();
        this.stakingInfo.amounts = {};
        this.stakingInfo.amounts[this.baseToken.symbol] = r.amount;
        this.stakingInfo.startTime = r.stake_time;

        for (const key in this.stakingInfo.otherTokens) {
          const t = this.stakingInfo.otherTokens[key];
          const amt = this.getTokenAmount(r.amount, t.name);
          this.stakingInfo.amounts[t.symbol] = amt;
        }
      } else {
        return new UserStakingInfo();
      }
    } else {
      //在同一个链上，获取合约数据
      const result = await this.#getStakingInfoOnChain();
      if (result == null) {
        if (this.stakingInfo == null) {
          return new UserStakingInfo();
        }
      } else {
        this.stakingInfo = new UserStakingInfo();
        this.stakingInfo.startTime = result[0];
        this.stakingInfo.amounts = result[2];
        this.stakingInfo.pendingRewards = result[3];
      }
    }
    return this.stakingInfo;
  }

  async #getStakingInfoOnChain() {
    const address = w3Modal.getAddress();
    const contract = await this.#getStakingContract();
    const result = await contract.getStakingInfo(address);
    return result;
  }

  /**
   *
   * @returns {Promise<Contract>}
   */
  async #getStakingContract() {
    const isConnected = w3Modal.getIsConnected();
    if (isConnected) {
      const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        this.address,
        TokenStakingContract.abi,
        signer
      );
      return contract;
    }
  }

  /**
   *
   * @param {number} baseAmount baseToken的数量
   * @param {string} tokenName 要转化的token名字
   */
  getTokenAmount(baseAmount, tokenName) {
    if (
      tokenName == this.baseToken.name ||
      tokenName == this.baseToken.symbol
    ) {
      return baseAmount;
    }
    const idx = this.otherTokens.findIndex(
      (t) => t.symbol == tokenName || t.name == tokenName
    );
    if (idx == -1) {
      console.error(`Token [${tokenName}] Not Found`);
      return 0;
    }
    const ratio = this.ratios[idx];
    return baseAmount * ratio;
  }

  /**
   * 转化成Constants.js中的ChainId
   * @returns {Constants.ChainID}
   */
  getConstantChainId() {
    switch (this.chainId) {
      case 137:
      case 80002:
        return Constants.ChainID.Polygon;
      case 1:
        return Constants.ChainID.Eth;
      case 43114:
      case 43113:
        return Constants.ChainID.Avalanche;
      case 56:
      case 97:
        return Constants.ChainID.BNB;
    }
    return null;
  }

  /**
   * 用户质押指定数量的token
   * @param {number} amount
   * @returns {Promise<Web3Result>}
   */
  async stake(amount) {
    const chainId = w3Modal.getChainId();
    const address = w3Modal.getAddress();
    const isConnected = w3Modal.getIsConnected();

    if (!isConnected) {
      return Web3Result.Err("Wallet Doesn't Connect");
    }
    if (chainId != this.chainId) {
      return Web3Result.Err("Chain Error");
    }

    const contract = await this.#getStakingContract();
    const t = Contracts.get(this.baseToken.symbol);

    try {
      const tx = await contract.stake(
        parseUnits(amount.toString(), t.decimals)
      );
      await waitTransaction(tx.hash);
      return Web3Result.Succ(tx.hash);
    } catch (e) {
      return Web3Result.Exception(e);
    }
  }

  // /**
  //  * 用户解除质押
  //  * @param {number} amount
  //  */
  // async unstake(amount) {
  // 	const chainId = w3Modal.getChainId();
  // 	const address = w3Modal.getAddress();
  // 	const isConnected = w3Modal.getIsConnected();

  // 	if (!isConnected) {
  // 		return Web3Result.Err("Wallet Doesn't Connect");
  // 	}
  // 	if (chainId != this.chainId) {
  // 		return Web3Result.Err("Chain Error");
  // 	}

  // 	const contract = await this.#getStakingContract();
  // 	const t = Contracts.get(this.baseToken.symbol);

  // 	try {
  // 		const tx = await contract.unstake(parseUnits(amount, t.decimals))
  // 		return Web3Result.Succ(tx.hash)
  // 	} catch (e) {
  // 		return Web3Result.Exception(e);
  // 	}
  // }

  /**
   * 用户请求获取奖励
   * @returns {Promise<Web3Result>}
   */
  async claim() {
    const chainId = w3Modal.getChainId();
    const address = w3Modal.getAddress();
    const isConnected = w3Modal.getIsConnected();

    if (!isConnected) {
      return Web3Result.Err("Wallet Doesn't Connect");
    }
    if (chainId != this.chainId) {
      return Web3Result.Err("Chain Error");
    }

    const contract = await this.#getStakingContract();

    try {
      const tx = await contract.claimReward();
      await waitTransaction(tx.hash);
      return Web3Result.Succ(tx.hash);
    } catch (e) {
      return Web3Result.Exception(e);
    }
  }

  /**
   * 对指定token进行approve操作
   *
   * 注意这里没有做balance的检查，需要在UI上的approve按钮做balance的校验
   * @param {string} tokenSymbol 要进行approve的token的symbol
   * @param {number} amount 要approve的数量
   * @returns {Promise<Web3Result>}
   */
  async approve(tokenSymbol, amount) {
    const chainId = w3Modal.getChainId();
    const isConnected = w3Modal.getIsConnected();

    if (!isConnected) {
      return Web3Result.Err("Wallet Doesn't Connect");
    }
    if (chainId != this.chainId) {
      return Web3Result.Err("Chain Error");
    }

    const t = Contracts.get(tokenSymbol);
    const contract = await this.#getTokenContract(this.chainId, tokenSymbol);

    try {
      const tx = await contract.approve(
        this.address,
        parseUnits(amount.toString(), t.decimals)
      );
      await waitTransaction(tx.hash);
      return Web3Result.Succ(tx.hash);
    } catch (e) {
      return Web3Result.Exception(e);
    }
  }

  /**
   * 获取用户指定token的余额
   * @param {string} tokenSymbol token符号，注意是symbol属性，NEXG,NEXU,MVT等
   * @returns {Promise<number>}
   */
  async getBalance(tokenSymbol) {
    let token = null;
    if (
      tokenSymbol == this.baseToken.symbol ||
      tokenSymbol == this.baseToken.name
    ) {
      token = this.baseToken;
    } else {
      token = this.otherTokens.find(
        (t) => t.symbol == tokenSymbol || t.name == tokenSymbol
      );
      if (token == null) {
        console.error(`Token[${tokenSymbol}] Not Found!`);
        return 0;
      }
    }

    const chainId = w3Modal.getChainId();
    const address = w3Modal.getAddress();
    const isConnected = w3Modal.getIsConnected();

    if (!isConnected || chainId != this.chainId) {
      return 0;
    }

    const t = Contracts.get(token.symbol);

    if (t == null || t.getAddress == null) {
      return (0.0).toFixed(decimals);
    }

    const contract = await this.#getTokenContract(this.chainId, token.symbol);
    const B = await contract.balanceOf(address);
    const s = formatUnits(B, t.decimals);
    return parseFloat(s).toFixed(2);
  }

  /**
   * @returns {Promise<Contract>}
   */
  async #getTokenContract(chainId, tokenSymbol) {
    const t = Contracts.get(tokenSymbol);
    if (t == null) {
      return null;
    }
    const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
    const signer = await ethersProvider.getSigner();
    const contract = new Contract(t.getAddress(chainId), t.abi, signer);
    return contract;
  }
}

let _stakingList = [];

/**
 *
 * @param {string} address
 * @returns {TokenStaking}
 */
const findStaking = (address) => {
  if (_stakingList.length == 0) {
    return null;
  }
  return _stakingList.find((s) => s.address == address);
};

/**
 * @param {string} address staking合约的地址
 *
 */
export const useStaking = (address) => {
  const staking = findStaking(address);
  if (staking != null) {
    if (staking.stakingInfo == null) {
    }
  }
};

/**
 * 当前所有staking的列表
 * @returns {[accountInfo:{address: `0x${string}` | undefined,isConnected: boolean,chainId: number | undefined; },loading:boolean,stakingList:TokenStaking[]]}
 */
export const useStakingList = () => {
  const accountInfo = useWeb3ModalAccount();
  /**
   * @type {[staking:TokenStaking[], setStaking:(staking:TokenStaking[])=>void]}
   */
  const [stakingList, setStaking] = useState([]);
  const [loading, setLoading] = useState(false);

  const newStaking = [];

  const getStakingList = async () => {
    setLoading(true);
    const list = await fetchWithRevalidate(
      Web3Api.getStakingList(),
      null,
      false
    );

    for (const key in list) {
      const staking = list[key];
      const ts = new TokenStaking();
      ts.chainId = staking.chain_id;
      ts.address = staking.address;
      ts.baseToken = staking.base_token;
      ts.otherTokens = staking.other_tokens;
      ts.ratios = staking.ratios;
      ts.annualRate = staking.annual_rate;
      ts.nft = staking.nft;
      ts.nftThreshold = staking.nft_threshold;
      ts.minDuration = staking.min_duration;
      ts.minStakingAmount = staking.min_stake_amount;
      ts.rewardToken = staking.reward_token;
      ts.stakingInfo = new UserStakingInfo();

      newStaking.push(ts);
    }
    setStaking(newStaking);
    setLoading(false);
    _stakingList = newStaking;
    console.log("staking list...===", newStaking);
  };

  useEffect(() => {
    getStakingList();
  }, []);

  return [accountInfo, loading, stakingList];
};
