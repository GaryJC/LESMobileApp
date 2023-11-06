import OptionLayout from "./OptionLayout";
import { View, Text, Image, TouchableHighlight } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { LesConstants } from "les-im-components";
import { TwitterConnector } from "../SocialAuth/TwitterSheets";
import { useEffect, useRef, useState } from "react";
import { DiscordConnector } from "../SocialAuth/DiscordSheets";
import SocialMediaService from "../../services/SocialMediaService";
import { SocialMediaBindInfo } from "../../Models/UserProfile";
import { Ionicons } from '@expo/vector-icons';
import JSEvent from "../../utils/JSEvent";
import { DataEvents } from "../../modules/Events";

const { SocialType } = LesConstants;

/**
 * 
 * @param {{socialType:SocialType,handler:(socialType:SocialType, bindInfo:SocialMediaBindInfo)=>void}} param0 
 * @returns 
 */
const LinkButton = ({ socialType, handler }) => {
  const [bindInfo, setBindInfo] = useState(null);

  let icon = null;
  let title = "";

  /**
   * 
   * @param {SocialMediaBindInfo} bind 
   */
  const onSocialMediaBound = (bind) => {
    if (bind.mediaType == socialType) {
      setBindInfo(bind);
    }
  }

  useEffect(() => {
    const info = SocialMediaService.Inst.getSocialMediaBindInfo(socialType);
    const unsubscribeBound = JSEvent.on(DataEvents.SocialMedia.SocialMedia_Bound, onSocialMediaBound);
    setBindInfo(info);

    return () => {
      unsubscribeBound();
    }
  }, [])

  const connected = bindInfo != null && bindInfo.connect;

  switch (socialType) {
    case SocialType.Twitter, SocialType.Twitter_OAuth2:
      icon = require("../../../assets/img/twitter_X.png")
      title = connected ? title = connected ? <BoundTitle bindInfo={bindInfo} /> : bindInfo.socialName : "Connect with X";
      break;
    case SocialType.Telegram:
      icon = require("../../../assets/img/telegram_icon.png")
      title = title = connected ? <BoundTitle bindInfo={bindInfo} /> : "Connect with Telegram";
      break;
    case SocialType.Discord:
      icon = require("../../../assets/img/discord_icon.png")
      title = connected ? <BoundTitle bindInfo={bindInfo} /> : "Connect with Discord";
      break;
  }


  return (
    <TouchableHighlight
      className="my-[5px] overflow-hidden rounded-xl"
      onPress={() => handler?.call(this, socialType)}
    >
      <View className="px-[15px] py-[10px] bg-clr-bglight flex-row items-center justify-between">
        <Text className="text-white text-base font-bold">{title}</Text>
        <Image className="w-[30px] h-[30px]" source={icon} />
      </View>
    </TouchableHighlight>
  );
};

const BoundTitle = ({ bindInfo }) => {
  return <View className="flex flex-row items-center">
    <Text className="text-white text-base font-bold" >{bindInfo.socialName}</Text>
    <View className="w-[24px] h-[24px] rounded-full p-[2px] ml-4" style={{ backgroundColor: '#5EFF57' }}>
      <Ionicons name="checkmark-done" size={20} color="black" />
    </View>
  </View>
}

const Links = () => {

  const twitterConnector = useRef(null);
  const discordConnector = useRef(null);

  /**
   * 
   * @param {SocialType} socialType 
   * @param {SocialMediaBindInfo} bindInfo 
   */
  const onButtonPressed = (socialType, bindInfo) => {
    switch (socialType) {
      case SocialType.Twitter_OAuth2:
        twitterConnector.current.doConnect(onTwitterResult);
        break;
      case SocialType.Discord:
        discordConnector.current.doConnect(onDiscordResult);
        break;
    }
  }
  /**
   * @param {ErrorCodes} code
   * @param {SocialMediaBindInfo} bindInfo
   */
  const onTwitterResult = (code, bindInfo) => {

  }
  /**
 * @param {ErrorCodes} code
 * @param {SocialMediaBindInfo} bindInfo
 */
  const onDiscordResult = (code, bindInfo) => {

  }

  const icon = <Entypo name="link" size={24} color="white" />;
  return (
    <View>
      <OptionLayout title={"Links"} icon={icon} childStyle={{ marginLeft: 0 }}>
        <LinkButton
          socialType={SocialType.Twitter_OAuth2}
          handler={onButtonPressed}
        />
        <LinkButton
          socialType={SocialType.Discord}
          handler={onButtonPressed}
        />
      </OptionLayout>
      <TwitterConnector
        ref={twitterConnector}
      />
      <DiscordConnector
        ref={discordConnector}
      />
    </View>
  );
};

export default Links;
