import { WebView } from 'react-native-webview';
import DataCenter from '../modules/DataCenter';
import Constants from '../modules/Constants';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const WalletScreen = ({ }) => {
    const ref = useRef(null);

    const inject = `(function(){window.walletBridge.setFirebaseLoginToken("${DataCenter.userInfo.loginKey}");})()`

    useEffect(() => {
        if (Platform.OS == "ios") {
            //ios 需要reload重新刷一下页面，inject的js才能生效
            if (ref.current != null) {
                setTimeout(() => {
                    ref.current.reload();
                }, 2000);
            }
        }
    }, [])

    return <WebView
        ref={ref}
        source={{ uri: Constants.Address.WalletAddress }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        onMessage={(event) => {
            console.log(event);
        }}
        onLoadEnd={() => {
            //console.log("aaaaaa")
            ref.current.injectJavaScript(inject);
        }}
        injectedJavaScript={inject}
    />;
}

export default WalletScreen;