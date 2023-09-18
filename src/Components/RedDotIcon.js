import { View, Text, Pressable } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Ionicons } from "@expo/vector-icons";

/**
 * 
 * 带数字红点的图标
 * 图标使用Ionicons
 * 
 * @param {{iconName:string, iconSize:number, color:string count:number, onPress:()=>{}}} p
 */
export default RedDotIcon = ({ iconName, iconSize, color, count, onPress }) => {

    const defaultSetting = { iconName: "", iconSize: 30, color: "white", count: 0 }

    const unreadCount = Math.min(count ?? defaultSetting.count, 99);
    const size = iconSize ?? defaultSetting.iconSize;
    const style = "w-[" + (size + 5) + "px]";

    return <Pressable onPress={onPress}>
        <Ionicons name={iconName ?? defaultSetting.iconName} size={size} color={color ?? defaultSetting.color} />
        {unreadCount !== 0 && (
            <View className="w-[20px] h-[20px] bg-[#FF3737] rounded-full absolute bottom-[-5px] right-[-5px]  flex justify-center items-center">
                <Text className="font-bold text-white text-xs">
                    {unreadCount}
                </Text>
            </View>
        )}
    </Pressable>
}