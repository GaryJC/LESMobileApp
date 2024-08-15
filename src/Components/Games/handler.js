import API from "../../modules/Api";
const { fetchWithRevalidate } = API;

const getEntireGameList = async () => {
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chain: [],
      genre: [],
      platform: [],
      status: [],
    }),
  };
  return await fetchWithRevalidate(API.Game.getGameList(), params);
};

/**
 * 获取所有游戏数据，并进行分类
 * 返回一个数组，每项数组由[gameType,[GameData]]组成
 * @returns
 */
const categorizeGameData = (gameList) => {
  const gameData = gameList.reduce((acc, game) => {
    if (!acc.has(game.genre[0])) {
      acc.set(game.genre[0], [game]);
    } else {
      acc.get(game.genre[0]).push(game);
    }
    return acc;
  }, new Map());
  return [...gameData];
};

const getSpecificGameData = async (id) => {
  return await fetchWithRevalidate(API.Game.getSpecificGame(id));
};

const getGameNews = async (id) => {
  return await fetchWithRevalidate(API.News.getGameNews(id));
};

const getFilteredGames = async (filters) => {
  return await fetchWithRevalidate(API.Game.getGameList(), {
    method: "POST",
    body: JSON.stringify(filters),
  });
};

const getFilterOption = async () => {
  return await fetchWithRevalidate(API.Game.getFilterOption());
};

const getPromotion = async () => {
  return await fetchWithRevalidate(API.Game.getPromotion());
};

const getCoinMarketQuote = async (symbol) => {
  return await fetchWithRevalidate(
    API.CoinMarketAPI.getSpecificCoinQuote(symbol)
  );
};

export {
  categorizeGameData,
  getPromotion,
  getSpecificGameData,
  getFilteredGames,
  getEntireGameList,
  getGameNews,
  getFilterOption,
  getCoinMarketQuote,
};
