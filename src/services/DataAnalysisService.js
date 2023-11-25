import analytics from '@react-native-firebase/analytics';
import DataCenter from '../modules/DataCenter';

class DataAnalysisService {
	static #inst;

	/**
	 * @returns {DataAnalysisService}
	 */
	static get Inst() {
		return DataAnalysisService.#inst ?? new DataAnalysisService();
	}

	constructor() {
		if (new.target !== DataAnalysisService) return;
		if (DataAnalysisService.#inst == null) {
			DataAnalysisService.#inst = this;
		}
		return DataAnalysisService.#inst;
	}

	// init() {
	//   JSEvent.on(DataEvents.Notification.NotificationState_Updated, (noti) =>
	// 	this.#onNotificationUpdated(noti)
	//   );
	// }

	async onUserLogin() {
		const p = { method: DataCenter.userInfo.userProfile.providerId };
		await analytics().logLogin({ method: DataCenter.userInfo.userProfile.providerId })
		console.log("============= log login", p);
	}
}

export default DataAnalysisService;