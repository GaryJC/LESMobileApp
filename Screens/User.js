import { View, Text, ImageBackground } from "react-native";
import { UserData } from "../Data/dummyData";
import { useEffect, useState } from "react";

export default function User() {
  // const [userData, setUserData] = useState();
  const [userStatus, setUserStatus] = useState("Online");
  // const [username, setUsername] = useState();
  // const [userId, setUserId] = useState();

  //
  useEffect(() => {
    setUserStatus(() =>
      UserData.userStatus === "0"
        ? "Online"
        : UserData.userStatus === "1"
        ? "Offline"
        : "Idle"
    );
  }, []);

  console.log(userStatus);

  return (
    <View>
      <ImageBackground
        source={UserData.userBgImg}
        className="w-[100vw] h-[30vh] items-center relative"
      >
        <View className="overflow-hidden rounded-full w-[100px] h-[100px] bg-[#ffffff] absolute bottom-[-50px]">
          <ImageBackground
            source={UserData.userAvatar}
            className="w-[100%] h-[100%]"
            resizeMode="cover"
          />
        </View>
      </ImageBackground>
      <View className="w-[90%] mx-auto mt-[50px] items-center">
        <Text className="text-white font-bold text-[30px]">
          {UserData.username}
        </Text>
        <Text className="text-white text-[15px]">#{UserData.userId}</Text>
        <View className="flex-row items-center justify-between mt-[5vh]">
          <Text className="text-white text-[20px] pr-[20px]">Set Status:</Text>
          <View className="w-[25vw] h-[5vh] bg-[#7E5ED9] rounded-lg justify-center items-center">
            <Text className="text-white text-[20px]">{userStatus}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
