import { TouchableHighlight, View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";

export const FriendButton = ({ title, icon, link, unreadCount, children }) => {
  const navigation = useNavigation();
  const [count, setCount] = useState(unreadCount);

  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCount(unreadCount);

    Animated.timing(heightAnim, {
      toValue: unreadCount > 0 ? 34 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

  }, [unreadCount])

  return (
    <Animated.View style={{ height: heightAnim }}>
      <Pressable onPress={() => navigation.navigate(link)}>
        <View className="flex-row justify-between mt-1 mb-1">
          <View className="flex-row items-center">
            <MaterialIcons name={icon} color="white" size={28} />
            {children}
            {count > 0 ? <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full relative top-[-6px] left-[-3px]">
              <Text className="font-bold text-white text-center">
                {count}
              </Text>
            </View> : <></>}
            <Text className="text-white font-bold text-lg pl-[5px]">
              {title}
            </Text>
          </View>
          <View className="justify-center">
            <Ionicons
              name="chevron-forward-outline"
              color="white"
              size={24}
            ></Ionicons>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const FriendButton_old = ({ title, icon, link, children }) => {
  const navigation = useNavigation();
  return (
    <TouchableHighlight onPress={() => navigation.navigate(link)}>
      <View className="bg-[#131F2A] h-[100px] px-[20px] flex-row justify-between mb-[10px]">
        <View className="flex-row items-center">
          <MaterialIcons name={icon} color="white" size={34} />
          {children}
          <Text className="text-white font-bold text-[20px] pl-[10px]">
            {title}
          </Text>
        </View>
        <View className="justify-center">
          <Ionicons
            name="chevron-forward-outline"
            color="white"
            size={34}
          ></Ionicons>
        </View>
      </View>
    </TouchableHighlight>
  );
};
