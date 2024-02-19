import { useCallback, useEffect, useState } from "react";
import { AppState, Image, Linking, Platform, Text, View } from "react-native";
import JSEvent from "../../utils/JSEvent";
import { DataEvents } from "../../modules/Events";
import DataCenter from "../../modules/DataCenter";
import { useNavigation } from "@react-navigation/native";
import CommonBottomSheetModal from "../CommonBottomSheetModal";
import HighlightButton from "../HighlightButton";
import Constants from "../../modules/Constants";
import Divider from "../Divider";
import { UserData } from "../../Data/dummyData";
import Avatar from "../Avatar";
import { approveServiceLogin } from "../../utils/auth";
import Toast from "react-native-toast-message";
import { AppInfoMap } from "../../modules/AppInfo";

const URLPrefix = Platform.OS == "ios" ? "https://www.nexgami.com/app/" : "https://www.nexgami.com/android/";

const LoginRequest = "loginRequest";

const DeepUrlProcessor = () => {
	const [deepUrl, setDeepUrl] = useState(null);
	const [showAuth, setShowAuth] = useState(false);
	const nav = useNavigation();
	/**
	 * 
	 * @param {string} url 
	 */
	const onDeepUrl = (data) => {
		if (data == null) {
			setDeepUrl(null);
		}
		console.log("=====================deep url:", data, data?.url, data?.url != null);
		//loginRequest?name=MetaVirus&scheme=NexGami.MetaVirus://
		if (data?.url != null) {
			const { url } = data;
			if (url.startsWith(URLPrefix)) {
				const p = url.substring(URLPrefix.length);
				const pp = p.split("?");
				console.log("ppp:",pp);
				if (pp.length > 0) {
					const requestType = pp[0];
					/**
					 * @type {string}
					 */
					const paramString = pp[1];

					const params = paramString.split("&");

					const data = {};

					params.forEach(p => {
						const v = p.split("=");
						data[v[0]] = v[1];
					})

					console.log("==============:", data)
					setDeepUrl({ requestType, ...data });

					if (requestType == LoginRequest) {
						if (DataCenter.isAccountLogin()) {
							//账号已登陆，进入Authorize界面
							if (AppInfoMap.hasApp(data.name)) {
								console.log("==========pop authorize screen=========", { requestType, ...data })
								setShowAuth(true);
							}
						}
					}
				}
			}
		}

	}

	const onUserLogin = useCallback(() => {
		console.log("DeepUrlProcessor.onUserLogin..................", deepUrl)
		if (deepUrl != null && AppInfoMap.hasApp(deepUrl.name)) {
			if (deepUrl.requestType == LoginRequest) {
				//进入Authorize界面
				console.log("==========pop authorize screen=========")
				setShowAuth(true);
			}
		}
	}, [deepUrl])


	const onAppStateChanged = (state) => {
		if (state == "background") {
			//onDeepUrl(null);
			//console.log("clear deep url........................")
		}
	}

	useEffect(() => {
		var unsubLogin = JSEvent.on(DataEvents.User.UserState_DataReady, onUserLogin);
		return () => {
			unsubLogin();
		}
	}, [deepUrl])

	useEffect(() => {
		Linking.addEventListener("url", (url) => { onDeepUrl(url) })
		Linking.getInitialURL().then(url => {
			onDeepUrl(url);
		})

		var subState = AppState.addEventListener("change", (state) =>
			onAppStateChanged(state)
		);
		return () => {
			subState.remove();
		}
	}, [])

	const appScheme = AppInfoMap.getAppByName(deepUrl?.name)?.scheme ?? "";

	return <View>
		<AuthorizeBottomSheet
			show={showAuth}
			onClosed={() => {
				setShowAuth(false);
				setDeepUrl(null);
			}}
			appName={deepUrl?.name ?? "MetaVirus"}
			backScheme={appScheme}
		/>
	</View>
}

const AuthorizeBottomSheet = ({ show, onClosed, appName, backScheme }) => {
	const [visible, setVisible] = useState(show);
	const [appInfo, setAppInfo] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setVisible(show);
		if (show) {
			console.log("authorizing app", appName, "scheme", backScheme)
		}
	}, [show])

	useEffect(() => {
		const app = AppInfoMap.getAppByName(appName);
		setAppInfo(app);
	}, [appName])

	const authorize = (approvedServiceId) => {
		console.log(`Authorized ${appName} with ID[${DataCenter.userInfo.accountId}] Key[${DataCenter.userInfo.loginKey}]`)
		setLoading(true);

		approveServiceLogin(DataCenter.userInfo.accountId, DataCenter.userInfo.loginKey, DataCenter.deviceName, approvedServiceId)
			.then(resp => {
				console.log("====authorize result====", resp.data);
				if (resp.data.code != 0) {
					Toast.show({
						type: "error",
						text1: "Authorize Failed",
						text2: "Please try again later."
					})
				} else {
					const userInfo = DataCenter.userInfo.accountId + "+" + resp.data.retObject;

					console.log("------back scheme-----", backScheme + userInfo);

					Linking.openURL(backScheme + userInfo);
				}
			}).catch(e => {
				console.log(e);
				Toast.show({
					type: "error",
					text1: "Authorize Failed",
					text2: "Please try again later."
				})
			}).finally(() => {
				setVisible(false);
				setLoading(false);
			})

		//const userInfo = DataCenter.userInfo.accountId + "&" + DataCenter.userInfo.loginKey
		//Linking.openURL(backScheme + userInfo);
	}

	const title = appInfo && ("Authorize " + appInfo?.name + " to access your account?")

	const imgNexGami = Constants.Icons.getSystemIcon("nexgami");
	const appIcon = Constants.Icons.getSystemIcon(appInfo?.icon)
	const providerIcon = Constants.Icons.getProviderIcon(DataCenter.userInfo.userProfile.providerId);
	const user = DataCenter.userInfo?.imUserInfo;


	return <CommonBottomSheetModal
		visible={visible}
		snapPoints={["70%"]}
		index={0}
		onClosed={onClosed}
		enableContentPanningGesture={false}
	>
		<View className="flex h-full">
			<View className="m-5 flex-1 mb-[40px]">
				<View className="flex flex-row justify-center items-center mb-2">
					<Image source={imgNexGami} className="w-[40px] h-[40px]" />
					<Text className="text-2xl text-white font-bold ml-2">NexGami</Text>
				</View>
				<Divider />
				<View className="flex justify-start items-center">
					<Text className="text-gray-300 text-lg">An Application</Text>
					<View className="flex flex-row justify-center items-center m-2">
						<View className=" mr-2 p-[2px] rounded-full" style={{ backgroundColor: appInfo?.iconBorder }}>
							<Image source={appIcon} className="w-[40px] h-[40px] rounded-full" />
						</View>
					</View>
					<Text className="text-white text-xl font-bold">{appInfo?.name}</Text>
					{appInfo?.web != null && appInfo?.web.length > 0 ?
						<Text className=" underline text-clr-link" onPress={() => {
							Linking.openURL(appInfo.web);
						}}>
							{appInfo.web}
						</Text>
						: <></>}
					<Text className="text-gray-300 text-base">wants to access your NexGami Account</Text>
					<View className="flex flex-col items-center m-4">
						<Text className="text-gray-300 text-base">Signed in as </Text>
						<View className="flex flex-row items-center">
							<Avatar
								tag={user?.tag}
								name={user?.name}
								avatar={user?.avatar}
								size={{ w: 45, h: 45, font: 16 }}
							>
							</Avatar>
							<View className="flex ml-2">
								<Text className="text-white text-base font-bold">{DataCenter.userInfo?.imUserInfo?.name}</Text>
								<View className="flex flex-row items-center">
									<View className="rounded-full bg-white p-[1px]">
										<Image source={providerIcon} className="w-[15px] h-[15px]" />
									</View>
									<Text className="text-white text-base ml-1 max-w-[80%]" numberOfLines={1}>{DataCenter.userInfo.userProfile.email}</Text>
								</View>
							</View>
						</View>

					</View>
				</View>
				<View className="flex flex-1 justify-end">
					<Divider />
					<View className="flex flex-row mt-2 justify-between">
						{loading ? <View></View> :
							<HighlightButton
								text={<Text className="text-base text-white ">Cancel</Text>}
								type="opacity"
								onPress={() => {
									setVisible(false);
								}}
							/>
						}

						<HighlightButton
							isLoading={loading}
							text={<Text className="text-base text-white font-bold">Authorize</Text>}
							type="primary"
							onPress={() => {
								authorize(appInfo.name);
							}}
						/>
					</View>
				</View>
			</View>
		</View>
	</CommonBottomSheetModal>
}

export default DeepUrlProcessor;