import React, { memo, useEffect, useState } from "react";
import { View, Text, Image, ScrollView, SafeAreaView } from "react-native";
import moment from "moment";
import API from "../../modules/Api";
import {
  renderChainIcon,
  renderChainName,
  renderCommunityIcon,
  renderPrice,
  renderTotoalRaised,
  //   formatMarkdown,
} from "../../utils/render";
import { getSpecificLaunchpadData } from "../../Components/Launchpad/handler";
import CountdownBoard from "../../Components/Launchpad/CountdownBoard";
import SwapBoard from "../../Components/Launchpad/SwapBoard";
import TokenSaleBoard from "../../Components/Launchpad/TokenSaleBoard";
import Markdown from "react-native-markdown-display";

const { fetchImage } = API;

const MainBoard = memo(({ data }) => {
  const { image, name, idoInfo, token, communities } = data;
  return (
    <View className="bg-white rounded-lg p-4">
      <View className="flex flex-row gap-2">
        <Image
          source={{ uri: fetchImage(image) }}
          className="w-24 h-24 rounded-2xl"
          alt="main"
        />
        <View className="flex flex-col justify-between">
          <Text className="text-xl font-bold">{name}</Text>
          <View className="flex flex-row gap-2">
            {communities.map((community, index) => (
              <View key={index} className="w-6 h-6">
                <Image
                  source={renderCommunityIcon(community.id)}
                  className="w-full h-full"
                  alt="community"
                />
              </View>
            ))}
          </View>
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-1">
              <Image
                source={{ uri: fetchImage(token?.icon) }}
                className="w-6 h-6"
                alt="token icon"
              />
              <Text className="text-lg text-gray-500">{token?.symbol}</Text>
            </View>
          </View>
        </View>
      </View>
      {/* <Text className="bg-blue-500 px-3 rounded-md w-full text-center text-white font-bold uppercase mt-2">
        {idoInfo.refundPolicy}
      </Text> */}
      <View className="border border-gray-200 rounded-lg p-4 mt-2">
        <View className="flex-row flex-wrap justify-between">
          <View className="w-1/2">
            <Text>IDO Price</Text>
            <Text className="font-bold">{renderPrice(idoInfo.price)}</Text>
          </View>
          <View className="w-1/2">
            <Text>Total Raise</Text>
            <Text className="font-bold">
              {renderTotoalRaised(idoInfo.totalRaised)}
            </Text>
          </View>
          <View className="w-1/2">
            <Text>Token Network</Text>
            <View className="flex-row items-center gap-1">
              {/* <Image
                source={renderChainIcon(idoInfo.tokenChain)}
                className="w-5 h-5"
                alt="chain icon"
              /> */}
              {renderChainIcon(idoInfo.tokenChain, 20, 20)}
              <Text className="font-bold">
                {renderChainName(idoInfo.tokenChain)}
              </Text>
            </View>
          </View>
          <View className="w-1/2">
            <Text>IDO Network</Text>
            <View className="flex-row items-center gap-1">
              {renderChainIcon(idoInfo.tokenChain, 20, 20)}
              <Text className="font-bold">
                {renderChainName(idoInfo.idoChain)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="bg-gray-100 p-4 rounded-lg mt-2">
        <Text className="font-bold">Vesting</Text>
        <Text>{idoInfo.vesting}</Text>
      </View>
    </View>
  );
});

MainBoard.displayName = "MainBoard";

const ContentBoard = memo(({ desc }) => {
  //   const markdownText = formatMarkdown(desc);
  return (
    <View className="bg-white rounded-lg shadow-md p-4">
      <Markdown>{desc}</Markdown>
    </View>
  );
});

// ContentBoard.displayName = "ContentBoard";

export default function LaunchpadDetailScreen({ route }) {
  const [data, setData] = useState(null);

  const id = route.params.id;

  useEffect(() => {
    const fetchData = async () => {
      const launchpadData = await getSpecificLaunchpadData(id);
      setData(launchpadData);
    };
    fetchData();
  }, [id]);

  return (
    <SafeAreaView className="">
      <ScrollView>
        <View style={{ gap: 15 }}>
          {data && <MainBoard data={data} />}
          {/* {data && <CountdownBoard data={data} />} */}
          {data && <SwapBoard data={data} />}
          {data && <TokenSaleBoard data={data} />}
          {data && <ContentBoard desc={data.idoInfo.desc} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
