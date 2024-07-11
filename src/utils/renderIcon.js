import { Ionicons } from "@expo/vector-icons";
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
