import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import Contracts from "../../services/Web3Service/Contracts";
import {
  W3Button,
  W3TokenLabel,
  W3TxHashLabel,
} from "../../services/Web3Service/WalleService";

export default function ClaimModal({ claimOpen, onClaimClose, data }) {
  const { saleInfo, TicketAndStakingContract } = data;
  const [tokenSaleInfo, setTokenSaleInfo] = useState(saleInfo);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");

  const accountInfo = useWeb3ModalAccount();

  useEffect(() => {
    setTokenSaleInfo(saleInfo);
  }, [saleInfo]);

  const handleClaim = () => {
    doClaim();
  };

  const doClaim = async () => {
    setLoading(true);
    setAlertMessage("Waiting...");
    setAlertSeverity("info");
    const tx = await TicketAndStakingContract.claim((state) => {
      const hash = state.txHash;
      setAlertMessage(<W3TxHashLabel label="Waiting for Tx:" txHash={hash} />);
      setAlertSeverity("info");
    });
    if (tx.success) {
      setAlertMessage(<W3TxHashLabel label="Success" txHash={tx.txHash} />);
      setAlertSeverity("success");
      setTokenSaleInfo({ ...tokenSaleInfo, claimed: true });
    } else {
      setAlertMessage(tx.error);
      setAlertSeverity("error");
    }
    setLoading(false);
  };

  const ClaimInfo = () => {
    const nexu = Contracts.get("NEXU");
    const mvt = Contracts.get("MVT");

    return tokenSaleInfo.myStaking > 0 && accountInfo.isConnected ? (
      <View className="flex flex-col">
        <Text>
          {tokenSaleInfo.claimed ? "You've claimed:" : "You can claim:"}
        </Text>
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

  return (
    <Modal
      visible={claimOpen}
      onRequestClose={onClaimClose}
      animationType="slide"
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
        <View className="bg-white rounded-lg w-[65vw] max-w-lg">
          <Text className="text-lg text-center font-bold p-4">Claim</Text>
          <ScrollView className="px-4">
            <View className="flex flex-col items-start p-5 rounded-lg bg-gray-200">
              <View className="flex flex-row">
                <Text className="mr-1">You've staked</Text>
                <W3TokenLabel token={"NEXU"} amount={tokenSaleInfo.myStaking} />
              </View>
              <View className="w-full h-px my-2 bg-gray-400" />
              <ClaimInfo />
            </View>
            {alertMessage ? (
              <View
                className={`mt-2 p-3 rounded ${
                  alertSeverity === "success"
                    ? "bg-green-200"
                    : alertSeverity === "error"
                    ? "bg-red-200"
                    : "bg-yellow-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    alertSeverity === "success"
                      ? "text-green-800"
                      : alertSeverity === "error"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {alertMessage}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          <View className="p-4">
            <W3Button
              text={tokenSaleInfo.claimed ? "Claimed" : "Claim"}
              loading={loading}
              disabled={tokenSaleInfo.claimed}
              onClick={handleClaim}
            />
            {/* <W3Button
              text="Refund"
              loading={loading}
              disabled={tokenSaleInfo.myStaking == 0}
              className="flex-1 ml-2"
              onClick={handleRefund}
            /> */}
            <TouchableOpacity onPress={onClaimClose} className="mt-4 self-end">
              <Text className="text-blue-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loading && (
          <View className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        )}
      </View>
    </Modal>
  );
}
