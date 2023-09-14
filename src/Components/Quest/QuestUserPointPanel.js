import { useEffect, useRef, useState } from "react";
import DataCenter from "../../modules/DataCenter";
import { DataEvents } from "../../modules/Events";
import JSEvent from "../../utils/JSEvent";
import { View, Image, Text, Button, Animated } from "react-native";

export default QuestUserPointPanel = ({ }) => {
    const [rewardPoints, setRewardPoints] = useState(0);
    const [pointAni, setPointAni] = useState(0)
    const onQuestUserUpdated = () => {
        setRewardPoints(DataCenter.userInfo?.questUserInfo?.rewardPoints ?? 0);
    }

    useEffect(() => {
        JSEvent.on(DataEvents.User.QuestUser_Updated, onQuestUserUpdated)
        return () => {
            JSEvent.remove(DataEvents.User.QuestUser_Updated, onQuestUserUpdated)
        }
    }, [])

    const fadeAnim = useRef(new Animated.Value(0)).current;
    fadeAnim.addListener(v => {
        setPointAni(v.value.toFixed(0))
    })

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: rewardPoints,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [rewardPoints])

    return <View className="flex-row mr-[5vw] justify-center items-center">
        <Image source={require("../../../assets/img/icon_point.png")} className="w-[30px] h-[40px] mr-1 mt-1" resizeMode="contain" />
        <View className="flex justify-center">
            <Text className="text-clr-light text-sm font-bold">{pointAni}</Text>
            <Text className="text-clr-light text-xs ">points</Text>
        </View>
    </View>
}