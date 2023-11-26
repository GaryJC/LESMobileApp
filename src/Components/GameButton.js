import { useEffect, useState } from "react";
import { Linking, Text } from "react-native";
import HighlightButton from "./HighlightButton";

///game数据是AppInfoMap中的app
export default GameButton = ({ game }) => {
	const [loading, setLoading] = useState(false);
	const [installed, setInstalled] = useState(false);

	useEffect(() => {
		if (game != null) {
			setLoading(true);
			Linking.canOpenURL(game?.scheme).then(isSupport => {
				setInstalled(isSupport);
			}).catch(e => {
				setInstalled(false);
			}).finally(() => {
				setLoading(false);
			});
		}
	}, [game])

	const onOpen = () => {
		Linking.openURL(game?.scheme).then(r => {

		}).catch(e => {
			if (!installed) {
				//没有安装，打开安装连接
			}
		})
	}

	return <HighlightButton
		onPress={() => { onOpen() }}
		isLoading={loading}
		type="emphasize"
		text={<Text className="text-black text-lg font-bold">{"Launch"}</Text>}
	/>
}