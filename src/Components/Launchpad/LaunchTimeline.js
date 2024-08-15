import React, { memo } from "react";
import { View, Text } from "react-native";
import moment from "moment";
import { getCurrentPhaseIndex } from "./handler";

const LaunchTimeline = ({ phase }) => {
  const currentPhaseIndex = getCurrentPhaseIndex(phase);

  const TimelineItemLayout = memo(({ index, item }) => {
    const isHead = index === 0;
    const isTail = index === phase.length - 1;
    const isCurrent = index === currentPhaseIndex;
    const hasGone = index < currentPhaseIndex;

    return (
      <View className="w-1/3 items-center">
        <Text
          // className={`absolute left-1/2 bottom-6 transform -translate-x-1/2 uppercase text-center ${
          //   isCurrent ? "text-nexgami-blue" : "text-gray"
          // }`}
          className="uppercase text-center"
          style={isCurrent ? { color: "#2196F3" } : { color: "#8898aa" }}
        >
          {item.title}
        </Text>

        {isHead ? (
          <View className="flex-row items-center ml-[50%]">
            <View
              className="rounded-full w-4 h-4 bg-black"
              style={
                isCurrent
                  ? { backgroundColor: "#2196F3" }
                  : { backgroundColor: "#8898aa" }
              }
            />
            <View className="w-full border-2 border-solid border-[#8898aa]" />
          </View>
        ) : (
          <View className="w-full flex-row items-center mr-[15%]">
            <View className="w-1/2 border-2 border-solid border-[#8898aa]" />
            <View
              className="rounded-full w-4 h-4"
              style={
                isCurrent
                  ? { backgroundColor: "#2196F3" }
                  : { backgroundColor: "#8898aa" }
              }
            />
            {!isTail && (
              <View className="w-1/2 border-2 border-solid border-[#8898aa]" />
            )}
          </View>
        )}
        <Text
          className="text-center w-3/5 uppercase"
          style={isCurrent ? { color: "#2196F3" } : { color: "#8898aa" }}
        >
          {item.openTime === 0 ? "TBA" : moment(item.openTime).format("lll")}
        </Text>
      </View>
    );
  });

  // TimelineItemLayout.displayName = "TimelineItemLayout";

  return (
    <View className="h-[150px] w-full flex-row items-center">
      {phase.map((item, index) => (
        <TimelineItemLayout key={index} item={item} index={index} />
      ))}
    </View>
  );
};

export default LaunchTimeline;
