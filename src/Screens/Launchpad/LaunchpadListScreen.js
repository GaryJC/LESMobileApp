import { FlatList, SafeAreaView, Text, View } from "react-native";
import { useState, useEffect } from "react";
import LaunchpadItem from "../../Components/Launchpad/LauchpadItem";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import axios from "axios";
import TabButton from "../../Components/TabButton";

// const LaunchpadGenre = Constants.Launchpad.Genre.Token;
const LaunchpadStatus = Constants.Launchpad.IDOStatus.Upcoming;

const LaunchpadListScreen = () => {
  const [launchpadData, setLaunchpadData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(
    Constants.Launchpad.Genre.Token
  );

  const queryString = new URLSearchParams({
    genre: selectedTab,
    status: LaunchpadStatus,
  }).toString();

  useEffect(() => {
    console.log("queryString", queryString);
    const fetchLaunchpadData = async () => {
      try {
        const res = await axios.get(
          API.Launchpad.getLaunchpadList(queryString)
        );
        const data = res.data;
        if (data.code == 0) {
          setLaunchpadData(data.data);
        } else {
          console.log(data.msg);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchLaunchpadData();
  }, [queryString]);

  const switchTabHandler = (type) => {
    setSelectedTab(type);
  };

  return (
    <SafeAreaView>
      <View className="flex-row justify-between my-[15px] bg-[#262F38] h-[4vh] rounded-lg items-center">
        <TabButton
          title={"Token"}
          selectedTab={selectedTab}
          type={Constants.Launchpad.Genre.Token}
          handler={switchTabHandler}
        />
        <TabButton
          title={"NFT"}
          selectedTab={selectedTab}
          type={Constants.Launchpad.Genre.NFT}
          handler={switchTabHandler}
        />
      </View>
      <FlatList
        data={launchpadData}
        renderItem={({ item }) => (
          <View className="mb-5">
            <LaunchpadItem item={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

export default LaunchpadListScreen;
