import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import { useEffect, useState } from 'react';
import { Button, FlatList, Image, Text, View } from 'react-native';
import { CommunityData, QuestData, QuestEntryData, QuestUserEntryProgress, QuestUserProgress, hasProgress } from '../Models/Quest';
import QuestService from '../services/QuestService';

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
            <Text className="text-clr-light text-xl font-bold py-1 px-1">{quest?.questName}</Text>
        </CommunityTitle>
        <FlatList
            className="flex-1 pt-2 mb-2"
            data={quest?.entries}
            renderItem={({ item, index }) => {
                return <QuestEntryBar entry={item} entryProgress={questProgress?.getEntryProgress(item.entryId) ?? null} />
            }}
        />
        <View>
            <Button title="Claim Reward" />
        </View>
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
        <View className="flex flex-row justify-start items-center p-2">
            <Image
                className="w-12 h-12"
                source={logo}
            />
            <Text className="px-2 text-clr-light text-xl font-bold">{communityData.name}</Text>

            {communityData.verified ? <View className=" bg-green-300 rounded-full p-[2px] border border-black">
                <Ionicons name="shield-checkmark-outline" size={20} color="black" />
            </View> : <></>}
        </View>
        <View className="flex p-2">
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
    return <View className="my-1 p-2 bg-clr-bglight rounded-md border border-green-300 flex">
        {entry.getEntryTitleDom()}
        <View>
            <EntryProgress entry={entry} entryProgress={entryProgress} />
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
            <Text className={textClass}>Progress: (3/4)</Text>
        </View>
    }
    return dom;
}

export default QuestScreen;