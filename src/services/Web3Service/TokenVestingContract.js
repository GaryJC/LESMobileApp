import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import { useEffect, useState } from "react";
// import w3Modal, { Chains } from "./InitWalletConnect";
import { w3Modal, Chains } from "./InitWalletConnect";
import API from "../../modules/Api";
// import { fetchWithRevalidate } from "../../modules/Api";
import { Web3Result, waitTransaction } from "./WalleService";
import Contracts from "./Contracts";
import {
  BrowserProvider,
  Contract,
  FixedNumber,
  formatEther,
  parseEther,
  parseUnits,
} from "ethers";

const { Web3Api, fetchWithRevalidate } = API;

/**
 * TokenVesting合约
 */
const TokenVestingContract = {
  abi: [
    "function release(address _benefiniary)",
    "function revoke(address _benefiniary)",
    "function getTokenAddress() external view returns (address)",
    "function getVestingSchedulesTotalAmount()",
    "function token()",
    "function withdraw() public",
    "function createVestingSchedule(address _benefiniary,uint256 _start,uint256 _cliff, uint256 _duration,uint256 _totalAmount,bool _revocable,uint8 _role,uint8 _releaseInterval)",
    "function getVestingSchedule(address) public view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, bool, uint8, uint256, uint256)",
  ],
};

export class TokenVesting {
  /**
   * 合约地址
   * @type {string}
   */
  contractAddress;
  /**
   * 合约所在链id
   * @type {number}
   */
  chainId;

  /**
   * vesting的总额度 (Granted)
   * @type {number}
   */
  amount;

  /**
   * vesting的起始时间，秒数
   * @type {number}
   */
  startTime;

  /**
   * vesting的持续时间，秒数
   * @type {number}
   */
  duration;

  /**
   * vesting的cliff时长，秒数
   * @type {number}
   */
  cliffTime;

  /**
   * cliff到期后一次性释放的比例
   * @type {number} 0~10000，2010代表 20.1%
   */
  cliffReleasePercentage;

  /**
   * 是否已经被revoke
   * @type {boolean}
   */
  revoked;

  /**
   * vesting的角色
   * 0 = Investor
   * 1 = Employee
   * @type {0|1}
   */
  role;

  /**
   * 释放周期，单位秒 60表示每分钟释放一次资金
   *
   * 这个值只可能是1分、1小时、1天、1周、1月、1季度、半年、1年
   * @type {60 | 3600 | 86400 | 604800 | 2592000 | 7776000 | 15552000 | 31536000}
   */
  slicePeriod;

  /**
   * vesting计划奖励的token
   * @type {{name:string, symbol:string, address:string}}
   */
  vestingToken;

  /**
   * vesting计划数据
   *
   * claimed		-- 已领取数量
   *
   * available	-- 可领取数量
   * @type {{claimed:number, available:number}}
   */
  #scheduleData;

  /**
   *
   * @param {number} chainId 合约所在链id
   * @param {string} contractAddress 合约地址
   * @param {number} amount vesting的token总量
   * @param {number} startTime 起始时间，秒数
   * @param {number} duration 持续时间，秒数
   * @param {number} cliffTime cliff期时间，秒数
   * @param {number} cliffReleasePercentage cliff到期后一次性释放比例，0~10000
   * @param {boolean} revoked 是否已经revoke
   * @param {0|1} role vesting的角色 0=investor 1=employee
   * @param {number} slicePeriod 资金释放周期，单位秒
   * @param {{name:string, symbol:string, address:string}} token token信息
   */
  constructor(
    chainId,
    contractAddress,
    amount,
    startTime,
    duration,
    cliffTime,
    cliffReleasePercentage,
    revoked,
    role,
    slicePeriod,
    token
  ) {
    this.contractAddress = contractAddress;
    this.chainId = chainId;
    this.amount = amount;
    this.startTime = startTime;
    this.duration = duration;
    this.cliffTime = cliffTime;
    this.cliffReleasePercentage = cliffReleasePercentage;
    this.revoked = revoked;
    this.role = role;
    this.slicePeriod = slicePeriod;
    this.token = token;
    this.#updateScheduleData();
  }

  /**
   * 计算已经解锁的token数量
   * @returns {number} 当前已解锁的token数量
   */
  #unlockedAmount() {
    const t = new Date().getTime() / 1000; //当前秒数
    const cliff = this.startTime + this.cliffTime;

    if (t < cliff) {
      //还没到达cliff期
      return 0;
    } else if (this.revoked) {
      //已经被撤回
      return 0;
    } else if (t >= this.startTime + this.duration) {
      //当前vesting计划已经完成
      return this.amount;
    } else {
      const cliffAmount = (this.amount * this.cliffReleasePercentage) / 10000; //cliff结束后一次性发放金额
      const timeFromCliff = t - cliff; //cliff结束后经过的时间
      const vestedSlices = parseInt(timeFromCliff / this.slicePeriod);
      const vested = vestedSlices * this.slicePeriod;
      const vestedAfterCliff =
        ((this.amount - cliffAmount) * vested) /
        (this.duration - this.cliffTime);
      return cliffAmount + vestedAfterCliff;
    }
  }

  async #updateScheduleData(forceUpdate = false) {
    const TC = Contracts.get(this.token.symbol);
    const t = new Date().getTime();
    if (
      this.#scheduleData != null &&
      t - this.#scheduleData.updateTime < 60 * 1000 &&
      !forceUpdate
    ) {
      //1分钟以内不更新
      return;
    }
    const chainId = w3Modal.getChainId();
    const address = w3Modal.getAddress();
    if (chainId == this.chainId) {
      const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        this.contractAddress,
        TokenVestingContract.abi,
        signer
      );
      const result = await contract.getVestingSchedule(address);
      const claimed = parseFloat(
        formatEther(result[5].toString(), TC?.decimals ?? 18)
      );
      const available = parseFloat(
        formatEther(result[10].toString(), TC?.decimals ?? 18)
      );
      this.#scheduleData = { claimed, available, updateTime: t };
    } else {
      this.#scheduleData = { claimed: 0, available: 0, updateTime: 0 };
    }
    console.log(this.#scheduleData);
  }

  /**
   *
   * @returns {number} 当前vesting计划的总额度
   */
  getGranted() {
    return this.amount;
  }

  /**
   * @param {boolean} forceUpdate 是否强制更新数据
   * @returns {number} 当前已领取的数量
   */
  async getClaimedAmount(forceUpdate = false) {
    await this.#updateScheduleData(forceUpdate);
    return this.#scheduleData.claimed;
  }

  /**
   * @param {boolean} forceUpdate 是否强制更新数据
   * @returns {number} 当前可领取的数量
   */
  async getAvailableAmount(forceUpdate = false) {
    await this.#updateScheduleData(forceUpdate);
    return this.#scheduleData.available;
  }

  /**
   * @returns {number} 到目前为止已经解锁的额度
   */
  getUnlockedAmount() {
    return this.#unlockedAmount();
  }

  getLockedAmount() {
    return this.getGranted() - this.getUnlockedAmount();
  }

  getStatus() {
    const t = new Date().getTime() / 1000;
    if (t < this.startTime) {
      return "Upcoming";
    } else if (t >= this.startTime) {
      return "Available";
    } else if (t > this.startTime + this.duration) {
      return "Completed";
    }
  }

  /**
   *
   * @returns {boolean} 返回当前网络是否是vesting所在网络
   */
  isCurrentNetwork() {
    return w3Modal.getChainId() == this.chainId;
  }

  /**
   * 请求切换到vesting所在网络
   */
  async switchNetwork() {
    if (!this.isCurrentNetwork()) {
      await w3Modal.switchNetwork(this.chainId);
    }
  }

  /**
   *
   * 发起withdraw请求
   * @returns {Web3Result}
   */
  async withdraw() {
    if (!this.isCurrentNetwork()) {
      return;
    }
    console.log("withdraw...");

    const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
    const signer = await ethersProvider.getSigner();
    const contract = new Contract(
      this.contractAddress,
      TokenVestingContract.abi,
      signer
    );
    try {
      const result = await contract.withdraw();
      await waitTransaction(result.hash);
      return Web3Result.Succ(result.hash);
    } catch (e) {
      console.log(e);
      return Web3Result.Exception(e);
    }
  }

  getContractLink() {
    const chainInfo = Chains[this.chainId];
    const link =
      chainInfo == null
        ? ""
        : `${chainInfo.explorerUrl}address/${this.contractAddress}`;
    console.log(link);
    return link;
  }
}

/**
 * 当前连接钱包的所有vesting数据
 * @returns {[accountInfo:{address: `0x${string}` | undefined,isConnected: boolean,chainId: number | undefined; },loading:boolean,vestings:TokenVesting[]]}
 */
export const useVestings = () => {
  const accountInfo = useWeb3ModalAccount();
  /**
   * @type {[vestings:TokenVesting[], setVestings:(vestings:TokenVesting[])=>void]}
   */
  const [vestings, setVestings] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMyVestings = async () => {
    setLoading(true);
    const vestings = [];
    if (accountInfo.isConnected) {
      const ret = await fetchWithRevalidate(
        Web3Api.getMyVestings(accountInfo.address),
        null,
        false
      );
      for (const index in ret) {
        const d = ret[index];
        const vesting = new TokenVesting(
          d.chain_id,
          d.contract,
          d.amount,
          d.start_time,
          d.duration,
          d.cliff_time,
          d.cliff_release_percentage,
          d.revoked,
          d.role,
          d.slice_period,
          d.token
        );
        vestings.push(vesting);
        console.log(
          `current vesting[${vesting.getStatus()}] Granted ${vesting.getGranted()}${
            vesting.token.symbol
          } unlocked ${vesting.getUnlockedAmount()}`
        );
      }
      setVestings(vestings);
    }
    console.log(vestings);
    setVestings(vestings);
    setLoading(false);
  };

  useEffect(() => {
    getMyVestings();
  }, []);

  useEffect(() => {
    getMyVestings();
  }, [accountInfo.isConnected, accountInfo.address]);

  return [accountInfo, loading, vestings];
};
