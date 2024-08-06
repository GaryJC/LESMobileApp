import React, {
  useEffect,
  useState,
  useMemo,
  memo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; // Note: You'll need a suitable replacement for PayPal in React Native
// import ArrowDownwardIcon from "react-native-vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import WebView from "react-native-webview";
import Contracts from "../../services/Web3Service/Contracts";
import {
  W3Button,
  getContract,
  currentWalletInfo,
  getBalance,
  W3TxHashLabel,
  waitTransaction,
  W3TokenLabel,
} from "../../services/Web3Service/WalleService";
import { useWeb3ModalAccount } from "@web3modal/ethers-react-native";
import usePhaseTiming from "./usePhaseTiming";
import API from "../../modules/Api";
import axios from "axios";
// // import { useAccount } from "@/src/app/Services/LoginService";
// import USDCoin from "../../../assets/img/coin/usd.svg";
import { renderCoinIcon } from "../../utils/render";
import { SelectBottomSheet } from "../SelectBottomSheet";

const PaypalApi = API.PaypalApi;

const USD = {
  name: "USD",
  type: "Currency",
  //   icon: require("@/assets/usd.png"), // Use a local image or import image from assets
  icon: "/img/usd.svg",
};

const CoinsFrom = {
  USDT: Contracts.get("USDT"),
  USD,
};

const paypalUrl = (orderId) =>
  `https://www.paypal.com/checkoutnow?token=${orderId}`;

const SwapBoard = ({ data }) => {
  const [fromToken, setFromToken] = useState("USDT");
  const [swapTip, setSwapTip] = useState("");
  const [toToken, setToToken] = useState("NEXU");
  const [loading, setLoading] = useState(false);
  const accountInfo = useWeb3ModalAccount();
  const [tokenBalance, setTokenBalance] = useState({});
  const [payAmount, setPayAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [swapRatio, setSwapRatio] = useState(1); // Default ratio is 1:1
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("error");
  // const [approvalUrl, setApprovalUrl] = useState(null);
  const [orderId, setOrderId] = useState(null);
  //   const [userInfo, isLoggedIn] = useAccount();

  const [bottomSheetContent, setBottomSheetContent] = useState(null);

  const bottomSheetRef = useRef(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
  };

  const { phase } = data.idoInfo;
  const activityPhaseIndex = useMemo(
    () => data.idoInfo.phase.findIndex((phase) => phase.title === "Buy NEXU"),
    [data.idoInfo.phase]
  );

  useEffect(() => {
    refreshSwapTip();
    updateBalance();
  }, [
    fromToken,
    toToken,
    accountInfo.isConnected,
    accountInfo.chainId,
    swapRatio,
  ]);

  const createOrder = async () => {
    const walletInfo = currentWalletInfo();
    console.log("walletInfo", walletInfo);
    try {
      const resp = await axios.get(
        PaypalApi.createOrder(
          walletInfo.address,
          walletInfo.chainId,
          "NEXU",
          buyAmount
        )
      );
      console.log("createOrder", resp);
      // setApprovalUrl(paypalUrl(resp.data.order_id));
      setOrderId(resp.data.order_id);
    } catch (e) {
      console.log("createOrder error", e);
    }
  };

  const onApprove = async () => {
    const resp = await axios.get(PaypalApi.confirmOrder(orderId));
    const txHash = resp.data;
    if (txHash != "") {
      setAlertMessage(<W3TxHashLabel label="Waiting Tx:" txHash={txHash} />);
      setAlertSeverity("info");
      await waitTransaction(txHash);
      setAlertMessage(<W3TxHashLabel label="Success" txHash={txHash} />);
      setAlertSeverity("success");
      updateBalance();
    }
  };

  const updateBalance = async () => {
    const ft = Contracts.get(fromToken);
    const tt = Contracts.get(toToken);
    const walletInfo = currentWalletInfo();
    let fb = 0;
    let tb = 0;
    if (walletInfo.isConnected) {
      fb = ft ? await getBalance(ft, walletInfo.address) : 0;
      tb = await getBalance(tt, walletInfo.address);
    }
    setTokenBalance({ ...tokenBalance, [fromToken]: fb, [toToken]: tb });
  };

  const refreshSwapTip = () => {
    const tf = CoinsFrom[fromToken];
    const tt = Contracts.get(toToken);
    setSwapTip(
      <View className="flex-row">
        <W3TokenLabel amount={1} token={tf} />
        <Text> = </Text>
        <W3TokenLabel amount={swapRatio} token={tt} />
      </View>
    );
  };

  const handleFromTokenChange = (token) => setFromToken(token);

  const handleToTokenChange = (token) => setToToken(token);

  const handlePayAmountChange = (value) => {
    if (!isNaN(value) && value >= 0) {
      setPayAmount(value);
      setBuyAmount(value * swapRatio); // Update buy amount based on swap ratio
    }
  };

  const handleBuyAmountChange = (value) => {
    if (!isNaN(value) && value >= 0) {
      setBuyAmount(value);
      setPayAmount(value / swapRatio); // Update pay amount based on swap ratio
    }
  };

  const validateAmounts = () => {
    if (!payAmount || !buyAmount || isNaN(payAmount) || isNaN(buyAmount)) {
      setAlertMessage("Amounts must be valid numbers.");
      setAlertSeverity("error");
      return false;
    }
    if (
      Number.isInteger(parseFloat(payAmount)) === false ||
      Number.isInteger(parseFloat(buyAmount)) === false
    ) {
      setAlertMessage("Amounts must be integer.");
      setAlertSeverity("error");
      return false;
    }
    if (payAmount <= 0 || buyAmount <= 0) {
      setAlertMessage("Amounts must be greater than 0.");
      setAlertSeverity("error");
      return false;
    }
    if (parseInt(payAmount) > parseFloat(tokenBalance[fromToken])) {
      setAlertMessage("Insufficient " + fromToken + " balance");
      setAlertSeverity("error");
      return false;
    }
    setAlertMessage("");
    return true;
  };

  const GetPhaseContract = () => {
    const contract = data.idoInfo.contract.find((c) => {
      return c.name == data.idoInfo.phase[activityPhaseIndex].contract;
    });
    const TokenSwapContract = getContract(contract?.name, contract?.address);
    return TokenSwapContract;
  };

  const handleBuyClick = async () => {
    if (!validateAmounts()) return;

    setLoading(true);
    const ft = fromToken;
    const ftb = parseFloat(payAmount);

    const TokenSwapContract = GetPhaseContract();

    try {
      const tx = await TokenSwapContract.approve(Contracts.get(ft), ftb);
      if (tx !== false) {
        await TokenSwapContract.swap(Contracts.get(fromToken), ftb);
        setAlertMessage("Swap successful!");
        setAlertSeverity("success");
        setTimeout(() => {
          updateBalance();
        }, 1000);
      }
    } catch (error) {
      setAlertMessage("Swap failed. Please try again.");
      setAlertSeverity("error");
      console.error("Swap failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const SwapMenu = () => (
    <View className="bg-gray w-full">
      {Object.entries(CoinsFrom).map(([k, v]) => (
        <TouchableOpacity
          key={v.name}
          onPress={() => {
            handleFromTokenChange(v.name);
            closeBottomSheet();
          }}
          className="flex-row gap-1 justify-center items-center my-2"
        >
          {renderCoinIcon(v.icon)}
          <Text>{v.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const openPayBottomSheet = () => {
    setBottomSheetContent(<SwapMenu />);
    openBottomSheet();
  };

  const openBuyBottomSheet = (token) => {
    const BuyTokenList = () => (
      <TouchableOpacity
        className="flex-row gap-1"
        onPress={() => {
          handleToTokenChange(toTokenContract.name);
          closeBottomSheet();
        }}
      >
        {renderCoinIcon(toTokenContract.icon)}
        <Text>{toTokenContract.name}</Text>
      </TouchableOpacity>
    );

    setBottomSheetContent(<BuyTokenList />);
    openBottomSheet();
  };

  const toTokenContract = Contracts.get("NEXU");

  const {
    isActionDisabled = false,
    typoTime,
    color,
    status,
  } = usePhaseTiming(phase, activityPhaseIndex);

  return (
    <View style={{ padding: 10, backgroundColor: "white", borderRadius: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text
          // style={{
          //   paddingHorizontal: 8,
          //   paddingVertical: 4,
          //   borderRadius: 8,
          //   backgroundColor: color,
          //   color: "white",
          //   fontWeight: "bold",
          // }}
          className={`px-2 py-1 rounded-lg ${color} uppercase text-white font-bold`}
        >
          {status}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#4893F0" }}>
          Buy NEXU
        </Text>
      </View>

      <Text
        style={{
          textAlign: "center",
          backgroundColor: "#A7AFCF",
          color: "white",
          borderRadius: 8,
          padding: 4,
        }}
      >
        {typoTime}
      </Text>
      <View
        style={{
          backgroundColor: "#f0f0f0",
          padding: 10,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "gray" }}>Pay</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderColor: "gray",
              paddingVertical: 4,
            }}
            keyboardType="numeric"
            value={payAmount.toString()}
            onChangeText={handlePayAmountChange}
          />
          {/* <View>{getswapMenu()}</View> */}
          <TouchableOpacity
            onPress={openPayBottomSheet}
            className="flex-row gap-1"
          >
            {renderCoinIcon(fromToken)}
            <Text>{fromToken}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: "right", color: "gray" }}>
          Balance: {tokenBalance[fromToken]}
        </Text>
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          maxHeight: 10,
        }}
      >
        <View style={{ padding: 4, backgroundColor: "white", borderRadius: 8 }}>
          <View
            style={{ padding: 4, backgroundColor: "#f0f0f0", borderRadius: 8 }}
          >
            <AntDesign
              name="arrowdown"
              size={18}
              color="black"
              style={{ minHeight: 20, zIndex: 2 }}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#f0f0f0",
          padding: 10,
          borderRadius: 8,
          zIndex: -1,
        }}
      >
        <Text style={{ color: "gray" }}>Buy</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderColor: "gray",
              paddingVertical: 4,
            }}
            keyboardType="numeric"
            value={buyAmount.toString()}
            onChangeText={handleBuyAmountChange}
          />
          <TouchableOpacity
            // onPress={() => handleToTokenChange(toTokenContract.name)}
            onPress={() => openBuyBottomSheet(toTokenContract)}
            className="flex-row gap-1"
          >
            {renderCoinIcon(toTokenContract.icon)}
            <Text>{toTokenContract.name}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: "right", color: "gray" }}>
          Balance: {tokenBalance[toToken]}
        </Text>
      </View>
      <View style={{ marginTop: 10 }}>{swapTip}</View>
      {alertMessage ? (
        <Text
          style={{
            marginTop: 10,
            color: alertSeverity === "error" ? "red" : "green",
          }}
        >
          {alertMessage}
        </Text>
      ) : null}
      {fromToken === "USD" && !isActionDisabled ? (
        orderId ? (
          <WebView
            source={{ uri: paypalUrl(orderId) }}
            style={{ flex: 1, height: 400 }}
            onNavigationStateChange={async (event) => {
              if (event.url.includes("success")) {
                // const orderId = event.url.split("orderID=")[1];
                await onApprove({ orderID: orderId });
              }
            }}
          />
        ) : (
          <TouchableOpacity
            onPress={createOrder}
            style={{ marginTop: 10 }}
            className="bg-blue-500 p-2 rounded"
          >
            <Text className="text-white text-center font-bold">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                "Create PayPal Order"
              )}
            </Text>
          </TouchableOpacity>
        )
      ) : (
        <W3Button
          text={"buy"}
          style={"w-full bg-blue-500 p-2 rounded mt-2"}
          loading={loading}
          onClick={handleBuyClick}
          disabled={isActionDisabled}
        />
      )}
      <SelectBottomSheet
        bottomSheetRef={bottomSheetRef}
        bottomSheetContent={bottomSheetContent}
      />
    </View>
  );
};

// SwapFeature.displayName = "SwapFeature";

export default SwapBoard;

{
  /* <TouchableOpacity
          onPress={handleBuyClick}
          disabled={isActionDisabled}
          style={{ marginTop: 10 }}
        >
          <Text
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: 10,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            {loading ? <ActivityIndicator color="white" /> : "Buy"}
          </Text>
        </TouchableOpacity> */
}
