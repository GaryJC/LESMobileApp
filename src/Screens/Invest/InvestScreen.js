import { View, Text, ScrollView } from "react-native";
import TabButton from "../../Components/TabButton";
import { useState } from "react";
import WalletScreen from "./WalletScreen";
import StakingScreen from "./StakingScreen";

const Tab = {
  Staking: "Staking",
  Wallet: "Wallet",
};

const InvestScreen = () => {
  const [selectedTab, setSelectedTab] = useState(Tab.Staking);

  const switchTabHandler = (type) => {
    setSelectedTab(type);
  };

  return (
    <View className="px-[5vw] h-full">
      <Text>InvestScreen</Text>
      <View className="flex-row justify-between bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TabButton
          title={"Staking"}
          selectedTab={selectedTab}
          type={Tab.Staking}
          handler={switchTabHandler}
        />
        <TabButton
          title={"Wallet"}
          selectedTab={selectedTab}
          type={Tab.Wallet}
          handler={switchTabHandler}
        />
      </View>
      {selectedTab === Tab.Staking ? (
        <StakingScreen />
      ) : (
        <View className="h-[70vh]">
          <WalletScreen />
        </View>
      )}
    </View>
  );
};

export default InvestScreen;
