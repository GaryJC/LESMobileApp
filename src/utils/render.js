import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import Constants from "../modules/Constants";
import Matic from "../../assets/img/chain/matic.svg";
import Eth from "../../assets/img/chain/eth.svg";
import Avax from "../../assets/img/chain/avax.svg";
import Bnb from "../../assets/img/chain/bnb.svg";
// import USD from "../../assets/img/coin/usd.svg";
import USDT from "../../assets/img/coin/usdt.svg";
import USDC from "../../assets/img/coin/usdc.svg";
import { Image } from "react-native";

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

export const renderCommunityIcon = (socialId) => {
  switch (socialId) {
    case Constants.SocialId.Discord:
      return require("../../assets/img/discord.png");
    case Constants.SocialId.Telegram:
      return require("../../assets/img/telegram.png");
    case Constants.SocialId.Twitter:
      return require("../../assets/img/twitter_X.png");
    default:
      return require("../../assets/img/web.png");
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

export const renderGameStatusName = (status) => {
  switch (status) {
    case Games.Status.Alpha:
      return "Alpha";
    case Games.Status.Beta:
      return "Beta";
    case Games.Status.InDev:
      return "In Development";
    case Games.Status.Playable:
      return "Playable";
    default:
      return "";
  }
};

export const renderGameStatusIcon = (status) => {
  switch (status) {
    case Games.Status.Alpha:
      return "/img/alpha.svg";
    case Games.Status.Beta:
      return "/img/beta.svg";
    case Games.Status.InDev:
      return "/img/indevelopment.svg";
    case Games.Status.Playable:
      return "/img/playable.svg";
    default:
      return "";
  }
};

export const renderGameGenreName = (genre) => {
  switch (genre) {
    case Games.Genre.FPS:
      return "FPS";
    case Games.Genre.RPG:
      return "RPG";
    case Games.Genre.ACTION:
      return "ACTION";
    case Games.Genre.CARD:
      return "CARD";
    case Games.Genre.MMORPG:
      return "MMORPG";
    case Games.Genre.PVP:
      return "PVP";
    case Games.Genre.SHOOTER:
      return "SHOOTER";
    default:
      break;
  }
};

export const renderChainIcon = (chain, w, h) => {
  switch (chain) {
    case Constants.ChainID.Polygon:
    case Constants.ChainID.PolygonTest:
      return <Matic width={w} height={h} />;
    case Constants.ChainID.Eth:
      return <Eth width={w} height={h} />;
    case Constants.ChainID.Avalanche:
    case Constants.ChainID.AvalancheTest:
      return <Avax width={w} height={h} />;
    case Constants.ChainID.BNB:
    case Constants.ChainID.BNBTest:
      return <Bnb width={w} height={h} />;
    default:
      return "/img/unknown.png";
  }
};

export const renderChainName = (chain) => {
  switch (chain) {
    case Constants.ChainID.Polygon:
    case Constants.ChainID.PolygonTest:
      return "Polygon";
    case Constants.ChainID.Eth:
      return "Ethereum";
    case Constants.ChainID.Avalanche:
    case Constants.ChainID.AvalancheTest:
      return "Avalanche";
    case Constants.ChainID.BNB:
    case Constants.ChainID.BNBTest:
      return "BNB";
    default:
      return "";
  }
};

export const renderCoinIcon = (coin, w, h) => {
  switch (coin) {
    case Launchpad.SwappableCoins.USDC:
      return <USDC width={w} height={h} />;
    case Launchpad.SwappableCoins.USDT:
      return <USDT width={w} height={h} />;
    case Launchpad.SwappableCoins.NEXG:
      return (
        <Image
          source={require("../../assets/img/nexgami.png")}
          width={w}
          height={h}
        />
      );
    case Launchpad.SwappableCoins.NEXU:
      return (
        <Image
          source={require("../../assets/img/coin/nexu.png")}
          width={w}
          height={h}
        />
      );
    default:
      return "";
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
