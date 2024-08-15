import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
// import GameGuide from "./GameGuide";
// import CommunityData from "./CommunityData";
// import GameNews from "./GameNews";
// import { Constants } from "../../../Constants";
import GameGuide from "./GameGuide";
import Constants from "../../modules/Constants";

const tabs = Constants.Games.Tabs;

export default function GameDetailsTabs({ gameDetail, id }) {
  const { guide, reviews, community } = gameDetail;

  const [curTab, setCurTab] = useState(tabs.GameGuide);

  const handleChange = (tab) => {
    setCurTab(tab);
  };

  const renderContent = () => {
    switch (curTab) {
      case tabs.CommunityData:
      // return <CommunityData community={community} />;
      case tabs.GameGuide:
        return <GameGuide guide={guide} />;
      case tabs.News:
      // return <GameNews id={id} />;
      default:
        return <View />;
    }
  };

  const TabButton = ({ tab }) => (
    <Pressable onPress={() => handleChange(tab)}>
      <Text
        className={`text-lg px-4 py-2 font-bold ${
          curTab === tab
            ? "text-white border-b-2 border-white underline"
            : "text-gray-400"
        }`}
      >
        {tab}
      </Text>
    </Pressable>
  );

  return (
    <View className="mt-5 overflow-hidden">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        <TabButton tab={tabs.GameGuide} />
        <TabButton tab={tabs.News} />
        <TabButton tab={tabs.CommunityData} />
      </ScrollView>
      <View className="mt-1">{renderContent()}</View>
    </View>
  );
}
