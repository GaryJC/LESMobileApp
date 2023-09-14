import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import { useEffect, useState } from 'react';
import { Button, FlatList, Image, Text, View } from 'react-native';
import { CommunityData, EntryTemplateType, QuestData, QuestEntryData, QuestUserEntryProgress, QuestUserProgress, hasProgress } from '../Models/Quest';
import QuestService from '../services/QuestService';
import HighlightButton from '../Components/HighlightButton';
import DataCenter from '../modules/DataCenter';
import formatDate from '../utils/formatDate';

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

    const nav = useNavigation();


    useEffect(() => {
        //临时调用方式，id暂时不用写
        QuestService.Inst.getQuestInfo().then(qd => {
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
    }, [])

    useEffect(() => {
        if (quest == null) return;
        QuestService.Inst.getCommunityInfo(quest.conmmuityId).then(c => {
            setCommunityData(c);
        });
        QuestService.Inst.getUserQuestProgress(quest.questId).then(p => {
            setQuestProgress(p);
        })
        QuestService.Inst.getQuestUserInfo().then(u => {
            DataCenter.userInfo.questUserInfo.update(u);
        })
    }, [quest])

    useEffect(() => {
        if (focus && questProgress != null) {
            //刷新progress
            QuestService.Inst.getUserQuestProgress(quest.questId).then(p => {
                setQuestProgress(p);
            })
        }
    }, [focus])


    return <View className="flex-1 px-[5vw] pb-3">
        <CommunityTitle communityData={communityData}>
            <QuestTitle quest={quest} />
        </CommunityTitle>
        <FlatList
            className="flex-1 mt-2 mb-2"
            data={quest?.entries}
            renderItem={({ item, index }) => {
                return <QuestEntryBar entry={item} entryProgress={questProgress?.getEntryProgress(item.entryId) ?? null} />
            }}
        />
        <RewardPanel quest={quest} questProgress={questProgress} />
    </View>
}
/**
 * 
 * @param {{quest:QuestData}} params
 * @returns 
 */
const QuestTitle = ({ quest }) => {
    let txtTime = "";
    if (quest == null) {
        return <></>
    }
    if (quest.startTime > 0) {
        const startDate = new Date(quest.startTime);
        txtTime = formatDate(startDate, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            timeZoneName: 'short'
        });
    }
    if (quest.endTime > 0) {
        const endData = new Date(quest.endTime);
        txtTime += " ~ " + formatDate(endData, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
        });
    } else if (txtTime != "") {
        txtTime += " ~ N/A"
    }

    const timeDom = txtTime == "" ? <></> :
        <View className="flex flex-row m-1 py-[2px] px-2 bg-clr-emphasize-light border border-clr-emphasize rounded-full">
            <View><Text className="font-bold text-xs">{txtTime}</Text></View>
        </View>

    return <View className="flex">
        <View className="flex flex-row">
            <View className="flex flex-row m-1 py-[2px] px-2 bg-clr-emphasize-light border border-clr-emphasize rounded-full">
                <View><Text className="font-bold text-xs">Ongoing</Text></View>
            </View>
            {timeDom}
        </View>
        <Text className="text-clr-light text-xl font-bold px-1 pb-1">{quest?.questName}</Text>
    </View>
}

/**
 * 
 * @param {{communityData:CommunityData}} params
 * @returns 
 */
const CommunityTitle = ({ communityData, children }) => {

    if (communityData == null) {
        return <View className="flex bg-clr-bglight rounded-md ">
            <View className="flex flex-row justify-start items-center p-2">
                <View className="w-12 h-12"></View>
            </View>
            <View className="flex p-2">
                {children}
            </View>
        </View>
    }

    const logo = communityData.logoUrl == "" ? require("../../assets/icon.png") : logo;

    return <View className="flex bg-clr-bglight rounded-md">
        <View className="flex flex-row justify-start items-center px-2 py-1">
            <Image
                className="w-12 h-12"
                source={logo}
            />
            <Text className="px-2 text-clr-light text-xl font-bold">{communityData.name}</Text>

            {communityData.verified ? <View className=" bg-green-300 rounded-full p-[2px] border border-black">
                <Ionicons name="shield-checkmark-outline" size={20} color="black" />
            </View> : <></>}
        </View>
        <View className="flex px-2">
            {children}
        </View>
    </View>
}

/**
 * 
 * @param {{entry:QuestEntryData,entryProgress:QuestUserEntryProgress}} p 
 * @returns 
 */
const QuestEntryBar = ({ entry, entryProgress }) => {

    const viewClass = "my-[1px] p-2 bg-clr-bglight rounded-md flex border flex-1 " +
        (entryProgress?.completed ? "border-green-300 " : "")

    return <View className={viewClass}>
        <View className="flex flex-1 flex-row h-[24px]">
            <View className="flex-1">
                {entry.getEntryTitleDom()}
            </View>
            <View>
                {
                    entryProgress?.completed ?
                        <Ionicons name="checkmark-done" size={20} color="#C8FF00" />
                        : null
                }
            </View>
        </View>
        <View className="flex flex-row">
            <View className="flex-1">
                <EntryProgress entry={entry} entryProgress={entryProgress} />
            </View>
            <View className="flex">
                {
                    entryProgress?.completed ?
                        null :
                        <EntryButtons entry={entry} entryProgress={entryProgress} />
                }
            </View>
        </View>
    </View>
}

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
            textClass += "text-green-400"
        } else {
            textClass += "text-gray-300"
        }

        dom = <View>
            <Text className={textClass}>Progress: {entryProgress.getRecord(0, 0)}/{entry.getParam(0).paramValue} </Text>
        </View>
    }
    return dom;
}

/**
 * 
 * @param {{entry:QuestEntryData,entryProgress:QuestUserEntryProgress}} p 
 * @returns 
 */
const EntryButtons = ({ entry, entryProgress }) => {
    let dom = null;
    switch (entry.templateId) {
        case EntryTemplateType.NexGamiReferNewUsers:
            const referralCode = DataCenter.userInfo.userProfile.referralCode;
            dom = <HighlightButton type="light" text={"Copy Code: " + referralCode} />
            break;
        case EntryTemplateType.TwitterFollow:
            dom = <View className="flex flex-row">
                <HighlightButton icon={require("../../assets/img/twitter_icon.png")} type="light" text="Follow"></HighlightButton>
                <HighlightButton type="emphasize" text="Verify"></HighlightButton>
            </View>
            break;
        case EntryTemplateType.TwitterTweet:
            dom = <View className="flex flex-row">
                <HighlightButton icon={require("../../assets/img/twitter_icon.png")} type="light" text="Tweet"></HighlightButton>
                <HighlightButton type="emphasize" text="Verify"></HighlightButton>
            </View>
            break;
        case EntryTemplateType.TwitterRetweet:
            dom = <View className="flex flex-row">
                <HighlightButton icon={require("../../assets/img/twitter_icon.png")} type="light" text="Retweet"></HighlightButton>
                <HighlightButton type="emphasize" text="Verify"></HighlightButton>
            </View>
            break;
    }

    return dom;
}

/**
 * 
 * @param {{quest:QuestData,questProgress:QuestUserProgress}} p 
 * @returns 
 */
const RewardPanel = ({ quest, questProgress }) => {

    const [loading, setLoading] = useState(false);
    const [rewardClaimed, setRewardClaimed] = useState(questProgress?.rewardClaimed ?? false);

    const claimReward = () => {
        setLoading(true);

        QuestService.Inst.claimReward(quest.questId).then(reward => {
            setLoading(false);
            setRewardClaimed(true);
        }).catch(e => {
            setLoading(false);
        })

    }

    return <View className="bg-clr-bglight flex p-2 rounded-md">
        <View>
            <View className="flex flex-row items-center">
                <Text className="text-white font-bold text-2xl flex-1">Reward</Text>
                {
                    rewardClaimed ?
                        <Ionicons name="checkmark-done-circle" size={28} color="#C8FF00" />
                        : <></>
                }
                <HighlightButton disabled={rewardClaimed} type="primary" text={rewardClaimed ? "Claimed Reward" : "Claim Reward"} onPress={e => claimReward()} isLoading={loading} />
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
}

const RewardItem = ({ icon, points, unit }) => (
    <View className="flex flex-row">
        <Image source={icon} className="w-[30px] h-[40px] mr-1" resizeMode="contain" />
        <View className="flex">
            <Text className="text-clr-light font-bold text-sm">{points}</Text>
            <Text className="text-clr-light text-xs">{unit}</Text>
        </View>
    </View>
)

export default QuestScreen;