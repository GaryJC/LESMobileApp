import { WebView } from 'react-native-webview';
import DataCenter from '../modules/DataCenter';
import Constants from '../modules/Constants';

const WalletScreen = ({ }) => {
    return <WebView
        source={{ uri: Constants.Address.WalletAddress }}
        style={{ flex: 1 }}
        injectedJavaScript={`window.walletBridge.setFirebaseLoginToken("${DataCenter.userInfo.loginKey}")`}
    />;
}

export default WalletScreen;