import { FlatList } from "react-native";
import { useState, useEffect } from "react";
import LaunchpadItem from "../Launchpad/LauchpadItem";
import Constants from "../../modules/Constants";
import API from "../../modules/Api";
import axios from "axios";

const LaunchpadGenre = Constants.Launchpad.Genre.Token;
const LaunchpadStatus = Constants.Launchpad.IDOStatus.Upcoming;

const queryString = new URLSearchParams({
  genre: LaunchpadGenre,
  status: LaunchpadStatus,
}).toString();

const LaunchpadList = () => {
  const [launchpadData, setLaunchpadData] = useState([]);

  useEffect(() => {
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
  }, []);

  console.log("launchpadData", launchpadData);

  return (
    <FlatList
      data={launchpadData}
      renderItem={({ item }) => <LaunchpadItem item={item} />}
      //   keyExtractor={(item) => item.activityId.toString()}
      horizontal={true}
    />
  );
};

export default LaunchpadList;
