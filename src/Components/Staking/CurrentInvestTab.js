import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { NetworkLayout } from "./InvestTab";
// import { TimeCountDownBlock } from "../launchpad/[launchItemSlug]/CountdownBoard";
import { TimeCountDownBlock } from "../Launchpad/CountdownBoard";
import { formatUnits } from "ethers";
import Contracts from "../../services/Web3Service/Contracts";
import StakingIntro from "./StakingIntro";
import useTimeLeft from "../Launchpad/useTimeLeft";
import JSEvent from "../../utils/JSEvent";
import { DataEvents } from "../../modules/Events";
import { W3TxHashLabel } from "../../services/Web3Service/WalleService";

const ClaimState = {
  Success: "You have claimed successfully",
  Fail: "Claim failed",
};

const CurrentInvestTab = ({ staking, networkChainId, chainIdMatch }) => {
  const { baseToken, otherTokens } = staking || {};

  const [loading, setLoading] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState(null);
  const [allTokensWithAmount, setAllTokensWithAmount] = useState([]);
  const [countDownTime, setCountDownTime] = useState(null);
  const [hash, setHash] = useState(null);

  useEffect(() => {
    const fetchStakingInfo = async () => {
      try {
        const info = await staking.getStakingInfo();
        setCountDownTime((Number(info.startTime) + staking.minDuration) * 1000);

        const allTokensWithAmount = [baseToken, ...otherTokens].map(
          (token, index) => {
            const curToken = Contracts.get(token.symbol);
            const amount = parseFloat(
              formatUnits(info.amounts[index], curToken.decimals)
            ).toFixed(2);
            return {
              symbol: token.symbol,
              amount: amount,
            };
          }
        );
        setAllTokensWithAmount(allTokensWithAmount);
      } catch (e) {
        console.log("CurrentInvestTab error: ", e);
      }
    };

    if (staking) {
      fetchStakingInfo();
    }

    JSEvent.on(DataEvents.Staking.StakingState_Updated, fetchStakingInfo);

    return () => {
      JSEvent.remove(DataEvents.Staking.StakingState_Updated, fetchStakingInfo);
    };
  }, [staking, baseToken, otherTokens, chainIdMatch]);

  const timeLeft = useTimeLeft(countDownTime);
  const { days, hours, minutes, seconds } = timeLeft;

  // Check whether all tokens' amounts are 0
  const isAllTokensEmpty = useMemo(
    () => allTokensWithAmount.every((token) => token.amount == 0.0),
    [allTokensWithAmount]
  );

  console.log("chain id match: ", chainIdMatch, isAllTokensEmpty);

  const claimHandler = useCallback(async () => {
    setLoading(true);
    try {
      const r = await staking.claim();
      if (r.success) {
        setClaimFeedback(ClaimState.Success);
        setHash(r.txHash);
      } else {
        setClaimFeedback(r.error);
      }
      console.log("claimHandler: ", r);
    } catch (e) {
      console.log("claimHandler error: ", e);
      setClaimFeedback(e.message);
    }
    setLoading(false);
  }, [staking]);

  // Check if the countdown is complete
  const isTimeUp = useMemo(
    () => days === 0 && hours === 0 && minutes === 0 && seconds === 0,
    [days, hours, minutes, seconds]
  );

  return (
    <View className="space-y-2">
      {!chainIdMatch || isAllTokensEmpty ? (
        <View className="p-4 bg-blue-200 rounded">
          <Text className="text-blue-800">
            {!chainIdMatch
              ? "Please switch to the correct network"
              : "You do not have any investments yet"}
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          <StakingIntro
            staking={staking}
            allTokens={allTokensWithAmount}
            withTime={false}
          />

          <View>
            <NetworkLayout networkChainId={networkChainId} />
          </View>

          <View>
            <Text className="text-lg">You will be able to claim after:</Text>
            <View className="flex flex-row justify-between my-1">
              <TimeCountDownBlock time={days} type={"Days"} />
              <TimeCountDownBlock time={hours} type={"Hours"} />
              <TimeCountDownBlock time={minutes} type={"Mins"} />
              <TimeCountDownBlock time={seconds} type={"Sec"} />
            </View>
          </View>
          <TouchableOpacity
            className={`w-full py-2 rounded ${
              loading || !isTimeUp ? "bg-gray-300" : "bg-blue-500"
            }`}
            onPress={claimHandler}
            disabled={!isTimeUp}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center">Claim</Text>
            )}
          </TouchableOpacity>
          {claimFeedback && (
            <View
              className={`p-4 mt-2 rounded ${
                claimFeedback === ClaimState.Success
                  ? "bg-green-200"
                  : "bg-red-200"
              }`}
            >
              <Text
                className={`text-center ${
                  claimFeedback === ClaimState.Success
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {claimFeedback}
                {hash && (
                  <W3TxHashLabel txHash={hash} label={"Transaction Hash:"} />
                )}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CurrentInvestTab;
