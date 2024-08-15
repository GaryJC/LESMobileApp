import { useEffect, useState } from "react";
import NewsList from "../../news/NewsList";
import { getGameNews } from "./handler";

export default function GameNews({ id }) {
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    const getGameNewsData = async () => {
      const newsData = await getGameNews(id);
      setNewsData(newsData);
    };

    getGameNewsData();
  }, []);

  return <NewsList newsData={newsData} />;
}
