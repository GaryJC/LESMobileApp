import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, ScrollView, Button } from "react-native";
// import { LinearProgress } from '@react-native-material/core';
// import TokenSaleModal from './TokenSaleModal'; // 确保这个组件已经适配React Native
// import ClaimModal from './ClaimModal'; // 确保这个组件已经适配React Native
// import { getContract } from './Web3Service/WalleService'; // 适配这个导入到你的项目结构
import { getContract, W3Button } from "../../services/Web3Service/WalleService";
import usePhaseTiming from "./usePhaseTiming";
import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import Contracts from "../../services/Web3Service/Contracts";
import { renderPrice, renderTotoalRaised } from "../../utils/render";
import TokenSaleModal from "./TokenSaleModa";

const ItemLayout = ({ title, val }) => (
  <View className="flex-row justify-between">
    <Text className="text-gray-500">{title}</Text>
    <Text>{val}</Text>
  </View>
);

export const ProgressBar = ({
  value,
  maxValue,
  decimals = 2,
  progressInfo,
}) => {
  const percent =
    value == 0 ? 0 : ((value * 100.0) / maxValue).toFixed(decimals);
  return (
    <View>
      {/* <LinearProgress
        variant="determinate"
        value={parseInt(percent)}
        style={tw`h-4 rounded-md`}
      /> */}
      <ItemLayout
        title={`Progress ${percent}%`}
        val={progressInfo(value, maxValue)}
      />
    </View>
  );
};

const TokenSaleBoard = ({ data }) => {
  const { phase } = data.idoInfo;
  const accountInfo = useWeb3ModalAccount();

  const activityPhaseIndex = useMemo(() => {
    return phase.findIndex((phase) => phase.title === "Token Sale");
  }, [phase]);

  const { idoInfo } = data;
  const { isActionDisabled, typoTime, color, status } = usePhaseTiming(
    phase,
    activityPhaseIndex
  );

  const getPhaseContract = () => {
    const contract = idoInfo.contract.find(
      (c) => c.name == idoInfo.phase[activityPhaseIndex].contract
    );
    return getContract(contract?.name, contract?.address);
  };

  const TicketAndStakingContract = getPhaseContract();

  const updateSaleInfo = async () => {
    if (!accountInfo.isConnected) return;
    const r = await TicketAndStakingContract.getStakingInfo();
    setSaleInfo({
      totalRaised: parseFloat(formatEther(r[0])),
      participantCount: parseInt(r[1]),
      myStaking: parseFloat(formatEther(r[2])),
      claimed: r[3],
    });
  };

  const [open, setOpen] = useState(false);
  const [saleInfo, setSaleInfo] = useState({
    totalRaised: 0,
    participantCount: 0,
    myStaking: 0,
  });

  // claim modal
  const [claimOpen, setClaimOpen] = useState(false);

  const onClaimClose = () => setClaimOpen(false);

  const onClaimOpen = () => setClaimOpen(true);

  useEffect(() => {
    updateSaleInfo();
  }, [accountInfo.isConnected]);

  useEffect(() => {
    const interval = setInterval(updateSaleInfo, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const onClose = () => setOpen(false);

  const onOpen = () => {
    if (status === "Ended") {
      onClaimOpen();
    } else {
      setOpen(true);
    }
  };

  const ClaimInfo = () => {
    const nexu = Contracts.get("NEXU");
    const mvt = Contracts.get("MVT");

    return saleInfo.myStaking > 0 && accountInfo.isConnected ? (
      <View className="mt-4">
        <Text>Staked {saleInfo.myStaking} NEXU</Text>
        <Text>After the IDO is ended, you can claim:</Text>
        <Text>
          {saleInfo.myStaking} {nexu.symbol}
        </Text>
        <Text>
          {saleInfo.myStaking * 20 * 0.1} {mvt.symbol}
        </Text>
        <Text>
          12 months vesting, release {(saleInfo.myStaking * 20 * 0.9) / 12}{" "}
          {mvt.symbol} monthly
        </Text>
      </View>
    ) : null;
  };

  return (
    <ScrollView>
      <View className="p-4 border border-gray-200 rounded-lg bg-white mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`px-2 py-1 rounded-lg ${color} text-white font-bold uppercase`}
          >
            {status}
          </Text>
          <Text className="text-lg font-bold text-[#4893F0] uppercase">
            {phase[activityPhaseIndex].title}
          </Text>
        </View>
        <View>
          <Text className="text-center bg-[#A7AFCF] text-white rounded py-1 mb-4">
            {typoTime}
          </Text>
          <ItemLayout
            title="Fundraising goal: "
            val={renderTotoalRaised(idoInfo.totalRaised)}
          />
          <ItemLayout title="Token Price: " val={renderPrice(idoInfo.price)} />
          {accountInfo.isConnected || saleInfo?.totalRaised > 0 ? (
            <ProgressBar
              value={saleInfo.totalRaised}
              maxValue={idoInfo.totalRaised}
              progressInfo={(v, m) =>
                `${renderTotoalRaised(v, true)}/${renderTotoalRaised(m)} USDT`
              }
            />
          ) : (
            <Text className="text-gray-500 mb-4">
              Connect your wallet to view details
            </Text>
          )}
          <Text className="text-left mb-4">
            Participants: {saleInfo.participantCount}
          </Text>
        </View>
        <ClaimInfo />
        {/* <Button
          title={status === "Ended" ? "Claim" : "Buy"}
          onPress={onOpen}
          disabled={
            status === "Upcoming" ||
            (status !== "Ended" &&
              saleInfo?.totalRaised === idoInfo.totalRaised)
          }
        /> */}
        <W3Button
          text={status == "Ended" ? "Claim" : "Buy"}
          onClick={onOpen}
          disabled={
            status == "Upcoming" ||
            (status != "Ended" &&
              saleInfo != null &&
              idoInfo != null &&
              saleInfo.totalRaised == idoInfo.totalRaised)
          }
        />
      </View>
      <TokenSaleModal
        open={open}
        onClose={onClose}
        data={{
          fundraisingGoal: idoInfo.totalRaised,
          saleInfo,
          TicketAndStakingContract,
        }}
      />
      {/* <ClaimModal claimOpen={claimOpen} onClaimClose={onClaimClose} data={{ saleInfo, TicketAndStakingContract }} /> */}
    </ScrollView>
  );
};

export default TokenSaleBoard;
