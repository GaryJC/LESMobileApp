import "@walletconnect/react-native-compat";

import {
  createWeb3Modal,
  defaultConfig,
  Web3Modal,
} from "@web3modal/ethers-react-native";
// 1. Get projectId
// const projectId = "ed39de1f78a556dfab83a41f8c1c229f";
const projectId = "8b953fd5bcfaaa9c8b2270267d326f68";

// 2. Set chains
const polygon_amoy = {
  chainId: 80002,
  name: "Polygon Amoy Testnet",
  currency: "Matic",
  explorerUrl: "https://amoy.polygonscan.com/",
  // rpcUrl: 'https://rpc-amoy.polygon.technology'
  rpcUrl:
    "https://polygon-amoy.g.alchemy.com/v2/JK6hdshYZv4VIqA0eZ4WujN_5XorUMxY",
};
const polygon_mainnet = {
  chainId: 137,
  name: "Polygon",
  currency: "Matic",
  explorerUrl: "https://polygonscan.com/",
  rpcUrl:
    "https://polygon-mainnet.g.alchemy.com/v2/tmugFNVs_zwqkoLEI-YpM3o_3oSJg3o3",
};

// const chains =
//   process.env.NODE_ENV == "production"
//     ? [polygon_mainnet]
//     : [polygon_amoy, polygon_mainnet];

const chains = [polygon_amoy, polygon_mainnet];

// 3. Create a metadata object
const metadata = {
  name: "NexGami",
  description: "Embracing the Web3 Realm in Gaming",
  url: "https://www.nexgami.com", // origin must match your domain & subdomain
  icons: ["https://res.nexgami.com/common/nexgami-512.png"],
  redirect: {
    native: "nexgami.metavirus://",
  },
};

const config = defaultConfig({ metadata });

// 4. Create modal
export const w3Modal = createWeb3Modal({
  projectId,
  chains,
  config,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    "ad2eff108bf828a39e5cb41331d95861c9cc516aede9cb6a95d75d98c206e204",
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709",
    "38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662",
    "15c8b91ade1a4e58f3ce4e7a0dd7f42b47db0c8df7e0d84f63eb39bcb96c4e0f",
  ],
});

const Chains = Object.fromEntries(chains.map((c) => [c.chainId, c]));

export { Chains };
