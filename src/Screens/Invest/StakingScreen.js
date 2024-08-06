import React, { useState } from "react";
import StakingCard from "../../Components/Staking/StakingCard";
import { ScrollView, View, Text } from "react-native";
import {
  TokenStaking,
  useStakingList,
} from "../../services/Web3Service/TokenStakingContract";
import StakingDialog from "../../Components/Staking/StakingDialog";

const StakingScreen = () => {
  const [accountInfo, loading, stakingList] = useStakingList();

  console.log("accountInfo", accountInfo, loading, stakingList);

  // control the dialog open state
  const [open, setOpen] = useState(false);

  const [selectedData, setSelectedData] = useState(null);

  /**
   *
   * @param {TokenStaking} staking
   */
  const test = async (staking) => {
    let r = await staking.approve(staking.baseToken.symbol, 100);
    console.log("approve nexg 100", r);

    for (const key in staking.otherTokens) {
      const t = staking.otherTokens[key];
      const a = staking.getTokenAmount(100, t.symbol);
      r = await staking.approve(t.symbol, a);
      console.log(`approve ${t.symbol} ${a}`, r);
    }
    r = await staking.stake(100);
    console.log(`stake 100`, r);
  };

  // open the dialog and set the selected data
  /**
   *
   * @param {TokenStaking} stakingData
   */
  const handleOpen = (stakingData) => {
    setSelectedData(stakingData);
    setOpen(true);

    // test(stakingData);
  };

  // close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ScrollView className="mt-5">
      {/* <Text className="text-white text-2xl font-bold text-left mb-4">
        One-Click Staking
      </Text> */}
      <View className="flex flex-wrap flex-row justify-between">
        {stakingList?.map((data, index) => (
          <View
            className="w-full sm:w-[48%] md:w-[30%] lg:w-[22%] mb-4"
            key={index}
          >
            <StakingCard stakingData={data} onClick={() => handleOpen(data)} />
          </View>
        ))}
      </View>
      {selectedData && (
        <StakingDialog
          open={open}
          onClose={handleClose}
          stakingData={selectedData}
        />
      )}
    </ScrollView>
  );
};

export default StakingScreen;
