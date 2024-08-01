// Contracts.js

import { ERC20Abi } from "./sharedLogic";

const ContractType = {
  Token: "Token",
  Contract: "Contract",
};

const USDT = {
  name: "USDT",
  type: ContractType.Token,
  contract: {
    137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    80002: "0xab7c6Db6cfA4D758A8e2e28f372dB43aE316E02A",
  },
  decimals: 6,
  icon: "/img/usdt.svg",
  abi: ERC20Abi,
};

const USDC = {
  name: "USDC",
  type: ContractType.Token,
  contract: {
    137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    80002: "0xab7c6Db6cfA4D758A8e2e28f372dB43aE316E02A",
  },
  decimals: 6,
  icon: "/img/usdc.svg",
  abi: ERC20Abi,
};

const NEXU = {
  name: "NEXU",
  type: ContractType.Token,
  contract: {
    137: "0xEb75F3952273B97Aa98fe85a3dD447BC34D4B4De",
    80002: "0x5E086c0E963eA27027E2Ecd573f0994Aa22Cf9d3",
  },
  decimals: 18,
  icon: "/img/nexu.png",
  abi: ERC20Abi,
};

const NEXG = {
  name: "NEXG",
  type: ContractType.Token,
  contract: {
    137: "0xaF0dC42725db75AE54f5E8945e71017Bc7ACd27d",
    80002: "0x60797243339a08958E71ed78A3fDB8f170560B9b",
  },
  decimals: 18,
  icon: "/img/nexgami.png",
  abi: ERC20Abi,
};

const MVT = {
  name: "MVT",
  type: ContractType.Token,
  contract: {
    137: "0xcd7BCaCc38d71ED14C875d3aBFec5a781812551E",
    80002: "0x36Ec469229Ee2AdF88FF3CC66d9f66cbD5b7Cb69",
  },
  decimals: 18,
  icon: "/img/mvt.png",
  abi: ERC20Abi,
};

const TokenSwap = {
  name: "TokenSwap",
  type: ContractType.Contract,
  contract: {
    137: "0x2815Ec3083f47f073DE9EB5670CfCbF1BD1709dc",
    80002: "0x5BB31759ad675b52e8Cd6A481A096a66f20c040C",
  },
  abi: [
    "function swap(uint256 amountIn) external",
    "function withdrawTokenIn(uint256 amount) external",
    "function withdrawTokenOut(uint256 amount) external",
    "function setSwapRatio(uint256 _swapRatio) external",
    "function getTokenInfo() external view returns (address tokenInAddress,address tokenOutAddress,uint256 currentSwapRatio,uint8 tokenInDecimals,uint8 tokenOutDecimals)",
    "function getBalances() external view returns (uint256 tokenInBalance, uint256 tokenOutBalance)",
  ],
};

const TicketAndStaking = {
  name: "TicketAndStaking",
  type: ContractType.Contract,
  contract: {
    137: "0x0Da7859f9760956c7aA852d3f60728e11CF11Cba",
    80002: "0xCCea2eeDD6EF2b1d67Fb13114bc02410a7cbFc78",
  },
  abi: [
    "function setMaxStakeAmount(uint256 _maxStakeAmount) external",
    "function stake(uint256 stakeAmount) external",
    "function claim() external",
    "function refund() external",
    "function getStakeAmount(address user) external view returns (uint256)",
    "function getStakingInfo() external view returns (uint256, uint256, uint256, bool)",
  ],
};

const Contracts = {
  USDT,
  USDC,
  NEXU,
  NEXG,
  MVT,
  TokenSwap,
  TicketAndStaking,

  /**
   * Get contract by name
   * @param {string} name - The name of the contract
   */
  get: (name) => {
    const contract = Contracts[name];
    if (contract && !contract.getAddress) {
      contract.getAddress = (chainId) => contract.contract[chainId];
    }
    return contract;
  },

  /**
   * Add token to the Contracts object
   * @param {Web3Token} token - The Web3Token instance
   */
  addToken: (token) => {
    const Token = {
      name: token.symbol,
      type: ContractType.Token,
      contract: token.address,
      decimals: token.decimals,
      icon: `/img/${token.icon}`,
      abi: ERC20Abi,
    };
    Contracts[Token.name] = Token;
  },
};

export default Contracts;
