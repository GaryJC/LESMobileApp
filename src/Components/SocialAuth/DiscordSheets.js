import { LesConstants } from "les-im-components";
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import SocialMediaService from "../../services/SocialMediaService"
import CommonBottomSheetModal from "../CommonBottomSheetModal"
import WebView from "react-native-webview"
import HighlightButton from "../HighlightButton"
import { Image, Text, View, ActivityIndicator } from "react-native"
import { FontAwesome } from "@expo/vector-icons";
import PBUtils from "../../utils/PBUtils";
import DataCenter from "../../modules/DataCenter";

const { ErrorCodes, SocialType } = LesConstants;

const DiscordPreConnectSheet = ({ show, onClosed, onTokenGot }) => {
    const [visible, setVisible] = useState(show);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setVisible(show);
    }, [show])

    const getToken = () => {
        setLoading(true);
        SocialMediaService.Inst.requestDiscordOauthToken()
            .then(token => {
                console.log(token);
                setLoading(false);
                if (onTokenGot != null) {
                    onTokenGot(token.oauthToken);
                }
            }
            ).catch(e => {
                setLoading(false);
            })

        // setTimeout(() => {
        //     if (visible) {
        //         setVisible(false);
        //         if (onTokenGot != null) {
        //             onTokenGot("j9o0VgAAAAABpCWkAAABisPfm_Y");
        //         }
        //     }
        // }, 1000)
    }

    const handleClosed = () => {
        if (onClosed != null) onClosed();
        setLoading(false);
    }

    return <CommonBottomSheetModal
        closable={!loading}
        visible={visible}
        onClosed={handleClosed}
        snapPoints={["30%"]}
        index={0}
    >
        <View className="flex-1 flex m-5 items-center">
            <Text className="text-white text-xl font-bold pb-2">
                Connect your Discord account
            </Text>
            <Text className="text-white pb-3 text-xs">
                Discord account is not connected. Please connect your Discord account.
            </Text>
            <View className="">
                <HighlightButton
                    onPress={getToken}
                    isLoading={loading}
                    icon={
                        <Image source={require("../../../assets/img/discord_icon.png")} className="w-[30px] h-[30px]" />
                    }
                    type="light"
                    text={<Text className="text-xl font-bold">Connect Discord</Text>}
                />
            </View>
        </View>
    </CommonBottomSheetModal>
}

/**
 * 
 * @param {{show:boolean, token:string, onClosed:()=>void, onRecvAuthData:(oauthToken:string, tokenVerifier:string)=>void}} param0 
 * @returns 
 */
const DiscordAuthSheet = ({ show, token, onClosed, onRecvAuthData }) => {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);
    }, [show])

    return <CommonBottomSheetModal
        visible={visible}
        onClosed={onClosed}
        snapPoints={["90%"]}
        index={0}
    >
        <WebView
            source={{ uri: token }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            onMessage={data => {
                const msg = JSON.parse(data.nativeEvent.data);
                console.log("receive message:", msg);
                if (msg.command == "twitter_auth") {
                    setVisible(false);
                    if (onRecvAuthData != null) {
                        onRecvAuthData(msg.oauth_token, msg.oauth_verifier);
                    }
                }
            }}
        />
    </CommonBottomSheetModal>
}


const DiscordConnectSheet = ({ show, onClosed, onBindResult, oauthToken, tokenVerifier }) => {
    const [visible, setVisible] = useState(show);
    const [loading, setLoading] = useState(false);
    const [bindInfo, setBindInfo] = useState(null);
    const [errorCode, setErrorCode] = useState(0);

    useEffect(() => {

    }, [])

    useEffect(() => {
        setVisible(show);
    }, [show])

    const onOpen = () => {
        setLoading(true);
        SocialMediaService.Inst.requestDiscordConnect(oauthToken, tokenVerifier)
            .then(r => {
                setLoading(false);
                const bindInfo = PBUtils.pbBindInfoToData(r);
                setBindInfo(bindInfo);
                setErrorCode(0);
                DataCenter.userInfo.userProfile.setSocialMedialBindInfo(bindInfo);
            }).catch(e => {
                setLoading(false);
                setErrorCode(e.retCode);
                const bindInfo = e.bindInfo == null ? null : PBUtils.pbBindInfoToData(e.bindInfo);
                setBindInfo(bindInfo);
            })
    }


    const handleClosed = () => {
        if (onBindResult != null) onBindResult({ code: errorCode, bindInfo });
        if (onClosed != null) onClosed();
        setLoading(false);
        setErrorCode(0);
    }

    let body = <ActivityIndicator size="large" color="white" className="mr-2" />;
    let info = "The account is connecting, please wait amoment...";
    let title = "Connecting"


    if (!loading) {
        if (errorCode == ErrorCodes.Success) {
            title = "Connected Successfully";
            info = ""
            body = <View className="flex justify-center items-center">
                <FontAwesome name="check-circle" size={40} color="green" />
                <View className="flex flex-row py-2 items-center">
                    <Image source={require("../../../assets/img/discord_icon.png")} className="w-[24px] h-[24px] mr-2" />
                    <Text className="text-white font-bold">{bindInfo?.socialName}</Text>
                </View>
                <HighlightButton text=" Ok " type="primary" onPress={() => setVisible(false)} />
            </View>
        } else {
            info = "Connect to Discord failed, please try again later.";
            title = "Connect Failed"
            body = <HighlightButton text="Close" type="primary" onPress={() => {
                setVisible(false);
            }}></HighlightButton>;
        }
    }

    return <CommonBottomSheetModal
        closable={!loading}
        visible={visible}
        onOpen={onOpen}
        onClosed={handleClosed}
        snapPoints={["35%"]}
        index={0}
    >
        <View className="flex-1 flex m-5 items-center">
            <Text className="text-white text-xl font-bold pb-2">
                {title}
            </Text>
            <Text className="text-white pb-3 text-xs">
                {info}
            </Text>
            <View className="">
                {body}
            </View>
        </View>
    </CommonBottomSheetModal>

}

/**
 * 连接Discord账号
 */
const DiscordConnector = React.forwardRef((props, ref) => {
    const [show, setShow] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showBinding, setShowBinding] = useState(false);
    const [token, setToken] = useState("");
    const [tokenVerifier, setTokenVerifier] = useState("");
    const [onResult, setOnResult] = useState(null);

    useImperativeHandle(ref, () => {
        return {
            /**
             * @param {(code:ErrorCodes,bindInfo:SocialMediaBindInfo)=> void} onResult
             */
            doConnect: (onResult) => {
                var bindInfo = SocialMediaService.Inst.getSocialMediaBindInfo(SocialType.Discord);
                if (bindInfo == null || !bindInfo.connect) {
                    setOnResult({ callback: onResult });
                    setShow(true);
                } else {
                    setShow(false);
                    setShowAuth(false);
                    setShowBinding(false);
                    setOnResult(null);
                    if (onResult) onResult({ code: ErrorCodes.Success, bindInfo })
                }
            }
        }
    })

    const onBindResult = useCallback((r) => {
        setShow(false);
        setShowAuth(false);
        setShowBinding(false);
        setToken("");
        setTokenVerifier("");
        if (onResult != null && onResult.callback != null) onResult.callback(r);
    }, [onResult])

    return <>
        <DiscordPreConnectSheet show={show} onClosed={() => setShow(false)} onTokenGot={token => {
            setShowAuth(true);
            setToken(token);
        }} />

        <DiscordAuthSheet
            show={showAuth}
            token={token}
            onClosed={() => {
                setShowAuth(false)
                if (tokenVerifier != "") {
                    setShowBinding(true);
                }
            }}
            onRecvAuthData={(token, verifier) => {
                setTokenVerifier(verifier);
            }}
        />
        <DiscordConnectSheet
            show={showBinding}
            oauthToken={token}
            tokenVerifier={tokenVerifier}
            onClosed={() => setShowBinding(false)}
            onBindResult={r => onBindResult(r)}
        />

    </>
})
export { DiscordConnector }