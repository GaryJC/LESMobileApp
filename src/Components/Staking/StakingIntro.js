import { View, Text } from "react-native";
import { W3TokenLabel } from "../../services/Web3Service/WalleService";

const formatDuration = (minDuration) => {
  const days = minDuration / 86400;
  if (days < 30) {
    return `${parseInt(days)} days`;
  } else {
    const months = days / 30;
    return `${parseInt(months)} months`;
  }
};

const StakingIntro = ({ staking, allTokens, withTime = true }) => {
  const { annualRate, minDuration } = staking;
  // console.log("annual rate:", annualRate);

  // const allTokens = [{ ...baseToken, amount: baseTokenAmount }, ...otherTokens];
  const claimableTokens = allTokens.map((t) => ({
    ...t,
    amount: t.amount * (1 + annualRate / 10000),
  }));

  // console.log("claimableTokens", claimableTokens, allTokens);

  return (
    <View className="flex-col bg-gray-200 p-3 rounded-lg">
      <Text className="font-semibold">Stake:</Text>
      <View className="flex-row justify-evenly items-center my-2">
        {allTokens.map((t, index) => (
          <W3TokenLabel
            amount={parseFloat(t.amount).toFixed(2)}
            token={t.symbol}
            key={index}
          />
        ))}
      </View>

      <View className="w-full h-[2px] my-2 bg-gray-400" />

      <Text className="font-semibold">
        {withTime && (
          <Text className="font-bold">
            After {formatDuration(minDuration)},
          </Text>
        )}{" "}
        you will be able to claim:
      </Text>

      <View className="flex-row justify-evenly items-center my-2">
        {claimableTokens.map((t, index) => (
          <W3TokenLabel
            amount={parseFloat(t.amount).toFixed(2)}
            token={t.symbol}
            key={index}
          />
        ))}
      </View>
    </View>
  );
};

export default StakingIntro;
