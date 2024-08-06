import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  W3Button,
  W3TokenLabel,
  currentWalletInfo,
  getBalance,
} from "../../services/Web3Service/WalleService";

import { ProgressBar } from "./TokenSaleBoard";
import Contracts from "../../services/Web3Service/Contracts";
import { formatEther } from "ethers";
import { renderCoinIcon, renderTotoalRaised } from "../../utils/render";
import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";

const StakeCap = 10000;

const TokenSaleModal = ({ open, onClose, data }) => {
  const { fundraisingGoal, saleInfo, TicketAndStakingContract } = data;
  const [tokenSaleInfo, setTokenSaleInfo] = useState(saleInfo);

  const [approvalLoading, setApprovalLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [stakeSuccess, setStakeSuccess] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const [approvalAlert, setApprovalAlert] = useState(null);
  const [stakeAlert, setStakeAlert] = useState(null);
  const [buyAlert, setBuyAlert] = useState(null);

  const [approveBalance, setApproveBalance] = useState(0);
  const [stakeBalance, setStakeBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(100);

  const accountInfo = useWeb3ModalAccount();

  const cap = StakeCap - tokenSaleInfo.myStaking;
  const min = cap > 100 ? 100 : cap;

  const resetState = () => {
    setApprovalLoading(false);
    setStakeLoading(false);
    setBuyLoading(false);
    setApprovalSuccess(false);
    setStakeSuccess(false);
    setBuySuccess(false);
    setApprovalAlert(null);
    setStakeAlert(null);
    setBuyAlert(null);
  };

  useEffect(() => {
    console.log("=====open======", open);
    if (!open) {
      resetState();
    } else {
      const nexg = Contracts.get("NEXG");
      const nexu = Contracts.get("NEXU");
      const walletInfo = currentWalletInfo();
      getBalance(nexg, walletInfo.address, 2).then((r) =>
        setApproveBalance(parseFloat(r))
      );
      getBalance(nexu, walletInfo.address, 2).then((r) =>
        setStakeBalance(parseFloat(r))
      );
    }
  }, [open]);

  useEffect(() => {
    setTokenSaleInfo(saleInfo);
    if (saleInfo.myStaking >= StakeCap) {
      setApprovalSuccess(false);
      setApprovalAlert({
        severity: "error",
        message: "You've reached the stake cap",
      });
    }
  }, [saleInfo]);

  const approveNexg = async () => {
    setApprovalLoading(true);

    if (approveBalance < 100) {
      setApprovalAlert({
        severity: "error",
        message: "Insufficient NEXG balance",
      });
      setApprovalLoading(false);
      return;
    }

    setApprovalAlert({
      severity: "info",
      message: "Requesting for approval 100 NEXG...",
    });

    const r = await TicketAndStakingContract.approveTicket(100);
    setApprovalLoading(false);
    if (r.success) {
      setApprovalSuccess(true);
      setApprovalAlert({ severity: "success", message: "Approved!" });
    } else {
      setApprovalAlert({
        severity: "error",
        message: r.error,
      });
    }
  };

  const approveStake = async () => {
    const cap = StakeCap - tokenSaleInfo.myStaking;
    const min = cap > 100 ? 100 : cap;
    if (stakeAmount < min || stakeAmount > cap) {
      setStakeAlert({
        severity: "error",
        message: `Stake amount must be between ${min} and ${cap}`,
      });
      return;
    }

    if (stakeAmount > stakeBalance) {
      setStakeAlert({
        severity: "error",
        message: "Insufficient NEXU balance",
      });
      return;
    }

    setStakeLoading(true);
    setStakeAlert({
      severity: "info",
      message: `Requesting for approval ${stakeAmount} NEXU`,
    });

    const r = await TicketAndStakingContract.approveStake(stakeAmount);
    setStakeLoading(false);

    if (r.success) {
      setStakeSuccess(true);
      setStakeAlert({ severity: "success", message: "Approved!" });
    } else {
      setStakeAlert({
        severity: "error",
        message: r.error,
      });
    }
  };

  const doStake = async () => {
    setBuyLoading(true);
    setBuyAlert({ severity: "info", message: "Processing contract..." });

    const r = await TicketAndStakingContract.stake(stakeAmount);

    setBuyLoading(false);
    if (r.success) {
      setBuySuccess(true);

      const info = await TicketAndStakingContract.getStakingInfo();
      const myStaking = formatEther(info[2]).toString();

      setTokenSaleInfo({
        totalRaised: parseFloat(formatEther(info[0])),
        participantCount: parseInt(info[1]),
        myStaking: myStaking,
        claimed: r[3],
      });

      setBuyAlert({
        severity: "success",
        message: "Successful!",
      });
    } else {
      setBuyAlert({
        severity: "error",
        message: r.error,
      });
    }
  };

  const ClaimInfo = () => {
    const nexu = Contracts.get("NEXU");
    const mvt = Contracts.get("MVT");

    return tokenSaleInfo.myStaking > 0 && accountInfo.isConnected ? (
      <View className="flex flex-col">
        <Text>After the IDO is ended, you can claim:</Text>
        <View className="items-center flex">
          <W3TokenLabel amount={tokenSaleInfo.myStaking} token={nexu} />
        </View>
        <View className="items-center flex">
          <W3TokenLabel
            amount={tokenSaleInfo.myStaking * 20 * 0.1}
            token={mvt}
          />
        </View>
        <View className="items-center justify-center flex">
          12 months vesting, release&nbsp;&nbsp;
          <W3TokenLabel
            amount={(tokenSaleInfo.myStaking * 20 * 0.9) / 12}
            token={mvt}
          />
          &nbsp;monthly
        </View>
      </View>
    ) : (
      <></>
    );
  };

  const handleApprove = () => {
    approveNexg();
  };

  const handleStakeApprove = () => {
    approveStake();
  };

  const handleBuy = () => {
    doStake();
  };

  const AlertMessage = ({ alert }) => {
    let alertDom = <></>;
    console.log("alert:", alert.severity);
    switch (alert.severity) {
      case "info":
        alertDom = (
          <View className="bg-blue-200 p-2 mt-2 rounded">
            <Text className="text-blue-500">{alert.message}</Text>
          </View>
        );
        break;
      case "success":
        alertDom = (
          <View className="bg-green-200 p-2 mt-2 rounded">
            <Text className="text-green-500">{alert.message}</Text>
          </View>
        );
        break;
      case "error":
        alertDom = (
          <View className="bg-red-200 p-2 mt-2 rounded">
            <Text className="text-red-500">{alert.message}</Text>
          </View>
        );
        break;
    }
    return alertDom;
  };

  return (
    <Modal
      visible={open}
      onRequestClose={onClose}
      animationType="fade"
      transparent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View className="p-4 bg-white rounded-lg w-[85vw]">
          <Text className="text-lg font-bold mb-4">Token Sale</Text>
          <View className="mb-4">
            <Text className="uppercase text-gray-500 mb-1">Total Raised</Text>
            <View className="flex-row items-center gap-2">
              {renderCoinIcon("USDT", 25, 25)}
              <Text className="text-xl font-bold">
                {renderTotoalRaised(fundraisingGoal) || "--"} USDT
              </Text>
            </View>
            <ProgressBar
              value={tokenSaleInfo.totalRaised}
              maxValue={fundraisingGoal}
              progressInfo={(v, m) =>
                `${renderTotoalRaised(v, true)}/${renderTotoalRaised(m)} USDT`
              }
            />

            <View className="flex flex-col items-start p-5 rounded-lg bg-gray-200 mt-2">
              <Text>Staked {tokenSaleInfo.myStaking} NEXU</Text>
              <Text className="text-gray-500">
                Stake cap is {StakeCap} NEXU per wallet address.
              </Text>
              <View className="w-full h-[2px] my-2 bg-gray-400" />
              <ClaimInfo />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="uppercase text-gray-500 mb-1">Service Fee</Text>
            <W3TokenLabel amount={100} token={"NEXG"} />
          </View>
          <View className="w-full h-[2px] my-1 bg-gray-400" />
          <Text className="text-gray-500 mb-4 self-end">
            Balance: {approveBalance.toFixed(2)}
          </Text>
          <W3Button
            text={approvalSuccess ? "Approved" : "Approve"}
            loading={approvalLoading}
            disabled={approvalSuccess || tokenSaleInfo.myStaking >= StakeCap}
            onClick={handleApprove}
          />
          {approvalAlert && (
            /* <View className="mt-2">
              <Text className="text-red-500">{approvalAlert.message}</Text>
            </View> */

            <AlertMessage alert={approvalAlert} />
          )}

          {approvalSuccess && (
            <>
              <View className="flex justify-between mt-2">
                <Text className="uppercase text-gray-500 mb-1">
                  Stake ({min}-{cap} NEXU)
                </Text>
                <View className="flex flex-row items-center mb-2">
                  <TextInput
                    className="border p-2 flex-1"
                    keyboardType="number-pad"
                    value={stakeAmount.toString()}
                    onChangeText={(text) => setStakeAmount(parseInt(text))}
                  />
                  {/* <Image
                source={require("./img/nexu.png")}
                style={{ width: 25, height: 25 }}
              /> */}
                  {renderCoinIcon("NEXU", 25, 25)}
                  <Text className="text-xl">NEXU</Text>
                </View>
                <Text className="text-gray-500 mb-4">
                  Balance: {stakeBalance.toFixed(2)}
                </Text>
              </View>
              <W3Button
                text={stakeSuccess ? "Approved" : "Approve"}
                loading={stakeLoading}
                disabled={stakeSuccess}
                onClick={handleStakeApprove}
              />
            </>
          )}

          {stakeAlert && (
            /* <View className="mt-2">
              <Text className="text-red-500">{stakeAlert.message}</Text>
            </View> */
            <AlertMessage alert={stakeAlert} />
          )}
          {stakeSuccess && (
            <View className="mt-2">
              <W3Button
                text="Buy"
                loading={buyLoading}
                onClick={handleBuy}
                disabled={buySuccess}
              />
            </View>
          )}
          {/* <View className="mt-2">
              <Text className="text-red-500">{buyAlert.message}</Text>
            </View> */}
          {buyAlert && <AlertMessage alert={buyAlert} />}
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 font-bold mt-4 uppercase self-end">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TokenSaleModal;
