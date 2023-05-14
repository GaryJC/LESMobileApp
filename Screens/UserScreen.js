import { View, Text, ImageBackground, ScrollView } from "react-native";
import { UserData } from "../Data/dummyData";
import { useEffect, useState } from "react";

const userOptions = [
  { id: 1, title: "Account", link: "" },
  { id: 2, title: "Referral Code", link: "" },
  { id: 3, title: "Settings", link: "" },
];

const UserOptionButton = (key, title, link) => (
  <View key={key} className="py-[15px]">
    <Text className="text-white text-[15px]">{title}</Text>
  </View>
);

export default function UserScreen() {
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
    <View className="flex-1">
      <ImageBackground
        source={UserData.userBgImg}
        className="w-[100vw] h-[30vh] items-center relative"
      >
        <View className="overflow-hidden rounded-full w-[100px] h-[100px] absolute bottom-[-50px]">
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
        <View className="flex-row items-center justify-between mt-[3vh]">
          <Text className="text-white text-[20px] pr-[20px]">Set Status:</Text>
          <View className="w-[25vw] h-[5vh] bg-[#7E5ED9] rounded-lg justify-center items-center">
            <Text className="text-white text-[20px]">{userStatus}</Text>
          </View>
        </View>
        <View className="bg-[#131F2B] rounded-lg w-[100%] mt-[3vh]">
          <ScrollView className="divide-y-2 divide-[#5C5C5C] px-[10px]">
            {userOptions.map((item, index) =>
              UserOptionButton(item.id, item.title, item.link)
            )}
          </ScrollView>
        </View>
        <View className="bg-[#131F2B] rounded-lg w-[100%] mt-[3vh] items-center">
          <Text className="py-[10px] text-[#FF0000] text-[15px]">Log Out</Text>
        </View>
      </View>
    </View>
  );
}
