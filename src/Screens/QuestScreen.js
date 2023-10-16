import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Linking, Text, View } from 'react-native';
import HighlightButton from '../Components/HighlightButton';
import { TwitterConnector, TwitterFollowSheet, TwitterFollowVerifySheet } from '../Components/SocialAuth/TwitterSheets';
import { CommunityData, EntryTemplateType, QuestData, QuestEntryData, QuestUserEntryProgress, QuestUserProgress, hasProgress } from '../Models/Quest';
import DataCenter from '../modules/DataCenter';
import QuestService from '../services/QuestService';
import formatDate from '../utils/formatDate';
import SocialMediaService from '../services/SocialMediaService';
import { LesConstants } from 'les-im-components';
import { DiscordConnector } from '../Components/SocialAuth/DiscordSheets';

const QuestBtnId = {
    TwitterFollow: "twitter_follow",
    TwitterFollowVerify: "twitter_follow_verify",
    TwitterQuote: "twitter_quote",
    TwitterQuoteVerify: "twitter_quote_verify",
    TwitterRetweet: "twitter_retweet",
    TwitterRetweetVerify: "twitter_retweet_verify",
    CopyReferralCode: "copy_referral_code",
    DiscordJoin: "discord_join",
    DiscordJoinVerify: "discord_join_verify",

}

const verifyCooldown = 60;

const QuestScreen = ({ }) => {
  /**
   * @type {[quest:QuestData]} p
   */
  const [quest, setQuest] = useState(null);

  /**
   * @type {[communityData:CommunityData]}
   */
  const [communityData, setCommunityData] = useState(null);

  const [focus, setFocus] = useState(false);

  /**
   * @type {[questProgress: QuestUserProgress]}
   */
  const [questProgress, setQuestProgress] = useState(null);

  const [followName, setFollowName] = useState("");

    const twitterConnector = useRef(null);
    const twitterVerifier = useRef(null);

    const discordConnector = useRef(null);

  const nav = useNavigation();

  useEffect(() => {
    //临时调用方式，id暂时不用写
    QuestService.Inst.getQuestInfo().then((qd) => {
      setQuest(qd);
    });

    const focusListener = (e) => {
      if (e.type == "focus") {
        //获得焦点
        setFocus(true);
      } else {
        //失去焦点
        setFocus(false);
      }
    };
    nav.addListener("focus", focusListener);
    nav.addListener("blur", focusListener);
  }, []);

  useEffect(() => {
    if (quest == null) return;
    QuestService.Inst.getCommunityInfo(quest.conmmuityId).then((c) => {
      setCommunityData(c);
    });
    QuestService.Inst.getUserQuestProgress(quest.questId).then((p) => {
      setQuestProgress([p]);
    });
    QuestService.Inst.getQuestUserInfo().then((u) => {
      DataCenter.userInfo.questUserInfo.update(u);
    });
  }, [quest]);

  useEffect(() => {
    if (focus && questProgress != null) {
      //刷新progress
      QuestService.Inst.getUserQuestProgress(quest.questId).then((p) => {
        setQuestProgress([p]);
      });
    }
  }, [focus]);

  /**
   *
   * @param {QuestBtnId} btnId
   * @param {QuestEntryData} entry
   */
  const onEntryBtnPressed = useCallback(
    (btnId, entry) => {
      console.log(btnId, entry);

        switch (btnId) {
            case QuestBtnId.TwitterFollow:
                twitterConnector?.current.doConnect((r) => {
                    if (r.code == LesConstants.ErrorCodes.Success) {
                        const url = SocialMediaService.Inst.getTwitterFollowLink(entry.getParam(0).paramValue);
                        if (Linking.canOpenURL(url)) {
                            Linking.openURL(url);
                        } else {
                            setFollowName(entry.getParam(0).paramValue)
                        }
                    }
                })
                break;
            case QuestBtnId.TwitterRetweet:
                twitterConnector?.current.doConnect((r) => {
                    if (r.code == LesConstants.ErrorCodes.Success) {
                        const url = SocialMediaService.Inst.getTwitterRetweetLink(entry.getParam(1).paramValue);
                        if (Linking.canOpenURL(url)) {
                            Linking.openURL(url);
                        } else {
                            setFollowName(entry.getParam(1).paramValue)
                        }
                    }
                })
                break;
            case QuestBtnId.TwitterQuote:
                twitterConnector?.current.doConnect((r) => {
                    if (r.code == LesConstants.ErrorCodes.Success) {
                        const url = SocialMediaService.Inst.getTwitterQuoteLink(entry.getParam(2).paramValue, entry.getParam(1).paramValue, entry.getParam(0).paramValue);
                        if (Linking.canOpenURL(url)) {
                            Linking.openURL(url);
                        } else {
                            setFollowName(entry.getParam(1).paramValue)
                        }
                    }
                })
                break;
            case QuestBtnId.DiscordJoin:
                discordConnector?.current.doConnect(r => {
                    if (r.code == LesConstants.ErrorCodes.Success) {
                        const url = entry.getParam(0).paramValue;
                        if (Linking.canOpenURL(url)) {
                            Linking.openURL(url);
                        }
                    }
                })
                break;

            case QuestBtnId.TwitterRetweetVerify:
            case QuestBtnId.TwitterQuoteVerify:
            case QuestBtnId.TwitterFollowVerify:
            case QuestBtnId.DiscordJoinVerify:
                twitterVerifier?.current.verify(quest.questId, entry.entryId, r => {
                    if (r.verified) {
                        const p = questProgress[0].getEntryProgress(r.entryId);
                        p.completed = true;
                        setQuestProgress([...questProgress]);
                    }
                })
                break;
        }
    }, [quest, questProgress]);

  const qp = questProgress ? questProgress[0] : null;

    return <View className="flex-1 px-[5vw] pb-3">
        <CommunityTitle communityData={communityData}>
            <QuestTitle quest={quest} />
        </CommunityTitle>
        <FlatList
            className="flex flex-1 mt-2 mb-2"
            data={quest?.entries}
            renderItem={({ item, index }) => {
                return <QuestEntryBar
                    entry={item}
                    entryProgress={qp?.getEntryProgress(item.entryId) ?? null}
                    onEntryBtnPressed={onEntryBtnPressed}
                />
            }}
        />
        <RewardPanel quest={quest} questProgress={qp} />
        <TwitterConnector
            ref={twitterConnector}
        />
        <TwitterFollowSheet
            show={followName != null && followName != ""}
            onClosed={() => setFollowName("")}
            followName={followName}
        />
        <TwitterFollowVerifySheet
            ref={twitterVerifier}
        />

        <DiscordConnector
            ref={discordConnector}
        />
    </View>
  );
};
/**
 *
 * @param {{quest:QuestData}} params
 * @returns
 */
const QuestTitle = ({ quest }) => {
  let txtTime = "";
  if (quest == null) {
    return <></>;
  }
  if (quest.startTime > 0) {
    const startDate = new Date(quest.startTime);
    txtTime = formatDate(startDate, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      timeZoneName: "short",
    });
  }
  if (quest.endTime > 0) {
    const endData = new Date(quest.endTime);
    txtTime +=
      " ~ " +
      formatDate(endData, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
      });
  } else if (txtTime != "") {
    txtTime += " ~ N/A";
  }

  const timeDom =
    txtTime == "" ? (
      <></>
    ) : (
      <View className="flex flex-row m-1 py-[2px] px-2 bg-clr-emphasize-light border border-clr-emphasize rounded-full">
        <View>
          <Text className="font-bold text-xs">{txtTime}</Text>
        </View>
      </View>
    );

  return (
    <View className="flex">
      <View className="flex flex-row">
        <View className="flex flex-row m-1 py-[2px] px-2 bg-clr-emphasize-light border border-clr-emphasize rounded-full">
          <View>
            <Text className="font-bold text-xs">Ongoing</Text>
          </View>
        </View>
        {timeDom}
      </View>
      <Text className="text-clr-light text-xl font-bold px-1 pb-1">
        {quest?.questName}
      </Text>
    </View>
  );
};

/**
 *
 * @param {{communityData:CommunityData}} params
 * @returns
 */
const CommunityTitle = ({ communityData, children }) => {
  if (communityData == null) {
    return (
      <View className="flex bg-clr-bglight rounded-md ">
        <View className="flex flex-row justify-start items-center p-2">
          <View className="w-12 h-12"></View>
        </View>
        <View className="flex p-2">{children}</View>
      </View>
    );
  }

  const logo =
    communityData.logoUrl == "" ? require("../../assets/icon.png") : logo;

  return (
    <View className="flex bg-clr-bglight rounded-md">
      <View className="flex flex-row justify-start items-center px-2 py-1">
        <Image className="w-12 h-12" source={logo} />
        <Text className="px-2 text-clr-light text-xl font-bold">
          {communityData.name}
        </Text>

        {communityData.verified ? (
          <View className=" bg-green-300 rounded-full p-[2px] border border-black">
            <Ionicons name="shield-checkmark-outline" size={20} color="black" />
          </View>
        ) : (
          <></>
        )}
      </View>
      <View className="flex px-2">{children}</View>
    </View>
  );
};

/**
 *
 * @param {{entry:QuestEntryData,entryProgress:QuestUserEntryProgress, onEntryBtnPressed:(btnId:string, entry:QUestEntryData)=>void}} p
 * @returns
 */
const QuestEntryBar = ({ entry, entryProgress, onEntryBtnPressed }) => {

    const viewClass = "my-[1px] p-2 bg-clr-bglight rounded-md flex border flex "
        + (entryProgress?.completed ? " border-green-300 " : "")

    return <View className={viewClass}>
        <View className="flex flex-row h-[24px]">
            <View className="flex-1">
                {entry.getEntryTitleDom()}
            </View>
            <View>
                {
                    entryProgress?.completed ?
                        <Ionicons name="checkmark-done" size={20} color="#C8FF00" />
                        : <></>
                }
            </View>
        </View>
        <View className="flex flex-row">
            <View className="flex-1">
                <EntryProgress entry={entry} entryProgress={entryProgress} />
            </View>
            <EntryButtons entry={entry} entryProgress={entryProgress} onEntryBtnPressed={onEntryBtnPressed} />
        </View>
    </View>
  );
};

/**
 *
 * @param {{entry:QuestEntryData,entryProgress:QuestUserEntryProgress}} p
 * @returns
 */
const EntryProgress = ({ entry, entryProgress }) => {
  const hp = hasProgress(entry);
  let dom = null;
  if (hp) {
    if (entryProgress == null) {
      entryProgress = new QuestUserEntryProgress();
    }

    let textClass = "font-bold text-md ";
    if (entryProgress.completed) {
      textClass += "text-green-400";
    } else {
      textClass += "text-gray-300";
    }

    dom = (
      <View>
        <Text className={textClass}>
          Progress: {entryProgress.getRecord(0, 0)}/
          {entry.getParam(0).paramValue}{" "}
        </Text>
      </View>
    );
  }
  return dom;
};

/**
 *
 * @param {{entry:QuestEntryData,entryProgress:QuestUserEntryProgress, onEntryBtnPressed:(btnId:string, entry:QUestEntryData)=>void}} p
 * @returns
 */
const EntryButtons = ({ entry, entryProgress, onEntryBtnPressed }) => {
    let dom = null;

    if (entryProgress?.completed)
        dom = <View></View>
    else
        switch (entry.templateId) {
            case EntryTemplateType.NexGamiReferNewUsers:
                const referralCode = DataCenter.userInfo.userProfile.referralCode;
                dom = <HighlightButton type="light"
                    text={referralCode} icon={<MaterialIcons name="file-copy" size={20} color="black" />}
                    onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.CopyReferralCode, entry)
                        }
                    }}
                />
                break;
            case EntryTemplateType.TwitterFollow:
                dom = <View className="flex flex-row">
                    <HighlightButton icon={
                        <Image source={require("../../assets/img/twitter_icon.png")} className="w-[18px] h-[18px]" />
                    } type="light" text="Follow" onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.TwitterFollow, entry)
                        }
                    }}></HighlightButton>
                    <HighlightButton type="emphasize" text="Verify" cooldown={verifyCooldown} onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.TwitterFollowVerify, entry)
                        }
                    }}></HighlightButton>
                </View>
                break;
            case EntryTemplateType.TwitterQuote:
                dom = <View className="flex flex-row">
                    <HighlightButton icon={<Image source={require("../../assets/img/twitter_icon.png")} className="w-[18px] h-[18px]" />}
                        type="light" text="Quote" onPress={() => {
                            if (onEntryBtnPressed) {
                                onEntryBtnPressed(QuestBtnId.TwitterQuote, entry)
                            }
                        }}></HighlightButton>
                    <HighlightButton type="emphasize" text="Verify" cooldown={verifyCooldown} onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.TwitterQuoteVerify, entry)
                        }
                    }}></HighlightButton>
                </View>
                break;
            case EntryTemplateType.TwitterRetweet:
                dom = <View className="flex flex-row">
                    <HighlightButton icon={<Image source={require("../../assets/img/twitter_icon.png")} className="w-[18px] h-[18px]" />}
                        type="light" text="Retweet" onPress={() => {
                            if (onEntryBtnPressed) {
                                onEntryBtnPressed(QuestBtnId.TwitterRetweet, entry)
                            }
                        }}></HighlightButton>
                    <HighlightButton type="emphasize" text="Verify" cooldown={verifyCooldown} onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.TwitterQuoteVerify, entry)
                        }
                    }}></HighlightButton>
                </View>
                break;

            case EntryTemplateType.DiscordJoin:
                dom = <View className="flex flex-row">
                    <HighlightButton icon={<Image source={require("../../assets/img/discord_icon.png")} className="w-[18px] h-[18px]" />}
                        type="light" text="Join" onPress={() => {
                            if (onEntryBtnPressed) {
                                onEntryBtnPressed(QuestBtnId.DiscordJoin, entry)
                            }
                        }}></HighlightButton>
                    <HighlightButton type="emphasize" text="Verify" cooldown={verifyCooldown} onPress={() => {
                        if (onEntryBtnPressed) {
                            onEntryBtnPressed(QuestBtnId.DiscordJoinVerify, entry)
                        }
                    }}></HighlightButton>
                </View>
                break;
        }

  return dom;
};

/**
 *
 * @param {{quest:QuestData,questProgress:QuestUserProgress}} p
 * @returns
 */
const RewardPanel = ({ quest, questProgress }) => {
  const [loading, setLoading] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(
    questProgress?.rewardClaimed ?? false
  );

  const claimReward = () => {
    setLoading(true);

    QuestService.Inst.claimReward(quest.questId)
      .then((reward) => {
        setLoading(false);
        setRewardClaimed(true);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  return (
    <View className="bg-clr-bglight flex p-2 rounded-md">
      <View>
        <View className="flex flex-row items-center">
          <Text className="text-white font-bold text-2xl flex-1">Reward</Text>
          {rewardClaimed ? (
            <Ionicons name="checkmark-done-circle" size={28} color="#C8FF00" />
          ) : (
            <></>
          )}
          <HighlightButton
            disabled={rewardClaimed}
            type="primary"
            text={rewardClaimed ? "Claimed Reward" : "Claim Reward"}
            onPress={(e) => claimReward()}
            isLoading={loading}
          />
        </View>
        <View className="h-[1px] bg-gray-600 my-2"></View>
      </View>
      <View className="flex flex-row">
        <View className="flex-1 flex flex-row items-center mr-2">
          <RewardItem
            icon={require("../../assets/img/icon_point.png")}
            points={quest?.getRewardPoints()}
            unit={"points"}
          />

          {/* <Text className="text-clr-light flex-1">Point:</Text>
                <Image source={require("../../assets/img/icon_point.png")} className="w-[20px] h-[30px] mr-1" resizeMode="contain" />
                <Text className="text-clr-light font-bold text-base">{quest?.getRewardPoints()} points</Text> */}
        </View>
      </View>
    </View>
  );
};

const RewardItem = ({ icon, points, unit }) => (
  <View className="flex flex-row">
    <Image
      source={icon}
      className="w-[30px] h-[40px] mr-1"
      resizeMode="contain"
    />
    <View className="flex">
      <Text className="text-clr-light font-bold text-sm">{points}</Text>
      <Text className="text-clr-light text-xs">{unit}</Text>
    </View>
  </View>
);

export default QuestScreen;
