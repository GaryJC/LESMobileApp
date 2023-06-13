import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Constants from "../modules/Constants";
import { useState, useEffect } from "react";

export const ChatBubble = ({
  senderId,
  content,
  timestamp,
  status,
  userInfo,
}) => {
  const [name, setName] = useState();
  const [avatar, setAvatar] = useState();
  const [date, setDate] = useState();

  console.log("statusss: ", status);

  useEffect(() => {
    const { name, avatar } = userInfo.find((item) => item.id === senderId);
    setName(name);
    setAvatar(avatar);
    /**
     *
     * @param {Date} date
     * @returns {formattedDate}
     */
    function formatDate(date) {
      const options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

      let formattedDate;
      if (timestamp) {
        formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
      }
      return formattedDate;
    }

    const date = formatDate(new Date(timestamp)); // Outputs in MM/DD/YY, HH:MM format
    setDate(date);
  }, []);

  return (
    <View className="flex-row py-[10px] w-[100%]">
      <View className="overflow-hidden rounded-full w-[50px] h-[50px]">
        <ImageBackground
          source={{ uri: avatar }}
          className="w-[100%] h-[100%]"
          resizeMode="cover"
        />
      </View>
      <View className="justify-evenly pl-[10px]">
        <View className="flex-row items-end">
          <Text className="text-[17px] text-white font-bold">{name}</Text>
          <Text className="text-[10px] text-[#CFCFCF] pl-[10px]">{date}</Text>
        </View>

        <View className="flex-row">
          <Text className="text-[13px] text-white w-[80%]">{content}</Text>
          {status === Constants.deliveryState.delivering && (
            <ActivityIndicator
              className="pl-[10px"
              size={"small"}
              color={"#8D8D8D"}
            />
          )}
        </View>
      </View>
    </View>
  );
};
