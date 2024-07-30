/**
 * 新的WalletService
 * 接入WalletConnect的SDk
 * 连接钱包，切换网络，请求签名交易等，都在这个类中
 */
//

// import { Box, Button, Link, Typography } from "@mui/material";
import { w3Modal, chains } from "../../../App";
import {
  useWeb3Modal,
  useWalletInfo,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useWeb3ModalEvents,
  W3mNetworkButton,
} from "@web3modal/ethers-react-native";

import { useEffect, useState } from "react";
import {
  BrowserProvider,
  Contract,
  JsonRpcSigner,
  formatUnits,
  parseUnits,
} from "ethers";
// import { LoadingButton } from "@mui/lab";
import Contracts from "./Contracts";
// import LoginService, { useAccount } from "../LoginService";
// import Image from "next/image";
import API from "../../modules/Api";
// import { fetchWithRevalidate } from "../../modules/Api";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import DataCenter from "../../modules/DataCenter";

const { Web3Api, fetchWithRevalidate } = API;

/**
 * 对应platform server上的WebToken结构
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
 * 从服务器获取所有token列表
 */
export async function initTokens() {
  const data = await fetchWithRevalidate(Web3Api.getTokenList(), null, false);
  console.log("=====", data);
  for (const key in data) {
    Contracts.addToken(data[key]);
  }
}

function currentWalletInfo() {
  return {
    address: w3Modal.getAddress(),
    isConnected: w3Modal.getIsConnected(),
    chainId: w3Modal.getChainId(),
  };
}

/**
 *
 * @param {string} contractName 根据合约名字返回合约对象
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

async function getBalance(token, walletAddress, decimals = 2) {
  // const chainId = w3Modal.getChainId();
  // const ethersProvider = new BrowserProvider(w3Modal.getWalletProvider());
  // const signer = await ethersProvider.getSigner()
  // // The Contract object
  // const C = new Contract(token.getAddress(chainId), token.abi, signer)
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
  // const { walletInfo } = useWalletInfo();
  const accountInfo = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();
  const events = useWeb3ModalEvents();

  // let btnDom = null;
  // if (walletInfo == null) {
  //   btnDom = <ConnectButton />;
  // } else {
  //   btnDom = <w3m-account-button balance="hide" />;
  // }

  // return btnDom;
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
      // onPress={() => console.log("connect wallet")}
    >
      <Text className="text-white">Connect Wallet</Text>
    </TouchableOpacity>
  );
};

const W3Button = ({
  text,
  onClick,
  className,
  disabled,
  loading,
  variant,
  sx,
}) => {
  const accountInfo = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const [btnText, setBtnText] = useState(text);
  // const [imUserInfo, isLoggedIn] = useAccount(); //用户login信息

  // const imUserInfo = DataCenter.userInfo.imUserInfo;

  useEffect(() => {
    let t;
    // if (!isLoggedIn) {
    //   t = "Please Sign In";
    // } else if (!accountInfo.isConnected) {
    //   t = "Connect";
    // } else {
    //   t = text;
    // }
    t = "Connect";
    // const t = accountInfo.isConnected ? text : "Connect"
    setBtnText(t);
  }, [accountInfo.isConnected, isLoggedIn]);

  const onBtnClicked = () => {
    if (accountInfo.isConnected) {
      onClick?.call();
    } else {
      open();
    }
  };
  return (
    // <div className={className}>
    //   <LoadingButton
    //     sx={sx}
    //     variant={variant == null ? "contained" : variant}
    //     color="primary"
    //     fullWidth
    //     disabled={disabled || !isLoggedIn}
    //     loading={loading}
    //     onClick={() => {
    //       onBtnClicked();
    //     }}
    //   >
    //     {btnText}
    //   </LoadingButton>
    // </div>
    <View className={className}>
      <Pressable
        // style={[
        //   styles.button,
        //   { backgroundColor: disabled ? 'gray' : 'blue' },
        //   sx,
        // ]}
        disabled={disabled || !isLoggedIn}
        onPress={onBtnClicked}
      >
        {loading ? <ActivityIndicator /> : <Text>{btnText}</Text>}
      </Pressable>
    </View>
  );
};

/**
 *
 * 显示用户指定token的余额
 * token 传入 Contracts.get 获取的token合约信息
 * prefix 默认是 "Balance:"
 * @returns
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
    console.log(
      "==========update user balance========",
      token,
      chainId,
      walletAddress
    );
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
    console.log("========Token", token, "Balance", b);
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
    // <Typography
    //   variant={variant}
    //   color={color}
    //   gutterBottom
    //   className="w-full text-right"
    // >
    //   {prefix == null ? "Balance" : prefix} {balance}
    // </Typography>
    <Text>
      {prefix == null ? "Balance" : prefix} {balance}
    </Text>
  );
};

/**
 *
 * 显示一个合约标签
 * contract 通过Contracts.get获取的合约对象
 * @param {{contract:object}} props
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
    // <Box className="flex flex-row">
    //   <Link
    //     href="#"
    //     onClick={() => {
    //       window.open(link, "_blank");
    //     }}
    //     className="flex flex-row"
    //   >
    //     <Typography variant="body1" color={"GrayText"}>
    //       Contract:
    //     </Typography>
    //     <Typography variant="body1" color={"GrayText"} className="pl-1">
    //       {address}
    //     </Typography>
    //   </Link>
    // </Box>
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
 * @param {{amount:number,token:{name:string,icon:string,getAddress:()=>string} | string}}
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
    // <span className={className || "flex flex-row justify-center"}>
    //   {amount}
    //   <Link
    //     href="#"
    //     onClick={() => {
    //       window.open(link, "_blank");
    //     }}
    //   >
    //     <Image
    //       src={t.icon}
    //       width={18}
    //       height={18}
    //       className="ml-2 mr-1 object-contain"
    //       alt={t.name}
    //     />
    //     {t.name}
    //   </Link>
    // </span>
    <View className={className || "flex flex-row justify-center"}>
      <Text>{amount}</Text>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(link);
        }}
      >
        <Image
          source={{ uri: t.icon }}
          style={{ width: 18, height: 18 }}
          alt={t.name}
        />
        <Text>{t.name}</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 *
 * 显示一个交易哈希标签
 *
 * label	标签内容
 * txHash	交易hash
 * chainId	链id，不填默认取当前所在链的id
 *
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
    // <Box className="flex flex-row">
    //   <Link
    //     href="#"
    //     onClick={() => {
    //       window.open(link, "_blank");
    //     }}
    //     className="flex flex-row"
    //   >
    //     <Typography variant="body1" color={"GrayText"}>
    //       {label}
    //     </Typography>
    //     <Typography variant="body1" color={"GrayText"} className="pl-1">
    //       {address}
    //     </Typography>
    //   </Link>
    // </Box>
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

async function waitTransaction(txHash) {
  const provider = new BrowserProvider(w3Modal.getWalletProvider());
  let t = 0;
  while (true) {
    const r = await provider.getTransactionReceipt(txHash);
    if (r == null) {
      await sleep(1000);
      t += 1000;
      if (t > 5 * 60 * 1000) {
        //超时5分钟
        return false;
      }
    } else {
      return true;
    }
  }
}

const TokenSwapContract = {
  contractName: "TokenSwap",
  contract: Contracts.get("TokenSwap"),
  approve: tokenSwapApprove,
  swap: swapNexu,
};

const parseEtherException = (e) => {
  const regex = /Error: (.*) \(action./;
  const match = e.toString().match(regex);
  return match ? match[1] : e.message;
};

class Web3Result {
  /**
   * @type {boolean}
   */
  success;

  /**
   * @type {string} tx hash
   */
  txHash;

  /**
   * @type {string} error string
   */
  error;
}

Web3Result.Succ = (txHash) => {
  const r = new Web3Result();
  r.success = true;
  r.txHash = txHash;
  r.error = null;
  return r;
};

Web3Result.Err = (error) => {
  const r = new Web3Result();
  r.success = false;
  r.txHash = null;
  r.error = error;
  return r;
};

Web3Result.Exception = (exception) => {
  const r = new Web3Result();
  r.success = false;
  r.txHash = null;
  r.error = parseEtherException(exception);
  return r;
};

const TicketAndStakingContract = {
  contractName: "TicketAndStaking",
  ticketToken: "NEXG",
  stakeToken: "NEXU",
  rewardToken: "MVT",
  contract: Contracts.get("TicketAndStaking"),
  /**
   *
   * @param {number} amount
   * @returns {Promise<Web3Result>}
   */
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
  /**
   * 获取staking信息
   * @returns {Promise<[totalStaked:BigInt,participantCount:BigInt,senderStaked:BigInt]>}
   */
  getStakingInfo: async () => {
    const [chainId, ethersProvider, signer, contract] = await getContractObject(
      TicketAndStakingContract.contractName
    );
    const r = await contract.getStakingInfo();
    return r;
  },
};

/**
 *
 * @param {string} contractName 合约名称
 * @param {Map<number,string>} addresses 合约地址 chainId->address
 */
const updateContractAddress = (contractName, addresses) => {
  const contract = Contracts.get(contractName);
  if (contract == null) return;
  const old = contract.contract;
  contract.contract = addresses;
  //console.log(`contract[${contractName}] address has been changed`, 'old', old, "current", contract.contract);
};

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
 * 获取合约操作对象
 * @param {string} name  合约名字
 * @param {Map<number, string>} addresses 合约地址表
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
