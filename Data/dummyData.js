import Games from "../Models/Games";
import GameDetails from "../Models/GameDetails";

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
