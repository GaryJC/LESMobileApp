import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from "react-native";
import API from "../../modules/Api";
import { formatNumber } from "../../utils/formate";
import {
  renderChainIcon,
  renderCommunityIcon,
  renderGameStatusName,
  renderTokenIcon,
} from "../../utils/render";
import { PlatFormIcons } from "./GameCard";
import { getCoinMarketQuote } from "./handler";
import { SvgUri } from "react-native-svg";

const fetchImage = API.fetchImage;

function renderPercent(num, digits) {
  if (!num) {
    return "--";
  }
  const numStr = num.toString();
  const decimalIndex = numStr.indexOf(".");
  if (decimalIndex === -1 || numStr.length <= decimalIndex + digits + 1) {
    return numStr;
  }

  const percent = numStr.substring(0, decimalIndex + digits + 1);
  const isPositive = parseFloat(percent) >= 0;

  return (
    <Text
      className={`text-${
        isPositive ? "green-500" : "red-500"
      } text-lg font-bold`}
    >
      {isPositive ? " + " : ""}
      {percent} %
    </Text>
  );
}

// export const RenderTokenIcon = ({ token }) => {
//   const [imgSrc, setImgSrc] = useState(`/img/${token.symbol}.svg`);

//   const handleImgError = () => {
//     setImgSrc("/img/unknown.png"); // Path to your fallback image
//   };

//   return (
//     // <Image
//     //   source={{ uri: token.icon ? fetchImage(token.icon) : imgSrc }}
//     //   style={{ width: 30, height: 30 }}
//     //   onError={handleImgError}
//     // />
//    {RenderTokenIcon}
//   );
// };

const TokenCard = ({ token, coinMarketQuote }) => {
  return (
    <View className="bg-[#23252B] mt-2 p-4 rounded-lg">
      <Text className="text-white text-xl font-bold">Token</Text>
      <View className="flex-row items-center mt-2">
        {renderTokenIcon(token)}
        <Text className="text-white text-xl font-bold ml-2">
          {coinMarketQuote?.symbol}
        </Text>
      </View>
      <View className="flex-row items-center mt-2">
        <Text className="text-2xl text-white font-bold">
          ${formatNumber(coinMarketQuote?.price)}
        </Text>
        <Text> {renderPercent(coinMarketQuote?.percentage, 4)}</Text>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-400 text-sm">Volume (24H)</Text>
        <Text className="text-white text-sm">
          ${formatNumber(coinMarketQuote?.volume)}
        </Text>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-400 text-sm">Mkt Cap (24H)</Text>
        <Text className="text-white text-sm">
          ${formatNumber(coinMarketQuote?.market_cap)}
        </Text>
      </View>
    </View>
  );
};

const GameDetailsCard = ({ gameData }) => {
  console.log("gameData: ", gameData);
  const { platform, chain, status, detail, image, token } = gameData;
  const { link, developer, community } = detail;
  const [coinMarketQuote, setCoinMarketQuote] = useState();

  const { width } = useWindowDimensions();
  const isMobile = width <= 1200;

  useEffect(() => {
    const getQuote = async () => {
      let quote = await getCoinMarketQuote([token.symbol.toUpperCase()]);
      quote = Array.isArray(quote) ? quote.pop() : {};
      setCoinMarketQuote(quote);
    };
    getQuote();
  }, []);

  const GameInfoItem = ({ title, children }) => (
    <View className="flex-row justify-between mt-2">
      <Text className="text-white text-lg font-bold">{title}</Text>
      <View className="flex-row space-x-2">{children}</View>
    </View>
  );

  return (
    <View>
      <View className="bg-[#23252B] p-4 rounded-lg">
        <View className="flex-col items-center">
          {!isMobile && (
            <Image
              source={{ uri: fetchImage(image.preview) }}
              style={{ width: 200, height: 150 }}
              resizeMode="cover"
            />
          )}
        </View>
        <GameInfoItem title="Platform">
          <PlatFormIcons platforms={platform} />
        </GameInfoItem>
        <GameInfoItem title="Community">
          {community.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => Linking.openURL(item.link)}
            >
              <Image
                source={renderCommunityIcon(item.id)}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          ))}
        </GameInfoItem>
        <GameInfoItem title="Chain">
          {chain.map((item, index) => (
            <View key={index}>{renderChainIcon(item)}</View>
          ))}
        </GameInfoItem>
        <GameInfoItem title="Developers">
          <Text className="text-white text-lg">{developer}</Text>
        </GameInfoItem>
        <GameInfoItem title="Status">
          <Text className="text-white text-lg">
            {renderGameStatusName(status)}
          </Text>
        </GameInfoItem>
        <TouchableOpacity
          className="flex justify-center mt-4"
          onPress={() => Linking.openURL(link)}
        >
          <View className="border border-white rounded-lg py-2 px-4">
            <Text className="text-white text-lg text-center">Website</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TokenCard token={token} coinMarketQuote={coinMarketQuote} />
    </View>
  );
};

export default GameDetailsCard;
