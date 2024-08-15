import React, { useState, useRef, useEffect } from "react";
import { View, FlatList, Animated, Dimensions } from "react-native";

const { width: windowWidth } = Dimensions.get("window");

const Carousel = ({
  data,
  renderItem,
  autoScroll = true,
  autoScrollInterval = 3000,
  keyExtractor,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const index = useRef(0);

  console.log("data", data);

  useEffect(() => {
    if (autoScroll && data.length > 0) {
      const interval = setInterval(() => {
        index.current = (index.current + 1) % data.length;
        flatListRef.current.scrollToOffset({
          offset: index.current * windowWidth,
          animated: true,
        });
      }, autoScrollInterval);

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [data.length, autoScroll, autoScrollInterval]);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={windowWidth}
        decelerationRate="fast"
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      <View className="flex-row justify-center items-center mt-2">
        {data.map((_, i) => {
          const inputRange = [
            (i - 1) * windowWidth,
            i * windowWidth,
            (i + 1) * windowWidth,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={{ transform: [{ scale }] }}
              className="h-[10px] w-[10px] bg-white rounded-full mx-1"
            />
          );
        })}
      </View>
    </View>
  );
};

export default Carousel;
