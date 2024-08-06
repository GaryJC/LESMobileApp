import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { W3Button } from "../../services/Web3Service/WalleService";
import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import w3Modal from "../../services/Web3Service/InitWalletConnect";
import InvestTab from "./InvestTab";
import CurrentInvestTab from "./CurrentInvestTab";
import { AntDesign } from "@expo/vector-icons"; // Assuming you are using Expo

const TabName = {
  Invest: 0,
  CurrentInvestment: 1,
};

const StakingDialog = ({ open, onClose, stakingData }) => {
  const networkChainId = stakingData?.getConstantChainId();
  const [tabValue, setTabValue] = useState(TabName.Invest);
  const accountInfo = useWeb3ModalAccount();
  const { chainId } = accountInfo;
  const stakingChainId = stakingData?.chainId;
  const chainIdMatch = chainId === stakingChainId;

  const closeHandler = () => {
    onClose();
  };

  const switchNetworkHandler = async () => {
    try {
      await w3Modal.switchNetwork(stakingChainId);
    } catch (e) {
      console.log("switch network error", e);
    }
  };

  const handleTabChange = (newValue) => {
    console.log("handleTabChange", newValue);
    setTabValue(newValue);
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      onRequestClose={closeHandler}
      animationType="fade"
      // onDismiss={closeHandler}
      // contentContainerStyle={{ backgroundColor: "white", padding: 20 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View className="bg-white rounded-lg w-[85vw] p-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Staking</Text>
            {/* <IconButton
          icon={() => <AntDesign name="close" size={24} color="gray" />}
          onPress={closeHandler}
        /> */}
          </View>

          <View className="flex-row justify-around mb-4">
            <TouchableOpacity onPress={() => handleTabChange(TabName.Invest)}>
              <Text
                className={`text-lg ${
                  tabValue === TabName.Invest ? "text-black" : "text-gray-500"
                }`}
              >
                Invest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange(TabName.CurrentInvestment)}
            >
              <Text
                className={`text-lg ${
                  tabValue === TabName.CurrentInvestment
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Current Investment
              </Text>
            </TouchableOpacity>
          </View>

          {tabValue === TabName.Invest && (
            <InvestTab
              stakingData={stakingData}
              chainIdMatch={chainIdMatch}
              networkChainId={networkChainId}
              accountInfo={accountInfo}
            />
          )}

          {tabValue === TabName.CurrentInvestment && (
            <CurrentInvestTab
              staking={stakingData}
              networkChainId={networkChainId}
              chainIdMatch={chainIdMatch}
            />
          )}

          <View className="mt-4">
            {!chainIdMatch && (
              <W3Button
                onPress={switchNetworkHandler}
                text={"Switch Network"}
                className="w-full"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StakingDialog;
