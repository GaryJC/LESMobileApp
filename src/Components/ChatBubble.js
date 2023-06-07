import { View, Text, ImageBackground } from "react-native";
import Constants from "../modules/Constants";

export const ChatBubble = ({
  senderId,
  content,
  timestamp,
  status,
  userInfo,
}) => {
  const { name, avatar } = userInfo.find((item) => item.id === senderId);

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

  const date = formatDate(new Date(timestamp * 1000)); // Outputs in MM/DD/YY, HH:MM format

  return (
    <View className="flex-row py-[10px]">
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
        <Text className="text-[13px] text-white">{content}</Text>
        {status === Constants.deliveryState.delivering && <Text>Loading</Text>}
      </View>
    </View>
  );
};
