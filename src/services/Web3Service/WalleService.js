// WalleService.js

import { useEffect, useState } from "react";
import { w3Modal, Chains } from "../../../App";
import {
  useWeb3Modal,
  useWalletInfo,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useWeb3ModalEvents,
  W3mNetworkButton,
} from "@web3modal/ethers-react-native";

import {
  BrowserProvider,
  Contract,
  JsonRpcSigner,
  formatUnits,
  parseUnits,
} from "ethers";

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";

import Contracts from "./Contracts";
import API from "../../modules/Api";
import { parseEtherException } from "./sharedLogic";
import { renderCoinIcon } from "../../utils/render";

const { Web3Api, fetchWithRevalidate } = API;

/**
 * Web3Token class represents a blockchain token
 */
export class Web3Token {
  name;
  symbol;
  address;
  decimals;
  icon;

  constructor(name, symbol, address, decimals, icon) {
    this.name = name;
    this.symbol = symbol;
    this.address = address;
    this.decimals = decimals;
    this.icon = icon;
  }
}

/**
 * Initialize tokens from the server
 */
export async function initTokens() {
  const data = await fetchWithRevalidate(Web3Api.getTokenList(), null, false);
  console.log("=====", data);
  for (const key in data) {
    Contracts.addToken(data[key]);
  }
}

/**
 * Get current wallet information
 * @returns {{address: string, isConnected: boolean, chainId: number}}
 */
function currentWalletInfo() {
  return {
    address: w3Modal.getAddress(),
    isConnected: w3Modal.getIsConnected(),
    chainId: w3Modal.getChainId(),
  };
}

/**
 * Get contract object
 * @param {string} contractName - The name of the contract
 * @returns {Promise<[chainId:number, ethersProvider:BrowserProvider, signer:JsonRpcSigner, contract:Contract]>}
 */
async function getContractObject(contractName) {
  const chainId = w3Modal.getChainId();
  const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
  const signer = await ethersProvider.getSigner();
  const token = Contracts.get(contractName);
  const contract = new Contract(token.getAddress(chainId), token.abi, signer);
  return [chainId, ethersProvider, signer, contract];
}

/**
 * Get token balance
 * @param {object} token - Token object
 * @param {string} walletAddress - Wallet address
 * @param {number} decimals - Number of decimals to format
 * @returns {Promise<string>}
 */
async function getBalance(token, walletAddress, decimals = 2) {
  const [chainId, ethersProvider, signer, contract] = await getContractObject(
    token.name
  );
  if (token == null || token.getAddress == null) {
    return (0.0).toFixed(decimals);
  }
  const B = await contract.balanceOf(walletAddress);
  const s = formatUnits(B, token.decimals);
  return parseFloat(s).toFixed(decimals);
}

/**
 * Approve token swap
 * @param {object} token - Token object
 * @param {number} amount - Amount to approve
 * @returns {Promise<boolean|object>}
 */
async function tokenSwapApprove(token, amount) {
  const provider = new BrowserProvider(w3Modal.getWalletProvider());
  const chainId = w3Modal.getChainId();
  const tokenAddr = token.getAddress(chainId);
  const signer = await provider.getSigner();
  const C = new Contract(tokenAddr, token.abi, signer);
  const tokenSwap = Contracts.get("TokenSwap");

  try {
    const ret = await C.approve(
      tokenSwap.getAddress(chainId),
      parseUnits(amount.toString(), token.decimals)
    );
    console.log(ret.hash);
    const r = await waitTransaction(ret.hash);
    if (r == false) {
      return false;
    }
    return ret;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * Execute token swap
 * @param {object} token - Token object
 * @param {number} amount - Amount to swap
 * @returns {Promise<boolean>}
 */
async function swapNexu(token, amount) {
  const provider = new BrowserProvider(w3Modal.getWalletProvider());
  const chainId = w3Modal.getChainId();
  const tokenSwap = Contracts.get("TokenSwap");
  const signer = await provider.getSigner();
  const TC = new Contract(tokenSwap.getAddress(chainId), tokenSwap.abi, signer);
  const tx = await TC.swap(parseUnits(amount.toString(), token.decimals));
  console.log(tx);
  const r = await waitTransaction(tx.hash);
  return r;
}

const W3ConnectButton = () => {
  const accountInfo = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();
  const events = useWeb3ModalEvents();
  return <ConnectButton />;
};

const W3NetworkButton = () => {
  const { walletInfo } = useWalletInfo();
  return <W3mNetworkButton />;
};

const ConnectButton = () => {
  const { open } = useWeb3Modal();

  return (
    <TouchableOpacity
      className="flex items-center py-1 px-2 rounded-2xl z-50 font-bold bg-[#211627] drop-shadow-[0_3px_0px_rgba(72,147,240,1)] cursor-pointer hover:bg-[#4893F0]"
      onPress={() => open()}
    >
      <Text className="text-white">Connect Wallet</Text>
    </TouchableOpacity>
  );
};

const W3Button = ({ text, onClick, style, disabled, loading, variant, sx }) => {
  const accountInfo = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [btnText, setBtnText] = useState(text);

  useEffect(() => {
    let t;
    t = accountInfo.isConnected ? text : "Connect";
    setBtnText(t);
  }, [accountInfo.isConnected]);

  const onBtnClicked = () => {
    if (accountInfo.isConnected) {
      onClick?.call();
    } else {
      open();
    }
  };

  return (
    <TouchableOpacity
      className={style || "w-full bg-blue-500 p-2 rounded"}
      disabled={disabled}
      onPress={onBtnClicked}
    >
      {/* <Pressable disabled={disabled} onPress={onBtnClicked}> */}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-center text-white font-bold uppercase">
          {btnText}
        </Text>
      )}
      {/* </Pressable> */}
    </TouchableOpacity>
  );
};

/**
 * Display user's token balance
 * @param {{token: object, prefix: string, variant: string, color: string}} props
 */
const W3Balance = ({ token, prefix, variant, color }) => {
  const accountInfo = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [balance, setBalance] = useState(0);

  const updateBalance = async (
    token,
    chainId,
    walletAddress,
    ethersProvider
  ) => {
    if (token == null) {
      setBalance(0);
      return;
    }
    const address = token.getAddress(chainId);
    if (address == null) {
      setBalance(0);
      return;
    }
    const b = await getBalance(token, walletAddress);
    setBalance(b);
  };

  useEffect(() => {
    if (!accountInfo.isConnected) {
      setBalance(0);
      return;
    }
    const ethersProvider = new BrowserProvider(walletProvider);
    updateBalance(
      token,
      accountInfo.chainId,
      accountInfo.address,
      ethersProvider
    );
  }, [accountInfo.isConnected, accountInfo.chainId, token]);

  return (
    <Text>
      {prefix == null ? "Balance" : prefix} {balance}
    </Text>
  );
};

/**
 * Display contract label
 * @param {{contract: object}} props
 */
const W3ContractLabel = ({ contract }) => {
  const accountInfo = currentWalletInfo();
  if (!accountInfo.isConnected || contract == null) {
    return <></>;
  }
  let address = contract.getAddress(accountInfo.chainId);
  if (address.length > 10) {
    const sub1 = address.substr(0, 5);
    const sub2 = address.substr(address.length - 4, 4);
    address = sub1 + "..." + sub2;
  }
  const chainInfo = Chains[accountInfo.chainId];
  const link =
    chainInfo == null
      ? ""
      : `${chainInfo.explorerUrl}address/${contract.getAddress(
          accountInfo.chainId
        )}`;

  return (
    <View className="flex flex-row">
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(link);
        }}
      >
        <Text>Contract: {address}</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Display token label
 * @param {{amount: number, token: object|string, className: string}} props
 */
const W3TokenLabel = ({ amount, token, className }) => {
  const accountInfo = currentWalletInfo();
  const chainInfo = Chains[accountInfo.chainId];

  let t = token;
  if (typeof token === "string") {
    t = Contracts.get(token);
    if (t == null) {
      t = { name: "unknown", getAddress: () => "" };
    }
  }

  const address =
    t.getAddress == null ? null : t.getAddress(accountInfo.chainId);
  const link =
    chainInfo == null || address == null
      ? ""
      : `${chainInfo.explorerUrl}token/${address}`;

  return (
    <View className={className || "flex flex-row justify-center"}>
      <Text>{amount}</Text>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(link);
        }}
        className="flex flex-row"
      >
        {/* <Image
          source={{ uri: t.icon }}
          style={{ width: 18, height: 18 }}
          alt={t.name}
        /> */}
        {renderCoinIcon(t.icon, 18, 18)}
        <Text> {t.name}</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Display transaction hash label
 * @param {{label: string, txHash: string, chainId: number}} props
 */
const W3TxHashLabel = ({ label, txHash, chainId }) => {
  const accountInfo = currentWalletInfo();
  if (!accountInfo.isConnected || txHash == null) {
    return <></>;
  }
  let address = txHash;
  if (address.length > 10) {
    const sub1 = address.substr(0, 5);
    const sub2 = address.substr(address.length - 4, 4);
    address = sub1 + "..." + sub2;
  }

  const cid = chainId ?? accountInfo.chainId;

  const chainInfo = Chains[cid];
  const link = chainInfo == null ? "" : `${chainInfo.explorerUrl}tx/${txHash}`;

  return (
    <View className="flex flex-row">
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(link);
        }}
      >
        <Text>
          {label} {address}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @returns {Promise<boolean>}
 */
async function waitTransaction(txHash) {
  const provider = new BrowserProvider(w3Modal.getWalletProvider());
  let t = 0;
  while (true) {
    const r = await provider.getTransactionReceipt(txHash);
    if (r == null) {
      await sleep(1000);
      t += 1000;
      if (t > 5 * 60 * 1000) {
        // Timeout after 5 minutes
        return false;
      }
    } else {
      return true;
    }
  }
}

/**
 * Update contract address
 * @param {string} contractName - Contract name
 * @param {Map<number, string>} addresses - Contract addresses
 */
const updateContractAddress = (contractName, addresses) => {
  const contract = Contracts.get(contractName);
  if (contract == null) return;
  const old = contract.contract;
  contract.contract = addresses;
};

/**
 * Sleep for a given time
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = async (ms) => {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, ms);
  });
};

const _Contracts = {
  TokenSwap: TokenSwapContract,
  TicketAndStaking: TicketAndStakingContract,
};

/**
 * Get contract operations object
 * @param {string} name - Contract name
 * @param {Map<number, string>} addresses - Contract addresses
 * @returns {object|null}
 */
const getContract = (name, addresses) => {
  const _C = _Contracts[name];
  if (_C == null) {
    return null;
  }
  if (addresses != null && Object.entries(addresses).length > 0) {
    updateContractAddress(name, addresses);
  }
  return _C;
};

/**
 * Web3 result object
 */
class Web3Result {
  success;
  txHash;
  error;

  static Succ = (txHash) => {
    const r = new Web3Result();
    r.success = true;
    r.txHash = txHash;
    r.error = null;
    return r;
  };

  static Err = (error) => {
    const r = new Web3Result();
    r.success = false;
    r.txHash = null;
    r.error = error;
    return r;
  };

  static Exception = (exception) => {
    const r = new Web3Result();
    r.success = false;
    r.txHash = null;
    r.error = parseEtherException(exception);
    return r;
  };
}

const TokenSwapContract = {
  contractName: "TokenSwap",
  contract: Contracts.get("TokenSwap"),
  approve: tokenSwapApprove,
  swap: swapNexu,
};

const TicketAndStakingContract = {
  contractName: "TicketAndStaking",
  ticketToken: "NEXG",
  stakeToken: "NEXU",
  rewardToken: "MVT",
  contract: Contracts.get("TicketAndStaking"),

  approveTicket: async (amount) => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const objs = await getContractObject(TicketAndStakingContract.ticketToken);
    const ticketToken = Contracts.get(TicketAndStakingContract.ticketToken);
    const spenderAddr = Contracts.get(
      TicketAndStakingContract.contractName
    ).getAddress(chainId);
    try {
      const r = await objs[3].approve(
        spenderAddr,
        parseUnits(amount.toString(), ticketToken.decimals)
      );
      console.log(`approveTicket waiting for tx ${r.hash}`);
      await waitTransaction(r.hash);
      console.log(`approveTicket waiting for tx ${r.hash} done`);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  approveStake: async (amount) => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const objs = await getContractObject(TicketAndStakingContract.stakeToken);
    const stakeToken = Contracts.get(TicketAndStakingContract.stakeToken);
    const spenderAddr = Contracts.get(
      TicketAndStakingContract.contractName
    ).getAddress(chainId);
    try {
      const r = await objs[3].approve(
        spenderAddr,
        parseUnits(amount.toString(), stakeToken.decimals)
      );
      console.log(`approveStake waiting for tx ${r.hash}`);
      await waitTransaction(r.hash);
      console.log(`approveStake waiting for tx ${r.hash} done`);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  setMaxStakeAmount: async (maxStakeAmount) => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const st = Contracts.get(TicketAndStakingContract.stakeToken);
    try {
      const r = await contract.setMaxStakeAmount(
        parseUnits(maxStakeAmount, st.decimals)
      );
      console.log(`setMaxStakeAmount waiting for tx ${r.hash}`);
      await waitTransaction(r.hash);
      console.log(`setMaxStakeAmount waiting for tx ${r.hash} done`);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  stake: async (stakeAmount) => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const st = Contracts.get(TicketAndStakingContract.stakeToken);
    try {
      const r = await contract.stake(
        parseUnits(stakeAmount.toString(), st.decimals)
      );
      console.log(`stake waiting for tx ${r.hash}`);
      await waitTransaction(r.hash);
      console.log(`stake waiting for tx ${r.hash} done`);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  claim: async (onTrans) => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    try {
      const r = await contract.claim();
      console.log(`claim waiting for tx ${r.hash}`);
      if (onTrans != null) onTrans({ txHash: r.hash, state: "waiting" });
      await waitTransaction(r.hash);
      console.log(`claim waiting for tx ${r.hash} done`);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  refund: async () => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    try {
      console.log(`refund waiting for tx ${r.hash}`);
      const r = await contract.refund();
      console.log(`refund waiting for tx ${r.hash} done`);
      await waitTransaction(r.hash);
      return Web3Result.Succ(r.hash);
    } catch (e) {
      console.error(e);
      return Web3Result.Err(parseEtherException(e));
    }
  },

  getStakingInfo: async () => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const r = await contract.getStakingInfo();
    return r;
  },
};

export {
  Web3Result,
  W3ConnectButton,
  W3NetworkButton,
  W3Button,
  W3Balance,
  W3ContractLabel,
  W3TxHashLabel,
  W3TokenLabel,
  getBalance,
  currentWalletInfo,
  updateContractAddress,
  waitTransaction,
  getContract,
};

initTokens();
