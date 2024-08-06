import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { ContentLayout } from "./StakingCard";
import { renderChainIcon, renderChainName } from "../../utils/render";
import StakingIntro from "./StakingIntro"; // Ensure StakingIntro is correctly imported
import Contracts from "../../services/Web3Service/Contracts";
import { getBalance } from "../../services/Web3Service/WalleService";
import { W3TxHashLabel } from "../../services/Web3Service/WalleService";
import JSEvent from "../../utils/JSEvent";
import { DataEvents } from "../../modules/Events";

const ApproveState = {
  Success: "Approved",
};

const StakeState = {
  Success: "Stake success",
};

const TokenBalance = ({ tokenBalance, token }) => (
  <Text className="text-gray-500 text-right">
    Balance:
    {" " + tokenBalance?.find((t) => t.name === token.symbol)?.balance || 0}
  </Text>
);

const TokenLayout = ({
  onChangeHandler,
  tokenBalance,
  token,
  handleApprove,
  loading,
  approvingToken,
  baseTokenAmount,
  tokenApproved,
  label,
  chainIdMatch,
  minValue = undefined,
  disabled = false,
}) => (
  <View>
    <Text className="text-gray-500 mb-2">{label || "Base Token Amount"}</Text>
    <View className="flex-row gap-5">
      <View className="flex-1">
        <TextInput
          onChangeText={onChangeHandler}
          // placeholder={label || "Base Token Amount"}
          className="w-full text-right border-b border-gray-300"
          keyboardType="numeric"
          value={baseTokenAmount ? baseTokenAmount.toString() : ""}
          editable={!disabled}
        />
        <TokenBalance tokenBalance={tokenBalance} token={token} />
      </View>
      <TouchableOpacity
        onPress={() => handleApprove(token)}
        disabled={
          !chainIdMatch ||
          baseTokenAmount < minValue ||
          tokenApproved[token?.symbol] === ApproveState.Success ||
          loading
        }
        className={`self-center w-2/5 py-2 rounded ${
          loading && approvingToken === token?.symbol
            ? "bg-gray-300"
            : "bg-blue-500"
        }`}
      >
        <Text className="text-white text-center">
          {loading && approvingToken === token?.symbol
            ? "Loading..."
            : "Approve"}
        </Text>
      </TouchableOpacity>
    </View>

    {tokenApproved[token?.symbol] !== undefined && (
      <View
        className={`p-2 mt-2 rounded ${
          tokenApproved[token.symbol] !== ApproveState.Success
            ? "bg-red-200"
            : "bg-green-200"
        }`}
      >
        <Text
          className={`text-center ${
            tokenApproved[token.symbol] !== ApproveState.Success
              ? "text-red-800"
              : "text-green-800"
          }`}
        >
          {tokenApproved[token.symbol]}
        </Text>
      </View>
    )}
  </View>
);

export const NetworkLayout = ({ networkChainId }) => (
  <ContentLayout title="Network">
    <View className="flex-row items-center gap-2">
      {/* <Image
        source={{ uri: renderChainIcon(networkChainId) }}
        className="w-5 h-5"
        alt={`${renderChainName(networkChainId)} icon`}
      /> */}
      {renderChainIcon(networkChainId, 20, 20)}
      <Text>{renderChainName(networkChainId)}</Text>
    </View>
  </ContentLayout>
);

const updateBalance = async (
  baseToken,
  otherTokens,
  address,
  setTokenBalance,
  isConnected
) => {
  if (!isConnected) return;
  const baseTokenContract = Contracts.get(baseToken.symbol);
  const otherTokenContracts = otherTokens.map((token) =>
    Contracts.get(token.symbol)
  );

  try {
    const baseTokenBalance = {
      name: baseTokenContract.name,
      balance: await getBalance(baseTokenContract, address),
    };
    const otherTokenBalances = await Promise.all(
      otherTokenContracts.map(async (contract) => ({
        name: contract.name,
        balance: await getBalance(contract, address),
      }))
    );
    setTokenBalance([baseTokenBalance, ...otherTokenBalances]);
  } catch (e) {
    console.error("Error updating balance", e);
  }
};

const InvestTab = ({
  stakingData,
  chainIdMatch,
  networkChainId,
  accountInfo,
  //   resetState,
}) => {
  const { baseToken, otherTokens } = stakingData || {};

  const { chainId, address, isConnected } = accountInfo;

  const [localBaseTokenAmount, setLocalBaseTokenAmount] = useState(
    stakingData?.minStakingAmount
  );
  const [tokenBalance, setTokenBalance] = useState([]);
  const [localOtherTokenWithAmount, setLocalOtherTokenWithAmount] =
    useState(otherTokens);
  const [loading, setLoading] = useState(false);
  const [tokenApproved, setTokenApproved] = useState({});
  const [approvingToken, setApprovingToken] = useState(null);
  const [stakeState, setStakeState] = useState(false);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [stakingResult, setStakingResult] = useState(null);
  const [hash, setHash] = useState(null);

  // variables for StakingIntro
  const allTokens = [
    { ...baseToken, amount: localBaseTokenAmount },
    ...localOtherTokenWithAmount,
  ];

  const handleBaseTokenAmountChange = (value) => {
    setLocalBaseTokenAmount(value);
    updateOtherTokenWithAmount(value);
  };

  const updateOtherTokenWithAmount = (baseTokenAmount) => {
    const otwa = otherTokens?.map((token) => ({
      ...token,
      amount: stakingData.getTokenAmount(baseTokenAmount, token.symbol),
    }));
    setLocalOtherTokenWithAmount(otwa);
  };

  useEffect(() => {
    if (baseToken && otherTokens && isConnected) {
      updateBalance(
        baseToken,
        otherTokens,
        address,
        setTokenBalance,
        isConnected
      );
      updateOtherTokenWithAmount(localBaseTokenAmount);
    }
  }, [
    baseToken,
    otherTokens,
    localBaseTokenAmount,
    isConnected,
    chainId,
    address,
  ]);

  const handleApprove = async (token) => {
    const isBaseToken = token.symbol === baseToken.symbol;
    const curTokenBalance = parseFloat(
      tokenBalance.find((t) => t.name === token.symbol)?.balance || 0
    );

    setApprovingToken(token.symbol);
    if (
      curTokenBalance <
      (isBaseToken
        ? parseFloat(localBaseTokenAmount)
        : parseFloat(token.amount))
    ) {
      setTokenApproved((prev) => ({
        ...prev,
        [token.symbol]: `Insufficient ${token.symbol} balance`,
      }));
      return;
    }

    setLoading(true);
    try {
      const response = await stakingData.approve(
        token.symbol,
        isBaseToken ? localBaseTokenAmount : token.amount
      );
      setTokenApproved((prev) => ({
        ...prev,
        [token.symbol]: response.success
          ? ApproveState.Success
          : response.error,
      }));
    } catch (e) {
      setTokenApproved((prev) => ({
        ...prev,
        [token.symbol]: e.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  const onStakeHandler = async () => {
    setStakingLoading(true);
    try {
      const r = await stakingData.stake(localBaseTokenAmount);
      if (r.success) {
        setStakingResult(StakeState.Success);
        setHash(r.txHash);
        setTokenApproved({});
        JSEvent.emit(DataEvents.Staking.StakingState_Updated);
      } else {
        setStakingResult(r.error);
      }
    } catch (e) {
      console.log("stake error", e);
    }
    setStakingLoading(false);
  };

  useEffect(() => {
    if (baseToken && otherTokens) {
      if (
        [baseToken, ...otherTokens].some(
          (token) => tokenApproved[token.symbol] !== ApproveState.Success
        )
      ) {
        setStakeState(false);
        return;
      }
      setStakeState(true);
    }
  }, [tokenApproved, baseToken, otherTokens]);

  return (
    <View className="space-y-4">
      {!chainIdMatch ? (
        <View className="p-4 bg-blue-200 rounded">
          <Text className="text-blue-800">
            Please switch to the correct network to stake
          </Text>
        </View>
      ) : (
        <>
          <StakingIntro staking={stakingData} allTokens={allTokens} />
          <View style={{ gap: 10 }}>
            <TokenLayout
              onChangeHandler={handleBaseTokenAmountChange}
              token={baseToken}
              baseTokenAmount={localBaseTokenAmount}
              tokenBalance={tokenBalance}
              handleApprove={handleApprove}
              loading={loading}
              approvingToken={approvingToken}
              tokenApproved={tokenApproved}
              chainIdMatch={chainIdMatch}
              minValue={stakingData?.minStakingAmount}
            />

            {localOtherTokenWithAmount?.map((token, index) => (
              <TokenLayout
                onChangeHandler={() => {}}
                token={token}
                baseTokenAmount={token.amount}
                tokenBalance={tokenBalance}
                handleApprove={handleApprove}
                loading={loading}
                approvingToken={approvingToken}
                tokenApproved={tokenApproved}
                disabled={true}
                label={`${token.symbol} Amount`}
                chainIdMatch={chainIdMatch}
                key={index}
              />
            ))}
          </View>
          <View className="mt-4">
            <NetworkLayout networkChainId={networkChainId} />
          </View>

          <View>
            <TouchableOpacity
              onPress={onStakeHandler}
              disabled={!stakeState || stakingLoading}
              className={`w-full py-2 rounded ${
                !stakeState || stakingLoading ? "bg-gray-300" : "bg-blue-500"
              }`}
            >
              <Text className="text-white text-center">
                {stakingLoading ? "Loading..." : "Stake"}
              </Text>
            </TouchableOpacity>
          </View>

          {stakingResult && (
            <View
              className={`p-4 mt-2 rounded ${
                stakingResult === StakeState.Success
                  ? "bg-green-200"
                  : "bg-red-200"
              }`}
            >
              <Text
                className={`text-center ${
                  stakingResult === StakeState.Success
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {stakingResult}
                {hash && (
                  <W3TxHashLabel txHash={hash} label={"Transaction Hash:"} />
                )}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default InvestTab;
