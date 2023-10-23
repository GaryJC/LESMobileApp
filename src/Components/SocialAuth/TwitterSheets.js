import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import WebView from "react-native-webview"
import CommonBottomSheetModal from "../CommonBottomSheetModal"
import HighlightButton from "../HighlightButton"
import { Image, Text, View, ActivityIndicator } from "react-native"
import { LesConstants, LesPlatformCenter } from "les-im-components"
import PBUtils from "../../utils/PBUtils"
import DataCenter from "../../modules/DataCenter"
import { FontAwesome } from "@expo/vector-icons";
import { SocialMediaBindInfo } from "../../Models/UserProfile"
import SocialMediaService from "../../services/SocialMediaService"
import QuestService from "../../services/QuestService"

const { ErrorCodes, SocialType } = LesConstants;

const TwitterBindingSheet = ({ show, onClosed }) => {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);
    }, [show])
    return <CommonBottomSheetModal
        closable={false}
        visible={visible}
        onClosed={onClosed}
        snapPoints={["30%"]}
        index={0}
    >
        <View className="flex-1 flex m-5 items-center">
            <Text className="text-white text-xl font-bold pb-2">
                Binding
            </Text>
            <Text className="text-white pb-3 text-sm">
                The account is connecting, please wait amoment...
            </Text>
            <ActivityIndicator size="large" color="white" className="mr-2" />
        </View>
    </CommonBottomSheetModal>
}

/**
 * 
 * @param {{show:boolean, token:string, onClosed:()=>void, onRecvAuthData:(oauthToken:string, tokenVerifier:string)=>void}} param0 
 * @returns 
 */
const TwitterAuthSheet = ({ show, token, onClosed, onRecvAuthData }) => {
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
            source={{ uri: SocialMediaService.Inst.getTwitterAuthLink(token) }}
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

const TwitterPreConnectSheet = ({ show, onClosed, onTokenGot }) => {
    const [visible, setVisible] = useState(show);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setVisible(show);
    }, [show])

    const getToken = () => {
        setLoading(true);
        SocialMediaService.Inst.requestTwitterOauthToken()
            .then(token => {
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
                Connect your Twitter account
            </Text>
            <Text className="text-white pb-3 text-sm">
                Twitter account is not connected. Please connect your Twitter account.
            </Text>
            <View className="">
                <HighlightButton
                    onPress={getToken}
                    isLoading={loading}
                    icon={
                        <Image source={require("../../../assets/img/twitter_icon.png")} className="w-[30px] h-[30px]" />
                    }
                    type="light"
                    text={<Text className="text-xl font-bold">Connect Twitter</Text>}
                />
            </View>
        </View>
    </CommonBottomSheetModal>
}

const TwitterConnectSheet = ({ show, onClosed, onBindResult, oauthToken, tokenVerifier }) => {
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
        SocialMediaService.Inst.requestTwitterConnect(oauthToken, tokenVerifier)
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
                    <Image source={require("../../../assets/img/twitter_icon.png")} className="w-[24px] h-[24px] mr-2" />
                    <Text className="text-white font-bold">@{bindInfo?.socialName}</Text>
                </View>
                <HighlightButton text=" Ok " type="primary" onPress={() => setVisible(false)} />
            </View>
        } else {
            const twitterAcc = bindInfo == null ? "" : `(@${bindInfo.socialName})`;
            switch (errorCode) {
                case ErrorCodes.SocialMediaConnectInCD:
                    const cd = 86400000 + 3600000 * 8 + 60000 * 5;//bindInfo.reconnectCd;
                    const day = cd / (86400000);
                    const hour = (cd % (86400000)) / (3600000);
                    const minute = (cd % 3600000) / (60000);

                    let cdStr = "";
                    if (day > 0) {
                        cdStr = day.toFixed(0) + " days ";
                    }
                    if (hour > 0 || day > 0) {
                        cdStr += hour.toFixed(0) + " hours ";
                    }
                    if (minute > 0) {
                        cdStr += minute.toFixed(0) + " minutes "
                    }

                    info = `This Twitter${twitterAcc} has been disconnected. Please try in ${cdStr}later.`;
                    break;
                case ErrorCodes.SocialMediaAlreadyBound:
                    info = `Your Twitter${twitterAcc} has been already bound to another account.`;
                    break;
                default:
                    info = "Connect to Twitter failed, please try again later.";
                    break;
            }


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
            <Text className="text-white pb-3 text-base">
                {info}
            </Text>
            <View className="">
                {body}
            </View>
        </View>
    </CommonBottomSheetModal>

}

const TwitterFollowSheet = ({ show, onClosed, followName, onRecvAuthData }) => {
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
            source={{ uri: SocialMediaService.Inst.getTwitterFollowLink(followName) }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
        />
    </CommonBottomSheetModal>
}

//({ show, onClosed, questId, entryId, onVerified }) => {

const TwitterFollowVerifySheet = React.forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [params, setParams] = useState(null);

    useImperativeHandle(ref, () => {
        return {
            verify: (questId, entryId, onVerified) => {
                setParams({ questId, entryId, onVerified })
                setVisible(true);
            }
        }
    });

    const onIndexChanged = (index) => {
        if (index == 0) {
            QuestService.Inst.verifyQuestEntry(params.questId, params.entryId)
                .then(r => {
                    // setTimeout(() => {
                    setVisible(false);
                    params.onVerified(r);
                    // }, 2000)
                }).catch(e => {
                    setVisible(false);
                });
        }
    }

    return <CommonBottomSheetModal
        onIndexChanged={onIndexChanged}
        closable={false}
        visible={visible}
        snapPoints={["30%"]}
        index={0}
    >
        <View className="flex-1 flex m-5 items-center">
            <Text className="text-white text-xl font-bold pb-2">
                Verifying
            </Text>
            <Text className="text-white pb-3 text-sm">
                Please wait amoment...
            </Text>
            <ActivityIndicator size="large" color="white" className="mr-2" />
        </View>
    </CommonBottomSheetModal>
})

/**
 * 连接twitter账号
 */
const TwitterConnector = React.forwardRef((props, ref) => {
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
                SocialMediaService.Inst.TwitterAuthMode = "oauth2";
                var bindInfo = SocialMediaService.Inst.getSocialMediaBindInfo(SocialType.Twitter_OAuth2);
                console.log(bindInfo)
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
        <TwitterPreConnectSheet show={show} onClosed={() => setShow(false)} onTokenGot={token => {
            setShowAuth(true);
            setToken(token);
        }} />

        <TwitterAuthSheet
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

        <TwitterConnectSheet
            show={showBinding}
            oauthToken={token}
            tokenVerifier={tokenVerifier}
            onClosed={() => setShowBinding(false)}
            onBindResult={r => onBindResult(r)}
        />

    </>
})

export { TwitterConnector, TwitterFollowSheet, TwitterFollowVerifySheet }