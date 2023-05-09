class GameDetails {
  constructor(
    gameId,
    gameName,
    gameImg,
    downloadLink,
    playableLink,
    webLink,
    patchNotes,
    about,
    twitterLink,
    discordLink,
    telegramLink
  ) {
    this.gameId = gameId;
    this.gameName = gameName;
    this.gameImg = gameImg;
    this.downloadLink = downloadLink;
    this.playableLink = playableLink;
    this.webLink = webLink;
    this.patchNotes = patchNotes;
    this.about = about;
    this.twitterLink = twitterLink;
    this.discordLink = discordLink;
    this.telegramLink = telegramLink;
  }
}

export default GameDetails;
