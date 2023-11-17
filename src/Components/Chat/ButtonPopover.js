import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Popover from "react-native-popover-view";

/**
 * 
 * @param {{icon:React.JSX.Element, popView:React.JSX.Element }} param
 */
const ButtonPopover = React.forwardRef(({ icon, popView }, ref) => {
    const [showPopover, setShowPopover] = useState(false);
    useImperativeHandle(ref, () => {
        return {
            close: () => {
                setShowPopover(false);
            }
        }
    })

    return <Popover
        isVisible={showPopover}
        popoverStyle={{
            backgroundColor: "#505050",
        }}
        backgroundStyle={{
            backgroundColor: 0,
        }}
        onRequestClose={() => setShowPopover(false)}
        from={
            <TouchableHighlight onPress={() => setShowPopover(true)}>
                {icon}
            </TouchableHighlight>
        }
    >
        {popView}
    </Popover>

});

const ButtonAddPopover = ({ children }) => {
    const nav = useNavigation();
    const ref = useRef(null);

    const popMenuHandler = (option) => {
        if (option === "CreateGroup") {
            nav.navigate("GroupCreate");
            ref.current.close();
        } else {
            nav.navigate("FriendAdd");
            ref.current.close();
        }
    };

    const icon = children;
    const popView = <View className="p-[10px]">
        <TouchableOpacity onPress={() => popMenuHandler("AddFriend")}>
            <View className="flex-row items-center my-[5px]">
                <MaterialIcons name="person-add-alt-1" size={20} color="white" />
                <Text className="ml-[5px] text-[16px] text-white font-bold">
                    Add Friends
                </Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => popMenuHandler("CreateGroup")}>
            <View className="flex-row items-center my-[5px]">
                <MaterialIcons name="group-add" size={20} color="white" />
                <Text className="ml-[5px] text-[16px] text-white font-bold">
                    New Group
                </Text>
            </View>
        </TouchableOpacity>
    </View>

    return <ButtonPopover
        ref={ref}
        icon={icon}
        popView={popView}
    />
};

export default ButtonAddPopover;