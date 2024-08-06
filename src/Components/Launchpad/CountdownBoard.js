import React, { memo } from "react";
import { View, Text } from "react-native";
import LaunchTimeline from "./LaunchTimeline";
import useGetUpcomingPhase from "./useGetUpcomingPhase";
import "nativewind";

export const TimeCountDownBlock = ({ time, type }) => {
  return (
    <View className="bg-black rounded-2xl w-1/5 p-1 items-center justify-center">
      <Text className="text-2xl text-white text-center font-bold">{time}</Text>
      <Text className="uppercase text-white font-normal font-bold">{type}</Text>
    </View>
  );
};

const CountdownBoard = memo(({ data }) => {
  const { upcomingPhase, timeLeft } = useGetUpcomingPhase(data.idoInfo.phase);

  return (
    <View className="bg-white rounded-lg shadow-md p-4 h-full min-h-[300px]">
      <View className="h-full">
        <View className="space-y-2 justify-evenly h-full">
          <LaunchTimeline phase={data.idoInfo.phase} />
          {upcomingPhase && (
            <View>
              <Text className="uppercase text-blue-500 text-lg">
                {upcomingPhase.title} Starts in
              </Text>
              <View className="flex flex-row justify-center gap-2 md:gap-4">
                <TimeCountDownBlock time={timeLeft.days} type={"Days"} />
                <TimeCountDownBlock time={timeLeft.hours} type={"HRS"} />
                <TimeCountDownBlock time={timeLeft.minutes} type={"MIN"} />
                <TimeCountDownBlock time={timeLeft.seconds} type={"SEC"} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

export default CountdownBoard;
