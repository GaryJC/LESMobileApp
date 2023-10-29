import { View, ImageBackground, Text } from "react-native";
import Avatar from "./Avatar";
import { StateIndicator } from "./StateIndicator";
import DataCenter from "../modules/DataCenter";

const UserBottomSheetHeader = ({ user, children }) => {
  return (
    <>
      <ImageBackground
        source={require("../../assets/img/userBg.jpg")}
        className="h-[30vh] items-center justify-center relative"
      >
        {/* <Avatar tag={tag} name={name} size={{ w: 100, h: 100, font: 40 }} /> */}
        <Avatar
          tag={user.tag}
          name={user.name}
          size={{ w: 100, h: 100, font: 40 }}
        >
          <View className="absolute right-0 bottom-0">
            <StateIndicator
              state={user.state}
              onlineState={user.onlineState}
              bgColor={"#080F14"}
              size={25}
            />
          </View>
        </Avatar>
        <View className="flex-row w-[100%] justify-center h-[30px] bg-black opacity-50 absolute bottom-0"></View>
        <View className="absolute bottom-[5px] flex-row">
          <Text className="text-white font-bold text-[18px] opacity-100">
            {user.name}
          </Text>
          <Text className="text-white text-[18px]">#{user.tag}</Text>
        </View>
        {children}
      </ImageBackground>
    </>
  );
};

export default UserBottomSheetHeader;
