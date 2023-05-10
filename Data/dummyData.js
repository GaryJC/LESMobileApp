import Games from "../Models/Games";
import GameDetails from "../Models/GameDetails";
import Activities from "../Models/Activities";
import News from "../Models/News";
import User from "../Models/User";

export const GamesData = [
  new Games(1, "MetaVirus", "", "", ""),
  new Games(2, "MetaVirus", "", "", ""),
];

//     gameId,gameName,gameImg,downloadLink,playableLink,webLink,patchNotes,about,twitterLink,discordLink,telegramLink
export const GameDetailsData = new GameDetails(
  1,
  "MetaVirus",
  "",
  "",
  "",
  "",
  "",
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  "",
  "",
  ""
);

export const ActivitiesData = [
  new Activities(
    1,
    require("../assets/img/gameCardBg.jpg"),
    "Friends Promotion",
    "Invite Friends to"
  ),
  new Activities(
    2,
    require("../assets/img/gameCardBg.jpg"),
    "Friends Promotion",
    "Invite Friends to"
  ),
];

export const NewsData = [
  new News(
    1,
    "MetaVirus is coming",
    "2 days ago",
    require("../assets/img/userBg.jpg")
  ),
  new News(
    2,
    "MetaVirus is coming",
    "2 days ago",
    require("../assets/img/userBg.jpg")
  ),
];

// 0->online, 1-offline, 3->leave
export const UserData = new User(
  1,
  "Gary",
  0,
  require("../assets/img/userBg.jpg"),
  require("../assets/img/gameCardBg.jpg")
);
