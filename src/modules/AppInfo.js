import { LesConstants } from "les-im-components";

const { IMUserState } = LesConstants;

export const AppInfoMap = {
	apps: {
		"MetaVirus": {
			gameId: 10001,
			name: "MetaVirus",
			web: "https://www.metavirus.games",
			icon: "metavirus",
			bundleId: "com.nexgami.game.metavirus",
			scheme: "nexgami.metavirus://",
			appUrl: {
				ios: "https://www.nexgami.com/metavirus/ios",
				android: "https://www.nexgami.com/metavirus/android"
			},
			iconBorder: "#22C55E",
			available: true,
			desc: "Our first web3 game based on NexGami platform",
			stateMap: {
				1: "Login",
				2: "Creating Actor",
				10001: "Genesis Village"
			},
		},
		"MetaMyth": {
			gameId: 10002,
			name: "MetaMyth",
			web: "",
			icon: "metamyth",
			bundleId: "com.joygame.loong.meta",
			scheme: "nexgami.metamyth://",
			appUrl: {
				//ios: "https://www.nexgami.com/metavirus/ios",
				//android: "https://www.nexgami.com/metavirus/android"
			},
			iconBorder: "#22C55E",
			available: true,
			desc: "Our first web3 game based on NexGami platform",
			stateMap: {
				1: "Login",
				2: "Creating Actor",
				10001: "Home"
			},
		},
	},

	hasApp: (appName) => AppInfoMap.apps[appName] != null,

	getApps: () => {
		const appArr = [];
		for (const key in AppInfoMap.apps) {
			appArr.push(AppInfoMap.apps[key]);
		}
		return appArr;
	},

	getApp: (id) => {
		for (const key in AppInfoMap.apps) {
			if (AppInfoMap.apps[key].gameId == id) {
				return AppInfoMap.apps[key];
			}
		}
		return null;
	},

	getAppByName: (name) => {
		return AppInfoMap.apps[name];
	},

	parseGameState: (gameState) => {
		return [(gameState >> 16) & 0xFFFF, gameState & 0xFFFF];
	},

	/**
	 * 根据用户的gameState返回游戏相关数据
	 * playingGame表示用户是否在玩游戏
	 * @param {number} gameState 
	 * @param {IMUserState} playerState
	 * @returns {{gameId:number,name:string,web:string,icon:string,state:string,playingGame:boolean}}
	 */
	getGameState: (gameState, playerState) => {
		if (playerState >= IMUserState.Hiding) {
			return { playingGame: false }
		}
		const [gameId, state] = AppInfoMap.parseGameState(gameState);
		const game = AppInfoMap.getApp(gameId);
		let stateDesc = game?.stateMap[state] ?? null;

		if (stateDesc != null) {
			//状态后面跟上游戏名字
			stateDesc += " - " + game.name;
		}

		return {
			gameId,
			name: game?.name ?? null,
			web: game?.web,
			icon: game?.icon,
			iconBorder: game?.iconBorder,
			state: stateDesc,
			playingGame: stateDesc != null
		}
	}
}