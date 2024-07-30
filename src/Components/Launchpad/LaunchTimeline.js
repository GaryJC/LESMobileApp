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
      <View className="flex-col w-1/3 relative">
        <Text
          // className={`absolute left-1/2 bottom-6 transform -translate-x-1/2 uppercase text-center ${
          //   isCurrent ? "text-nexgami-blue" : "text-gray"
          // }`}
          className="absolute bottom- uppercase text-center text-black left-1/2 -translate-x-1/2"
        >
          {item.title}
        </Text>

        {isHead ? (
          <View className="flex-row items-center left-[25%] absolute">
            <View
              className="rounded-full w-4 h-4 bg-black"
              // style={
              //   isCurrent
              //     ? { backgroundColor: "#FD7B43" }
              //     : { backgroundColor: "#000000" }
              // }
            />
            <View className="w-full border-2 border-solid border-black" />
          </View>
        ) : (
          <View className="flex-row items-center right-[20%] absolute">
            <View className="w-1/2 border-2 border-solid border-black" />
            <View
              className="rounded-full w-4 h-4"
              style={
                isCurrent
                  ? { backgroundColor: "#FD7B43" }
                  : { backgroundColor: "#000000" }
              }
            />
            {!isTail && (
              <View className="w-1/2 border-2 border-solid border-black" />
            )}
          </View>
        )}
        <Text
          className={`absolute top-6 text-center w-3/5 uppercase ${
            isCurrent ? "text-nexgami-blue" : "text-gray"
          }`}
        >
          {item.openTime === 0 ? "TBA" : moment(item.openTime).format("lll")}
        </Text>
      </View>
    );
  });

  // TimelineItemLayout.displayName = "TimelineItemLayout";

  return (
    <View className="h-2/5 w-[100vw] flex-row justify-center">
      {phase.map((item, index) => (
        <TimelineItemLayout key={index} item={item} index={index} />
      ))}
    </View>
  );
};

export default LaunchTimeline;
