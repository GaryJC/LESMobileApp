import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Text,
  Dimensions,
} from "react-native";
import QuestService from "../../services/QuestService";
import { FlatList } from "react-native-gesture-handler";
import { formatTxtTime, QuestTitle } from "../../Screens/QuestScreen";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const QuestListCard = ({ quest, community }) => {
  const navigation = useNavigation();

  const logo =
    community.logoUrl == "" ? require("../../../assets/icon.png") : logo;

  const state =
    quest?.endTime == -1 || quest?.endTime > new Date().getTime()
      ? "Ongoing"
      : "Ended";

  const unit = "Points";

  return (
    <TouchableOpacity
      className="bg-[#292A2F] rounded-xl overflow-hidden mr-5"
      onPress={() => navigation.navigate("Quests")}
    >
      {/* <TouchableOpacity
      onPress={() =>
        idoPlatform.name === "NexGami"
          ? navigation.navigate("LaunchpadDetail", { id: item.id })
          : null
      }
      > */}
      <Image
        source={require("../../../assets/img/gameDetailsBg.jpg")}
        style={{
          width: windowWidth * 0.65,
          height: "auto",
          aspectRatio: 16 / 10,
        }}
      />
      {/* </TouchableOpacity> */}
      <View className="p-2 text-white">
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold text-white">
            {community.name}
          </Text>
          <Image
            source={logo}
            style={{ width: 30, height: 30 }}
            className="ml-2 object-contain"
          />
        </View>
        <Text className="text-white text-lg font-bold">{quest.questName}</Text>
        <Text className="mt-2 text-white text-xs">{formatTxtTime(quest)}</Text>
        <View className="mt-2 self-start flex-row justify-center items-center p-1 bg-clr-emphasize-light border border-clr-emphasize rounded-full">
          <Image
            source={require("../../../assets/img/icon_point.png")}
            className="w-[20px] h-[20px] mr-1"
            resizeMode="contain"
          />
          <Text>{`${quest.getRewardPoints()} ${unit}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const QuestList = () => {
  const [quest, setQuest] = useState([]);
  const [community, setCommunity] = useState([]);

  useEffect(() => {
    QuestService.Inst.getQuestInfo().then((qd) => {
      console.log("quest: ", qd);
      setQuest([qd]);
      QuestService.Inst.getCommunityInfo(qd.conmmuityId).then((c) => {
        console.log("community: ", c);
        setCommunity(c);
      });
    });
  }, []);

  return (
    <View className="my-3">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-white text-2xl font-bold">Quests</Text>
        <Text className="text-white text-lg font-bold">View all</Text>
      </View>
      <FlatList
        data={quest}
        renderItem={({ item }) => (
          <QuestListCard quest={item} community={community} />
        )}
        keyExtractor={(item) => item.questId.toString()}
        horizontal={true}
      />
    </View>
  );
};

export default QuestList;
