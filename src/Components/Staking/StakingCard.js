import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  W3Button,
  currentWalletInfo,
} from "../../services/Web3Service/WalleService";
import { Chains } from "../../services/Web3Service/InitWalletConnect";
import Contracts from "../../services/Web3Service/Contracts";
import {
  renderChainIcon,
  renderChainName,
  renderCoinIcon,
} from "../../utils/render";

const formatApy = (apy) => {
  const formattedApy = (apy / 100).toFixed(2);
  return `${apy > 0 ? "+" : ""}${formattedApy}%`;
};

const formatTvl = (tvl) => {
  return `$${(tvl / 1_000_000).toFixed(2)} M`;
};

export const ContentLayout = ({ title, content, children }) => (
  <View className="flex-row justify-between items-center">
    <Text className="text-gray-500">{title}</Text>
    <Text className="text-white">{content}</Text>
    {children}
  </View>
);

const StakingTokenIcon = ({ token }) => {
  const accountInfo = currentWalletInfo();
  const chainInfo = Chains[accountInfo.chainId];

  let t = Contracts.get(token.symbol);
  if (!t) {
    t = { name: "unknown", getAddress: () => "" };
  }

  const address = t.getAddress ? t.getAddress(accountInfo.chainId) : null;
  const link =
    chainInfo && address ? `${chainInfo.explorerUrl}token/${address}` : "#";

  return (
    <TouchableOpacity onPress={() => link && console.log("Open URL:", link)}>
      {/* <Avatar
        source={{ uri: t.icon }}
        containerStyle={{ width: 40, height: 40, borderRadius: 20 }}
        className="border-2 border-gray-900 bg-white"
      /> */}
      {renderCoinIcon(t.icon, 40, 40)}
    </TouchableOpacity>
  );
};

/**
 *
 * @param {{stakingData:TokenStaking}} param0
 * @returns
 */
const StakingCard = ({ stakingData, onClick }) => {
  const {
    annualRate: apy,
    baseToken,
    otherTokens,
    rewardToken,
    nft,
  } = stakingData;

  const formattedApy = formatApy(apy);
  const tokens = [baseToken, ...otherTokens];
  const symbols = tokens.map((token) => token.symbol);
  const title = symbols.join("/");
  const earn = [...symbols, nft.symbol].join("+");
  const apyValue = parseFloat(apy);
  const apyColor = apyValue < 0 ? "text-red-500" : "text-green-400";

  const chainId = stakingData.getConstantChainId();

  return (
    <View className="rounded-lg bg-[#202126]">
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className="flex-row mr-2">
            {tokens.map((token, index) => (
              <View
                key={index}
                style={{
                  zIndex: tokens.length - index,
                  marginLeft: -index * 10,
                }}
              >
                <StakingTokenIcon token={token} />
              </View>
            ))}
          </View>
          <Text className="text-lg font-bold text-white">{title}</Text>
        </View>
        <View style={{ gap: 20 }}>
          <ContentLayout title="Interest">
            <Text className={`text-2xl font-bold ${apyColor}`}>
              {formattedApy}
            </Text>
          </ContentLayout>

          <ContentLayout title="Earn" content={earn} />

          <ContentLayout title="Network">
            <View className="flex-row items-center">
              {/* <Image
              source={{ uri: renderChainIcon(chainId) }}
              className="w-5 h-5"
            /> */}
              {renderChainIcon(chainId, 20, 20)}
              <Text className="text-white ml-2">
                {renderChainName(chainId)}
              </Text>
            </View>
          </ContentLayout>

          <W3Button
            text="Staking"
            onClick={onClick}
            // className="border border-white mt-4 bg-transparent text-white"
            // style={{ borderColor: "white" }}
          />
        </View>
      </View>
    </View>
  );
};

export default StakingCard;
