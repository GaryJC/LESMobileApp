import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import Constants from "../modules/Constants";

export const renderPlatformIcon = (platform, size) => {
  switch (platform) {
    case Constants.PlatformId.Android:
      return <Ionicons name="logo-android" size={size} color="white" />;
    case Constants.PlatformId.IOS:
      return <Ionicons name="logo-apple" size={size} color="white" />;
    case Constants.PlatformId.Mac:
      return <Ionicons name="laptop-outline" size={size} color="white" />;
    case Constants.PlatformId.PCWIN:
      return <Ionicons name="logo-windows" size={size} color="white" />;
    case Constants.PlatformId.Web:
      return <Ionicons name="browsers-outline" size={suze} color="white" />;
    default:
      return <Ionicons name="ellipsis-horizontal" size={size} color="white" />;
  }
};

export const renderCommunityIcon = (socialId, size) => {
  switch (socialId) {
    case Constants.SocialId.Discord:
      return <MaterialIcons name="telegram" size={24} color="white" />;
    case Constants.SocialId.Telegram:
      return <MaterialIcons name="telegram" size={24} color="white" />;
    case Constants.SocialId.Twitter:
      return <FontAwesome name="twitter" size={24} color="white" />;
    default:
      return <Ionicons name="browsers-outline" size={size} color="white" />;
  }
};

export const renderPrice = (price) => {
  return !price ? "TBA" : `${price / 10 ** 6} USDT`;
};

export const renderTotoalRaised = (totalRaised, showZero = false) => {
  if (!totalRaised && !showZero) {
    return "TBA";
  } else {
    const original = totalRaised.toLocaleString("en-us", {
      style: "currency",
      currency: "USD",
    });
    return original.substring(0, original.lastIndexOf("."));
  }
};

// export const renderChainIcon = (chain) => {
//   switch (chain) {
//     case Constants.ChainID.Polygon:
//       return require("../../assets/img/chain/eth.svg");
//     case Constants.ChainID.Eth:
//       return require("../../assets/imgchain/eth.svg");
//     case Constants.ChainID.Avalanche:
//       return require("../../assets/img/chain/avalanche.svg");
//     case Constants.ChainID.BNB:
//       return require("../../assets/img/chain/bnb.svg");
//     default:
//       "";
//   }
// };
