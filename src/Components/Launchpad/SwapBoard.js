import React, { useEffect, useState, useMemo, memo, useCallback } from "react";
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
import WebView from "react-native-webview";
// import Contracts from "../../services/Web3Service/Contracts";
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

const PaypalApi = API.PaypalApi;

// const USD = {
//   name: "USD",
//   type: "Currency",
//   icon: "/img/usd.svg",
// };

// const CoinsFrom = {
//   USDT: Contracts.get("USDT"),
//   USD,
// };

const SwapBoard = ({ data }) => {
  //   const [fromToken, setFromToken] = useState("USDT");

  //   const [swapTip, setSwapTip] = useState("");

  //   const [toToken, setToToken] = useState("NEXU");

  //   const [loading, setLoading] = useState(false);

  //   //   const accountInfo = useWeb3ModalAccount();

  //   const [tokenBalance, setTokenBalance] = useState({});

  //   const [payAmount, setPayAmount] = useState("");

  //   const [buyAmount, setBuyAmount] = useState("");

  //   const [swapRatio, setSwapRatio] = useState(1); // Default ratio is 1:1

  //   const [alertMessage, setAlertMessage] = useState("");

  //   const [alertSeverity, setAlertSeverity] = useState("error");

  //   //   const [userInfo, isLoggedIn] = useAccount();

  //   const { phase } = data.idoInfo;

  /*

  // 获取活动阶段的索引，目前根据标题为"Buy NUEX"来判断
  const activityPhaseIndex = useMemo(() => {
    return data.idoInfo.phase.findIndex((phase) => {
      return phase.title === "Buy NEXU";
    });
  }, [data.idoInfo.phase]);

  useEffect(() => {
    // refreshSwapTip();
    // updateBalance();
  }, [
    fromToken,
    toToken,
    accountInfo.isConnected,
    accountInfo.chainId,
    swapRatio,
  ]);

  const createOrder = async () => {
    console.log("createorder===", buyAmount);
    const walletInfo = currentWalletInfo();
    const resp = await axios.get(
      PaypalApi.createOrder(
        walletInfo.address,
        walletInfo.chainId,
        "NEXU",
        buyAmount
      )
    );
    return resp.data.order_id;
  };

  const onApprove = async (data) => {
    console.log("order approved:", data, data.orderID);
    const resp = await axios.get(PaypalApi.confirmOrder(data.orderID));
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

    console.log("---------", ft, tt);

    const walletInfo = currentWalletInfo();
    let fb = 0;
    let tb = 0;
    if (walletInfo.isConnected) {
      if (ft == null) {
        fb = 0;
      } else {
        fb = await getBalance(ft, walletInfo.address);
      }
      tb = await getBalance(tt, walletInfo.address);
    }
    const b = { ...tokenBalance };
    b[fromToken] = fb;
    b[toToken] = tb;
    setTokenBalance(b);
  };

  const refreshSwapTip = () => {
    const tf = CoinsFrom[fromToken];
    const tt = Contracts.get(toToken);
    const tip = (
      <div className="flex flex-row">
        <W3TokenLabel amount={1} token={tf} />
        =
        <W3TokenLabel amount={swapRatio} token={tt} />
      </div>
    );
    setSwapTip(tip);
  };

  const handleFromTokenChange = (event) => {
    setFromToken(event.target.value);
  };

  const handleToTokenChange = (event) => {
    setToToken(event.target.value);
  };

  const handlePayAmountChange = (event) => {
    // bug: does not allow to delete the last number
    // const value = parseInt(event.target.value, 10);
    const value = event.target.value;
    if (!isNaN(value) && value >= 0) {
      setPayAmount(value);
      setBuyAmount(value * swapRatio); // Update buy amount based on swap ratio
    }
  };

  const handleBuyAmountChange = (event) => {
    const value = event.target.value;
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
    // if (buyAmount > tokenBalance[toToken]) {
    //   setAlertMessage("Insufficient " + toToken + " balance");
    //   setAlertSeverity("error");
    //   return false;
    // }
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

  const getswapMenu = () => {
    return Object.entries(CoinsFrom).map(([k, v]) => (
      <MenuItem key={v.name} value={v.name}>
        <Image
          src={v.icon}
          width={25}
          height={25}
          className="mr-2 object-contain"
          alt={v.name}
        />
        {v.name}
      </MenuItem>
    ));
  };

  //   const toTokenContract = Contracts.get("NEXU");

  const {
    isActionDisabled = false,
    typoTime,
    color,
    status,
  } = usePhaseTiming(phase, activityPhaseIndex);
    */
  return <></>;
};
export default SwapBoard;
