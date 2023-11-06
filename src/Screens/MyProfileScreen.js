import { useEffect, useReducer, useState, useCallback } from "react";
import { View } from "react-native";
import UserBottomSheetHeader from "../Components/UserBottomSheetHeader";
import DataCenter from "../modules/DataCenter";
import Links from "../Components/UserDrawer/Links";
import ProfilePrivacy from "../Components/UserDrawer/ProfilePrivacy";
import JSEvent from "../utils/JSEvent";
import { DataEvents } from "../modules/Events";

const MyProfileScreen = () => {
    const [userInfo, setUserInfo] = useState({
        name: "",
        accountId: "",
        state: "",
        tag: "",
        avatar: "",
    });

    useEffect(() => {
        const retriveUserInfoHandler = () => {
            setUserInfo((pre) => {
                return {
                    ...pre,
                    name: DataCenter.userInfo.imUserInfo.name,
                    accountId: DataCenter.userInfo.accountId,
                    tag: DataCenter.userInfo.imUserInfo.tag,
                    avatar: DataCenter.userInfo.imUserInfo.avatar,
                    state: DataCenter.userInfo.imUserInfo.state,
                };
            });
        };
        JSEvent.on(DataEvents.User.UserInfo_Current_Updated, retriveUserInfoHandler);
        retriveUserInfoHandler();

        return () => {
            JSEvent.remove(DataEvents.User.UserInfo_Current_Updated, retriveUserInfoHandler);
        }
    }, []);
    return <View>
        <UserBottomSheetHeader
            user={userInfo}
            isOwn={true}
        />
        <View className="mx-[5%] mt-[3vh]">
            <Links />
            <ProfilePrivacy />
        </View>
    </View>
}

export default MyProfileScreen;